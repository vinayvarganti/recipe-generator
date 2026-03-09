const express = require('express');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth and adminAuth to all routes
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
        }
      }
    ]);

    // Recipe statistics
    const recipeStats = await Recipe.aggregate([
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          averageRating: { $avg: '$userInteraction.averageRating' },
          totalRatings: { $sum: '$userInteraction.totalRatings' }
        }
      }
    ]);

    // Ingredient statistics
    const ingredientStats = await Ingredient.aggregate([
      {
        $group: {
          _id: null,
          totalIngredients: { $sum: 1 },
          verifiedIngredients: { $sum: { $cond: ['$metadata.verified', 1, 0] } }
        }
      }
    ]);

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt isActive');

    const recentRecipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userInteraction.createdBy', 'username')
      .select('name metadata.cuisine userInteraction.averageRating createdAt');

    // Monthly trends
    const monthlyUserTrend = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const monthlyRecipeTrend = await Recipe.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const dashboardData = {
      statistics: {
        users: userStats[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0 },
        recipes: recipeStats[0] || { totalRecipes: 0, averageRating: 0, totalRatings: 0 },
        ingredients: ingredientStats[0] || { totalIngredients: 0, verifiedIngredients: 0 }
      },
      recentActivity: {
        users: recentUsers,
        recipes: recentRecipes
      },
      trends: {
        users: monthlyUserTrend,
        recipes: monthlyRecipeTrend
      }
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')
      .populate('generatedRecipes', 'name createdAt')
      .populate('favoriteRecipes', 'name createdAt');

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (activate/deactivate, change role)
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user.userId && isActive === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    // Prevent admin from changing their own role
    if (userId === req.user.userId && role && role !== user.role) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// @route   GET /api/admin/recipes
// @desc    Get all recipes with filtering
// @access  Admin
router.get('/recipes', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      cuisine,
      status,
      minRating
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (cuisine) filter['metadata.cuisine'] = cuisine;
    if (status) filter.status = status;
    if (minRating) filter['userInteraction.averageRating'] = { $gte: parseFloat(minRating) };

    const recipes = await Recipe.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userInteraction.createdBy', 'username email')
      .select('name description metadata userInteraction status createdAt');

    const total = await Recipe.countDocuments(filter);

    res.json({
      recipes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

// @route   PUT /api/admin/recipes/:id
// @desc    Update recipe status
// @access  Admin
router.put('/recipes/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const recipeId = req.params.id;

    if (!['active', 'archived', 'flagged'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.status = status;
    await recipe.save();

    res.json({
      message: 'Recipe status updated successfully',
      recipe: {
        id: recipe._id,
        name: recipe.name,
        status: recipe.status
      }
    });

  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ message: 'Failed to update recipe' });
  }
});

// @route   GET /api/admin/ingredients
// @desc    Get all ingredients for management
// @access  Admin
router.get('/ingredients', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      verified
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aliases: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (verified !== undefined) filter['metadata.verified'] = verified === 'true';

    const ingredients = await Ingredient.find(filter)
      .sort({ 'metadata.usageCount': -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

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

// @route   PUT /api/admin/ingredients/:id
// @desc    Update ingredient verification status
// @access  Admin
router.put('/ingredients/:id', async (req, res) => {
  try {
    const { verified, confidence } = req.body;
    const ingredientId = req.params.id;

    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    if (verified !== undefined) ingredient.metadata.verified = verified;
    if (confidence !== undefined) ingredient.metadata.confidence = confidence;
    ingredient.metadata.lastUpdated = new Date();

    await ingredient.save();

    res.json({
      message: 'Ingredient updated successfully',
      ingredient: {
        id: ingredient._id,
        name: ingredient.name,
        verified: ingredient.metadata.verified,
        confidence: ingredient.metadata.confidence
      }
    });

  } catch (error) {
    console.error('Update ingredient error:', error);
    res.status(500).json({ message: 'Failed to update ingredient' });
  }
});

// @route   GET /api/admin/feedback
// @desc    Get user feedback for analysis
// @access  Admin
router.get('/feedback', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      minRating,
      maxRating
    } = req.query;

    const skip = (page - 1) * limit;

    // Get feedback from all users
    const users = await User.find({})
      .populate({
        path: 'feedbackHistory.recipeId',
        select: 'name metadata.cuisine'
      })
      .select('username feedbackHistory');

    // Flatten and filter feedback
    let allFeedback = [];
    users.forEach(user => {
      user.feedbackHistory.forEach(feedback => {
        if (feedback.recipeId) {
          allFeedback.push({
            id: feedback._id,
            user: user.username,
            recipe: {
              id: feedback.recipeId._id,
              name: feedback.recipeId.name,
              cuisine: feedback.recipeId.metadata.cuisine
            },
            rating: feedback.rating,
            feedback: feedback.feedback,
            createdAt: feedback.createdAt
          });
        }
      });
    });

    // Apply filters
    if (minRating) {
      allFeedback = allFeedback.filter(f => f.rating >= parseInt(minRating));
    }
    if (maxRating) {
      allFeedback = allFeedback.filter(f => f.rating <= parseInt(maxRating));
    }

    // Sort by date
    allFeedback.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = allFeedback.length;
    const paginatedFeedback = allFeedback.slice(skip, skip + parseInt(limit));

    res.json({
      feedback: paginatedFeedback,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

module.exports = router;