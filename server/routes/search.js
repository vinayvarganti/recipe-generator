const express = require('express');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/search/recipes
// @desc    Advanced recipe search with multiple filters
// @access  Private
router.get('/recipes', auth, async (req, res) => {
  try {
    const {
      q, // search query
      cuisine,
      difficulty,
      maxTime,
      minRating,
      dietary,
      ingredients,
      excludeIngredients,
      maxCalories,
      minCalories,
      sortBy = 'relevance',
      page = 1,
      limit = 12
    } = req.query;

    const skip = (page - 1) * limit;
    let searchFilter = { status: 'active' };
    let sortOptions = {};

    // Text search
    if (q) {
      searchFilter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'ingredients.name': { $regex: q, $options: 'i' } },
        { 'metadata.cuisine': { $regex: q, $options: 'i' } }
      ];
    }

    // Filters
    if (cuisine) {
      searchFilter['metadata.cuisine'] = { $in: cuisine.split(',') };
    }

    if (difficulty) {
      searchFilter['metadata.difficulty'] = { $in: difficulty.split(',') };
    }

    if (maxTime) {
      searchFilter['metadata.cookingTime'] = { $lte: parseInt(maxTime) };
    }

    if (minRating) {
      searchFilter['userInteraction.averageRating'] = { $gte: parseFloat(minRating) };
    }

    if (dietary) {
      searchFilter['metadata.dietaryTags'] = { $in: dietary.split(',') };
    }

    if (ingredients) {
      const ingredientList = ingredients.split(',');
      searchFilter['ingredients.name'] = { $in: ingredientList.map(ing => new RegExp(ing, 'i')) };
    }

    if (excludeIngredients) {
      const excludeList = excludeIngredients.split(',');
      searchFilter['ingredients.name'] = { 
        ...searchFilter['ingredients.name'],
        $nin: excludeList.map(ing => new RegExp(ing, 'i'))
      };
    }

    if (maxCalories || minCalories) {
      searchFilter['nutritionalInfo.calories'] = {};
      if (maxCalories) searchFilter['nutritionalInfo.calories'].$lte = parseInt(maxCalories);
      if (minCalories) searchFilter['nutritionalInfo.calories'].$gte = parseInt(minCalories);
    }

    // Sorting
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'userInteraction.averageRating': -1, 'userInteraction.totalRatings': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'cookingTime':
        sortOptions = { 'metadata.cookingTime': 1 };
        break;
      case 'calories':
        sortOptions = { 'nutritionalInfo.calories': 1 };
        break;
      default:
        sortOptions = { 'userInteraction.averageRating': -1, createdAt: -1 };
    }

    const recipes = await Recipe.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userInteraction.createdBy', 'username')
      .select('name description ingredients metadata nutritionalInfo userInteraction createdAt');

    const total = await Recipe.countDocuments(searchFilter);

    // Get search suggestions
    const suggestions = await generateSearchSuggestions(q, searchFilter);

    res.json({
      recipes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      filters: {
        applied: {
          query: q,
          cuisine: cuisine?.split(','),
          difficulty: difficulty?.split(','),
          dietary: dietary?.split(','),
          maxTime,
          minRating,
          ingredients: ingredients?.split(','),
          excludeIngredients: excludeIngredients?.split(',')
        }
      },
      suggestions,
      sortBy
    });

  } catch (error) {
    console.error('Recipe search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// @route   GET /api/search/ingredients
// @desc    Search ingredients with autocomplete
// @access  Private
router.get('/ingredients', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ ingredients: [] });
    }

    const ingredients = await Ingredient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { aliases: { $regex: q, $options: 'i' } }
      ],
      'metadata.verified': true
    })
    .sort({ 'metadata.usageCount': -1, name: 1 })
    .limit(parseInt(limit))
    .select('name category aliases');

    res.json({
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        category: ing.category,
        aliases: ing.aliases
      }))
    });

  } catch (error) {
    console.error('Ingredient search error:', error);
    res.status(500).json({ message: 'Ingredient search failed' });
  }
});

// @route   GET /api/search/similar-recipes/:id
// @desc    Find similar recipes based on ingredients and cuisine
// @access  Private
router.get('/similar-recipes/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Extract ingredients and cuisine for similarity matching
    const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
    const recipeCuisine = recipe.metadata.cuisine;

    // Find similar recipes
    const similarRecipes = await Recipe.find({
      _id: { $ne: id },
      status: 'active',
      $or: [
        { 'metadata.cuisine': recipeCuisine },
        { 'ingredients.name': { $in: recipeIngredients } }
      ]
    })
    .sort({ 'userInteraction.averageRating': -1 })
    .limit(parseInt(limit))
    .populate('userInteraction.createdBy', 'username')
    .select('name description metadata userInteraction createdAt');

    // Calculate similarity scores
    const recipesWithScores = similarRecipes.map(similarRecipe => {
      let score = 0;
      
      // Cuisine match
      if (similarRecipe.metadata.cuisine === recipeCuisine) {
        score += 30;
      }

      // Ingredient overlap
      const similarIngredients = similarRecipe.ingredients.map(ing => ing.name.toLowerCase());
      const commonIngredients = recipeIngredients.filter(ing => 
        similarIngredients.some(simIng => simIng.includes(ing) || ing.includes(simIng))
      );
      score += (commonIngredients.length / recipeIngredients.length) * 50;

      // Difficulty match
      if (similarRecipe.metadata.difficulty === recipe.metadata.difficulty) {
        score += 10;
      }

      // Cooking time similarity
      const timeDiff = Math.abs(similarRecipe.metadata.cookingTime - recipe.metadata.cookingTime);
      if (timeDiff <= 15) score += 10;

      return {
        ...similarRecipe.toObject(),
        similarityScore: Math.round(score)
      };
    });

    // Sort by similarity score
    recipesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

    res.json({
      originalRecipe: {
        id: recipe._id,
        name: recipe.name,
        cuisine: recipe.metadata.cuisine
      },
      similarRecipes: recipesWithScores
    });

  } catch (error) {
    console.error('Similar recipes search error:', error);
    res.status(500).json({ message: 'Failed to find similar recipes' });
  }
});

// @route   GET /api/search/trending
// @desc    Get trending recipes and ingredients
// @access  Private
router.get('/trending', auth, async (req, res) => {
  try {
    const { type = 'recipes', period = 'week' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case 'day':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    if (type === 'recipes') {
      // Trending recipes based on recent ratings and views
      const trendingRecipes = await Recipe.find({
        status: 'active',
        createdAt: { $gte: dateFilter }
      })
      .sort({ 
        'userInteraction.totalRatings': -1, 
        'userInteraction.averageRating': -1,
        'userInteraction.timesGenerated': -1
      })
      .limit(10)
      .populate('userInteraction.createdBy', 'username')
      .select('name description metadata userInteraction createdAt');

      res.json({
        type: 'recipes',
        period,
        trending: trendingRecipes
      });

    } else if (type === 'ingredients') {
      // Trending ingredients based on usage in recent recipes
      const trendingIngredients = await Recipe.aggregate([
        { $match: { createdAt: { $gte: dateFilter }, status: 'active' } },
        { $unwind: '$ingredients' },
        { 
          $group: { 
            _id: '$ingredients.name', 
            count: { $sum: 1 },
            avgRating: { $avg: '$userInteraction.averageRating' }
          } 
        },
        { $sort: { count: -1, avgRating: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        type: 'ingredients',
        period,
        trending: trendingIngredients.map(item => ({
          name: item._id,
          usageCount: item.count,
          averageRating: item.avgRating
        }))
      });

    } else if (type === 'cuisines') {
      // Trending cuisines
      const trendingCuisines = await Recipe.aggregate([
        { $match: { createdAt: { $gte: dateFilter }, status: 'active' } },
        { 
          $group: { 
            _id: '$metadata.cuisine', 
            count: { $sum: 1 },
            avgRating: { $avg: '$userInteraction.averageRating' }
          } 
        },
        { $sort: { count: -1, avgRating: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        type: 'cuisines',
        period,
        trending: trendingCuisines.map(item => ({
          cuisine: item._id,
          recipeCount: item.count,
          averageRating: item.avgRating
        }))
      });
    }

  } catch (error) {
    console.error('Trending search error:', error);
    res.status(500).json({ message: 'Failed to get trending data' });
  }
});

// Helper function to generate search suggestions
async function generateSearchSuggestions(query, currentFilter) {
  if (!query || query.length < 3) return [];

  try {
    // Get popular cuisines
    const cuisines = await Recipe.distinct('metadata.cuisine', { status: 'active' });
    
    // Get popular ingredients
    const ingredients = await Ingredient.find({
      name: { $regex: query, $options: 'i' },
      'metadata.verified': true
    })
    .sort({ 'metadata.usageCount': -1 })
    .limit(5)
    .select('name');

    const suggestions = [];

    // Add cuisine suggestions
    cuisines.forEach(cuisine => {
      if (cuisine.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          type: 'cuisine',
          text: cuisine,
          query: `cuisine:${cuisine}`
        });
      }
    });

    // Add ingredient suggestions
    ingredients.forEach(ingredient => {
      suggestions.push({
        type: 'ingredient',
        text: ingredient.name,
        query: `ingredients:${ingredient.name}`
      });
    });

    return suggestions.slice(0, 8);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}

module.exports = router;