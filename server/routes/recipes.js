const express = require('express');
const Joi = require('joi');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const GeminiRecipeEngine = require('../../ai-engine/GeminiRecipeEngine');

const router = express.Router();
const aiEngine = new GeminiRecipeEngine();

// Validation schemas
const generateRecipeSchema = Joi.object({
  ingredients: Joi.array().items(Joi.string()).min(2).max(20).required(),
  constraints: Joi.object({
    dietaryPreference: Joi.string().valid('vegetarian', 'vegan', 'non-vegetarian', 'pescatarian', 'keto', 'paleo').optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    calorieLimit: Joi.number().min(100).max(5000).optional(),
    cookingTime: Joi.number().min(5).max(480).optional(),
    cuisine: Joi.string().optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    servings: Joi.number().min(1).max(12).optional()
  }).optional(),
  userPreferences: Joi.object().optional()
});

const ratingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  feedback: Joi.string().max(1000).optional()
});

// @route   POST /api/recipes/generate
// @desc    Generate a new recipe using AI
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    console.log('🚀 Recipe generation request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Validate input
    const { error } = generateRecipeSchema.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { ingredients, constraints = {}, userPreferences = {} } = req.body;
    const userId = req.user.userId;

    console.log('✅ Validation passed');
    console.log('Ingredients:', ingredients);
    console.log('Constraints:', constraints);
    console.log('User ID:', userId);

    // Get user context for personalization
    console.log('📋 Fetching user context...');
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.username);

    const userContext = {
      dietaryPreferences: user.profile?.dietaryPreferences || [],
      allergies: user.profile?.allergies || [],
      favoriteIngredients: user.profile?.favoriteIngredients || [],
      favoriteCuisines: user.profile?.favoriteCuisines || [],
      preferences: user.preferences || {},
      ...userPreferences
    };

    // Merge user preferences with constraints
    const mergedConstraints = {
      dietaryPreference: constraints.dietaryPreference || userContext.dietaryPreferences[0],
      allergies: [...(constraints.allergies || []), ...userContext.allergies],
      calorieLimit: constraints.calorieLimit || userContext.preferences?.defaultCalorieLimit || 2000,
      cookingTime: constraints.cookingTime || userContext.preferences?.defaultCookingTime || 60,
      cuisine: constraints.cuisine || userContext.favoriteCuisines[0] || 'american',
      difficulty: constraints.difficulty || userContext.preferences?.preferredDifficulty || 'medium',
      servings: constraints.servings || 4
    };

    console.log('🔧 Merged constraints:', mergedConstraints);

    // Generate recipe using AI engine
    console.log('🤖 Generating recipe with AI engine...');
    const generatedRecipe = await aiEngine.generateRecipe(
      ingredients,
      mergedConstraints,
      userContext
    );

    console.log('✅ Recipe generated successfully:', generatedRecipe.name);

    // Create recipe document
    console.log('💾 Saving recipe to database...');
    const recipe = new Recipe({
      ...generatedRecipe,
      userInteraction: {
        createdBy: userId,
        ratings: [],
        averageRating: 0,
        totalRatings: 0
      }
    });

    await recipe.save();
    console.log('✅ Recipe saved to database with ID:', recipe._id);

    // Add recipe to user's generated recipes
    user.generatedRecipes.push(recipe._id);
    await user.save();
    console.log('✅ Recipe added to user profile');

    res.status(201).json({
      message: 'Recipe generated successfully',
      recipe: recipe
    });

  } catch (error) {
    console.error('❌ Recipe generation error:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation Error [${key}]: ${error.errors[key].message}`);
      });
    }
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to generate recipe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/recipes/my-recipes
// @desc    Get user's generated recipes
// @access  Private
router.get('/my-recipes', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ 'userInteraction.createdBy': req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userInteraction.createdBy', 'username');

    const total = await Recipe.countDocuments({ 'userInteraction.createdBy': req.user.userId });

    res.json({
      recipes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get recipe by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('userInteraction.createdBy', 'username')
      .populate('userInteraction.ratings.userId', 'username');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user has access to this recipe
    if (recipe.userInteraction.createdBy._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ recipe });

  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ message: 'Failed to fetch recipe' });
  }
});

// @route   POST /api/recipes/:id/rate
// @desc    Rate a recipe and provide feedback
// @access  Private
router.post('/:id/rate', auth, async (req, res) => {
  try {
    // Validate input
    const { error } = ratingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { rating, feedback } = req.body;
    const userId = req.user.userId;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user already rated this recipe
    const existingRatingIndex = recipe.userInteraction.ratings.findIndex(
      r => r.userId.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      recipe.userInteraction.ratings[existingRatingIndex] = {
        userId,
        rating,
        feedback: feedback || '',
        createdAt: new Date()
      };
    } else {
      // Add new rating
      recipe.userInteraction.ratings.push({
        userId,
        rating,
        feedback: feedback || '',
        createdAt: new Date()
      });
    }

    // Update average rating
    recipe.updateAverageRating();
    await recipe.save();

    // Get user for learning
    const user = await User.findById(userId);

    // Add feedback to user's history
    user.feedbackHistory.push({
      recipeId: recipe._id,
      rating,
      feedback: feedback || '',
      createdAt: new Date()
    });
    await user.save();

    // Learn from feedback using AI engine
    await aiEngine.learnFromFeedback(
      recipe.aiGeneration.generationId,
      rating,
      feedback,
      user.profile
    );

    res.json({
      message: 'Rating submitted successfully',
      averageRating: recipe.userInteraction.averageRating,
      totalRatings: recipe.userInteraction.totalRatings
    });

  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

// @route   POST /api/recipes/:id/favorite
// @desc    Add/remove recipe from favorites
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const recipeId = req.params.id;

    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const isFavorited = user.favoriteRecipes.includes(recipeId);

    if (isFavorited) {
      // Remove from favorites
      user.favoriteRecipes = user.favoriteRecipes.filter(
        id => id.toString() !== recipeId
      );
      recipe.userInteraction.isFavorited = false;
    } else {
      // Add to favorites
      user.favoriteRecipes.push(recipeId);
      recipe.userInteraction.isFavorited = true;
    }

    await user.save();
    await recipe.save();

    res.json({
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });

  } catch (error) {
    console.error('Favorite error:', error);
    res.status(500).json({ message: 'Failed to update favorites' });
  }
});

// @route   GET /api/recipes/search
// @desc    Search recipes with filters
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const {
      query,
      cuisine,
      dietaryTags,
      difficulty,
      maxCookingTime,
      minRating,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;
    const searchFilter = {};

    // Text search
    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'ingredients.name': { $regex: query, $options: 'i' } }
      ];
    }

    // Filters
    if (cuisine) searchFilter['metadata.cuisine'] = cuisine;
    if (dietaryTags) searchFilter['metadata.dietaryTags'] = { $in: dietaryTags.split(',') };
    if (difficulty) searchFilter['metadata.difficulty'] = difficulty;
    if (maxCookingTime) searchFilter['metadata.cookingTime'] = { $lte: parseInt(maxCookingTime) };
    if (minRating) searchFilter['userInteraction.averageRating'] = { $gte: parseFloat(minRating) };

    const recipes = await Recipe.find(searchFilter)
      .sort({ 'userInteraction.averageRating': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userInteraction.createdBy', 'username');

    const total = await Recipe.countDocuments(searchFilter);

    res.json({
      recipes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// @route   GET /api/recipes/engine/status
// @desc    Get current AI engine status
// @access  Private
router.get('/engine/status', auth, async (req, res) => {
  try {
    const status = aiEngine.getEngineStatus();
    res.json({
      message: 'Engine status retrieved successfully',
      status: status
    });
  } catch (error) {
    console.error('Engine status error:', error);
    res.status(500).json({ message: 'Failed to get engine status' });
  }
});

// @route   POST /api/recipes/engine/reset-gemini
// @desc    Reset Gemini API usage (admin only)
// @access  Private
router.post('/engine/reset-gemini', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    aiEngine.resetGeminiUsage();
    const status = aiEngine.getEngineStatus();

    res.json({
      message: 'Gemini API usage reset successfully',
      status: status
    });
  } catch (error) {
    console.error('Reset Gemini error:', error);
    res.status(500).json({ message: 'Failed to reset Gemini usage' });
  }
});

module.exports = router;