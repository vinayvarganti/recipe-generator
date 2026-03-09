const express = require('express');
const Joi = require('joi');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/nutrition/calculate
// @desc    Calculate nutritional information for ingredients
// @access  Private
router.post('/calculate', auth, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients array is required' });
    }

    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0
    };

    const nutritionBreakdown = [];

    for (const ingredient of ingredients) {
      const ingredientData = await Ingredient.findOne({ 
        name: ingredient.name.toLowerCase() 
      });

      if (ingredientData && ingredientData.nutritionalInfo) {
        // Convert quantity to grams (simplified conversion)
        const quantityInGrams = convertToGrams(ingredient.quantity, ingredient.unit);
        const multiplier = quantityInGrams / 100; // nutritional info is per 100g

        const ingredientNutrition = {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          nutrition: {
            calories: Math.round((ingredientData.nutritionalInfo.caloriesPerUnit || 0) * multiplier),
            protein: Math.round((ingredientData.nutritionalInfo.protein || 0) * multiplier * 10) / 10,
            carbohydrates: Math.round((ingredientData.nutritionalInfo.carbohydrates || 0) * multiplier * 10) / 10,
            fat: Math.round((ingredientData.nutritionalInfo.fat || 0) * multiplier * 10) / 10,
            fiber: Math.round((ingredientData.nutritionalInfo.fiber || 0) * multiplier * 10) / 10,
            sugar: Math.round((ingredientData.nutritionalInfo.sugar || 0) * multiplier * 10) / 10,
            sodium: Math.round((ingredientData.nutritionalInfo.sodium || 0) * multiplier),
            cholesterol: Math.round((ingredientData.nutritionalInfo.cholesterol || 0) * multiplier)
          }
        };

        nutritionBreakdown.push(ingredientNutrition);

        // Add to totals
        Object.keys(totalNutrition).forEach(key => {
          totalNutrition[key] += ingredientNutrition.nutrition[key] || 0;
        });
      }
    }

    // Round totals
    Object.keys(totalNutrition).forEach(key => {
      totalNutrition[key] = Math.round(totalNutrition[key] * 10) / 10;
    });

    res.json({
      totalNutrition,
      nutritionBreakdown,
      servings: req.body.servings || 1,
      nutritionPerServing: {
        calories: Math.round(totalNutrition.calories / (req.body.servings || 1)),
        protein: Math.round((totalNutrition.protein / (req.body.servings || 1)) * 10) / 10,
        carbohydrates: Math.round((totalNutrition.carbohydrates / (req.body.servings || 1)) * 10) / 10,
        fat: Math.round((totalNutrition.fat / (req.body.servings || 1)) * 10) / 10,
        fiber: Math.round((totalNutrition.fiber / (req.body.servings || 1)) * 10) / 10,
        sugar: Math.round((totalNutrition.sugar / (req.body.servings || 1)) * 10) / 10,
        sodium: Math.round(totalNutrition.sodium / (req.body.servings || 1)),
        cholesterol: Math.round(totalNutrition.cholesterol / (req.body.servings || 1))
      }
    });

  } catch (error) {
    console.error('Nutrition calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate nutrition' });
  }
});

// @route   GET /api/nutrition/daily-values
// @desc    Get daily recommended values
// @access  Private
router.get('/daily-values', auth, (req, res) => {
  const dailyValues = {
    calories: 2000,
    protein: 50, // grams
    carbohydrates: 300, // grams
    fat: 65, // grams
    fiber: 25, // grams
    sugar: 50, // grams (added sugars)
    sodium: 2300, // mg
    cholesterol: 300 // mg
  };

  res.json({ dailyValues });
});

// @route   POST /api/nutrition/analyze-recipe
// @desc    Analyze nutritional quality of a recipe
// @access  Private
router.post('/analyze-recipe', auth, async (req, res) => {
  try {
    const { recipeId } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const nutrition = recipe.nutritionalInfo;
    const servings = recipe.metadata.servings;

    // Calculate nutritional analysis
    const analysis = {
      healthScore: calculateHealthScore(nutrition, servings),
      macroBalance: analyzeMacroBalance(nutrition),
      micronutrients: analyzeMicronutrients(nutrition),
      dietaryFlags: analyzeDietaryFlags(nutrition, servings),
      recommendations: generateNutritionalRecommendations(nutrition, servings)
    };

    res.json({
      recipe: {
        id: recipe._id,
        name: recipe.name,
        servings: servings
      },
      nutrition,
      analysis
    });

  } catch (error) {
    console.error('Recipe nutrition analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze recipe nutrition' });
  }
});

// Helper functions
function convertToGrams(quantity, unit) {
  const conversions = {
    'cup': 240,
    'cups': 240,
    'tablespoon': 15,
    'tablespoons': 15,
    'tbsp': 15,
    'teaspoon': 5,
    'teaspoons': 5,
    'tsp': 5,
    'ounce': 28,
    'ounces': 28,
    'oz': 28,
    'pound': 454,
    'pounds': 454,
    'lb': 454,
    'gram': 1,
    'grams': 1,
    'g': 1,
    'kilogram': 1000,
    'kg': 1000,
    'liter': 1000,
    'liters': 1000,
    'l': 1000,
    'milliliter': 1,
    'ml': 1,
    'piece': 100,
    'pieces': 100,
    'whole': 150,
    'medium': 120,
    'large': 180,
    'small': 80
  };

  const numericQuantity = parseFloat(quantity) || 1;
  const unitLower = unit.toLowerCase();
  
  return numericQuantity * (conversions[unitLower] || 100);
}

function calculateHealthScore(nutrition, servings) {
  const perServing = {
    calories: nutrition.calories / servings,
    protein: nutrition.protein / servings,
    fiber: nutrition.fiber / servings,
    sodium: nutrition.sodium / servings,
    sugar: nutrition.sugar / servings
  };

  let score = 50; // Base score

  // Positive factors
  if (perServing.protein >= 10) score += 10;
  if (perServing.fiber >= 3) score += 10;
  if (perServing.calories <= 400) score += 10;

  // Negative factors
  if (perServing.sodium > 600) score -= 10;
  if (perServing.sugar > 15) score -= 10;
  if (perServing.calories > 800) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function analyzeMacroBalance(nutrition) {
  const totalCalories = nutrition.calories;
  const proteinCals = nutrition.protein * 4;
  const carbCals = nutrition.carbohydrates * 4;
  const fatCals = nutrition.fat * 9;

  return {
    protein: Math.round((proteinCals / totalCalories) * 100),
    carbohydrates: Math.round((carbCals / totalCalories) * 100),
    fat: Math.round((fatCals / totalCalories) * 100)
  };
}

function analyzeMicronutrients(nutrition) {
  return {
    fiber: nutrition.fiber >= 5 ? 'Good' : nutrition.fiber >= 2 ? 'Fair' : 'Low',
    sodium: nutrition.sodium <= 600 ? 'Low' : nutrition.sodium <= 1200 ? 'Moderate' : 'High'
  };
}

function analyzeDietaryFlags(nutrition, servings) {
  const perServing = {
    calories: nutrition.calories / servings,
    sodium: nutrition.sodium / servings,
    sugar: nutrition.sugar / servings,
    cholesterol: nutrition.cholesterol / servings
  };

  const flags = [];

  if (perServing.calories > 600) flags.push('High Calorie');
  if (perServing.sodium > 800) flags.push('High Sodium');
  if (perServing.sugar > 20) flags.push('High Sugar');
  if (perServing.cholesterol > 100) flags.push('High Cholesterol');
  if (nutrition.fiber / servings >= 5) flags.push('High Fiber');
  if (nutrition.protein / servings >= 15) flags.push('High Protein');

  return flags;
}

function generateNutritionalRecommendations(nutrition, servings) {
  const recommendations = [];
  const perServing = {
    fiber: nutrition.fiber / servings,
    sodium: nutrition.sodium / servings,
    protein: nutrition.protein / servings
  };

  if (perServing.fiber < 3) {
    recommendations.push('Consider adding more vegetables or whole grains for fiber');
  }
  if (perServing.sodium > 600) {
    recommendations.push('Try reducing salt or using herbs and spices for flavor');
  }
  if (perServing.protein < 10) {
    recommendations.push('Consider adding lean protein sources');
  }

  return recommendations;
}

module.exports = router;