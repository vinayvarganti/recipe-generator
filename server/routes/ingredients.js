const express = require('express');
const Joi = require('joi');
const Ingredient = require('../models/Ingredient');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/ingredients
// @desc    Get all ingredients with search and filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      search,
      category,
      cuisine,
      dietary,
      page = 1,
      limit = 50
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { 'metadata.verified': true };

    // Search by name or aliases
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aliases: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by cuisine compatibility
    if (cuisine) {
      filter['compatibility.cuisineCompatibility'] = cuisine;
    }

    // Filter by dietary restrictions
    if (dietary) {
      const dietaryFilters = dietary.split(',');
      dietaryFilters.forEach(diet => {
        switch (diet.toLowerCase()) {
          case 'vegetarian':
            filter['dietaryInfo.isVegetarian'] = true;
            break;
          case 'vegan':
            filter['dietaryInfo.isVegan'] = true;
            break;
          case 'gluten-free':
            filter['dietaryInfo.isGlutenFree'] = true;
            break;
          case 'dairy-free':
            filter['dietaryInfo.isDairyFree'] = true;
            break;
        }
      });
    }

    const ingredients = await Ingredient.find(filter)
      .sort({ 'metadata.usageCount': -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name aliases category nutritionalInfo.caloriesPerUnit compatibility.cuisineCompatibility dietaryInfo');

    const total = await Ingredient.countDocuments(filter);

    res.json({
      ingredients,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({ message: 'Failed to fetch ingredients' });
  }
});

// @route   GET /api/ingredients/categories
// @desc    Get all ingredient categories
// @access  Private
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Ingredient.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// @route   GET /api/ingredients/cuisines
// @desc    Get all cuisine types
// @access  Private
router.get('/cuisines', auth, async (req, res) => {
  try {
    const cuisines = await Ingredient.distinct('compatibility.cuisineCompatibility');
    res.json({ cuisines: cuisines.filter(Boolean) });
  } catch (error) {
    console.error('Get cuisines error:', error);
    res.status(500).json({ message: 'Failed to fetch cuisines' });
  }
});

// @route   GET /api/ingredients/:id
// @desc    Get ingredient details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    // Increment usage count
    ingredient.metadata.usageCount += 1;
    await ingredient.save();

    res.json({ ingredient });

  } catch (error) {
    console.error('Get ingredient error:', error);
    res.status(500).json({ message: 'Failed to fetch ingredient' });
  }
});

// @route   GET /api/ingredients/:id/compatible
// @desc    Get compatible ingredients
// @access  Private
router.get('/:id/compatible', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    const compatibleIngredients = await ingredient.findCompatibleIngredients();
    
    res.json({ 
      ingredient: ingredient.name,
      compatibleIngredients: compatibleIngredients.map(ing => ({
        id: ing._id,
        name: ing.name,
        category: ing.category,
        compatibility: ing.compatibility.pairsWellWith.includes(ingredient.name) ? 'high' : 'medium'
      }))
    });

  } catch (error) {
    console.error('Get compatible ingredients error:', error);
    res.status(500).json({ message: 'Failed to fetch compatible ingredients' });
  }
});

// @route   POST /api/ingredients/suggest
// @desc    Get ingredient suggestions based on input
// @access  Private
router.post('/suggest', auth, async (req, res) => {
  try {
    const { ingredients, constraints = {} } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients array is required' });
    }

    // Find existing ingredients
    const existingIngredients = await Ingredient.find({
      name: { $in: ingredients.map(ing => ing.toLowerCase()) }
    });

    // Get suggestions based on compatibility
    const suggestions = new Set();
    
    for (const ingredient of existingIngredients) {
      // Add compatible ingredients
      ingredient.compatibility.pairsWellWith.forEach(compatible => {
        if (!ingredients.includes(compatible)) {
          suggestions.add(compatible);
        }
      });

      // Add complementary ingredients from AI knowledge
      ingredient.aiKnowledge.complementaryIngredients.forEach(comp => {
        if (comp.confidence > 0.7 && !ingredients.includes(comp.ingredient)) {
          suggestions.add(comp.ingredient);
        }
      });
    }

    // Filter suggestions based on constraints
    let filteredSuggestions = await Ingredient.find({
      name: { $in: Array.from(suggestions) }
    });

    // Apply dietary constraints
    if (constraints.dietaryPreference) {
      filteredSuggestions = filteredSuggestions.filter(ing => 
        ing.checkDietaryCompatibility(constraints.dietaryPreference)
      );
    }

    // Remove allergens
    if (constraints.allergies && constraints.allergies.length > 0) {
      filteredSuggestions = filteredSuggestions.filter(ing => 
        !ing.dietaryInfo.commonAllergens.some(allergen => 
          constraints.allergies.includes(allergen)
        )
      );
    }

    // Sort by compatibility score and usage
    filteredSuggestions.sort((a, b) => {
      const aScore = a.metadata.usageCount * a.metadata.confidence;
      const bScore = b.metadata.usageCount * b.metadata.confidence;
      return bScore - aScore;
    });

    res.json({
      suggestions: filteredSuggestions.slice(0, 10).map(ing => ({
        id: ing._id,
        name: ing.name,
        category: ing.category,
        reason: 'Compatible with your ingredients'
      }))
    });

  } catch (error) {
    console.error('Ingredient suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
});

module.exports = router;