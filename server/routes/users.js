const express = require('express');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user with populated data
    const user = await User.findById(userId)
      .populate({
        path: 'generatedRecipes',
        options: { sort: { createdAt: -1 }, limit: 5 },
        select: 'name createdAt userInteraction.averageRating metadata.cuisine'
      })
      .populate({
        path: 'favoriteRecipes',
        options: { sort: { createdAt: -1 }, limit: 5 },
        select: 'name createdAt userInteraction.averageRating metadata.cuisine'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recipe statistics
    const recipeStats = await Recipe.aggregate([
      { $match: { 'userInteraction.createdBy': user._id } },
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          averageRating: { $avg: '$userInteraction.averageRating' },
          totalRatings: { $sum: '$userInteraction.totalRatings' },
          cuisineDistribution: { $push: '$metadata.cuisine' }
        }
      }
    ]);

    // Get recent feedback
    const recentFeedback = user.feedbackHistory
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    // Calculate cuisine preferences
    const cuisineCount = {};
    if (recipeStats.length > 0) {
      recipeStats[0].cuisineDistribution.forEach(cuisine => {
        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
      });
    }

    const dashboardData = {
      user: {
        id: user._id,
        username: user.username,
        profile: user.profile,
        preferences: user.preferences,
        memberSince: user.createdAt
      },
      statistics: {
        totalRecipes: recipeStats.length > 0 ? recipeStats[0].totalRecipes : 0,
        averageRating: recipeStats.length > 0 ? recipeStats[0].averageRating : 0,
        totalRatings: recipeStats.length > 0 ? recipeStats[0].totalRatings : 0,
        favoriteRecipesCount: user.favoriteRecipes.length,
        cuisinePreferences: Object.entries(cuisineCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([cuisine, count]) => ({ cuisine, count }))
      },
      recentRecipes: user.generatedRecipes,
      favoriteRecipes: user.favoriteRecipes,
      recentFeedback: recentFeedback.map(feedback => ({
        recipeId: feedback.recipeId,
        rating: feedback.rating,
        feedback: feedback.feedback,
        createdAt: feedback.createdAt
      }))
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// @route   GET /api/users/recipe-history
// @desc    Get user's recipe generation history
// @access  Private
router.get('/recipe-history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({ 'userInteraction.createdBy': req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name description metadata userInteraction.averageRating createdAt aiGeneration.inputIngredients');

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
    console.error('Recipe history error:', error);
    res.status(500).json({ message: 'Failed to fetch recipe history' });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite recipes
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId)
      .populate({
        path: 'favoriteRecipes',
        options: { 
          sort: { createdAt: -1 },
          skip: skip,
          limit: limit
        },
        select: 'name description metadata userInteraction.averageRating createdAt',
        populate: {
          path: 'userInteraction.createdBy',
          select: 'username'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const total = user.favoriteRecipes.length;

    res.json({
      recipes: user.favoriteRecipes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ message: 'Failed to fetch favorite recipes' });
  }
});

// @route   GET /api/users/feedback-history
// @desc    Get user's feedback history
// @access  Private
router.get('/feedback-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'feedbackHistory.recipeId',
        select: 'name metadata.cuisine'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const feedbackHistory = user.feedbackHistory
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(feedback => ({
        id: feedback._id,
        recipe: feedback.recipeId ? {
          id: feedback.recipeId._id,
          name: feedback.recipeId.name,
          cuisine: feedback.recipeId.metadata.cuisine
        } : null,
        rating: feedback.rating,
        feedback: feedback.feedback,
        createdAt: feedback.createdAt
      }));

    res.json({ feedbackHistory });

  } catch (error) {
    console.error('Feedback history error:', error);
    res.status(500).json({ message: 'Failed to fetch feedback history' });
  }
});

// @route   GET /api/users/preferences
// @desc    Get user preferences for recipe generation
// @access  Private
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('profile preferences');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      profile: user.profile,
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Failed to fetch preferences' });
  }
});

// @route   GET /api/users/stats
// @desc    Get detailed user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Recipe statistics
    const recipeStats = await Recipe.aggregate([
      { $match: { 'userInteraction.createdBy': userId } },
      {
        $group: {
          _id: null,
          totalRecipes: { $sum: 1 },
          averageRating: { $avg: '$userInteraction.averageRating' },
          totalRatings: { $sum: '$userInteraction.totalRatings' },
          cuisines: { $addToSet: '$metadata.cuisine' },
          difficulties: { $push: '$metadata.difficulty' },
          cookingTimes: { $push: '$metadata.cookingTime' }
        }
      }
    ]);

    // Monthly recipe generation trend
    const monthlyTrend = await Recipe.aggregate([
      { $match: { 'userInteraction.createdBy': userId } },
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

    // Cuisine distribution
    const cuisineDistribution = await Recipe.aggregate([
      { $match: { 'userInteraction.createdBy': userId } },
      {
        $group: {
          _id: '$metadata.cuisine',
          count: { $sum: 1 },
          averageRating: { $avg: '$userInteraction.averageRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Rating distribution
    const ratingDistribution = await Recipe.aggregate([
      { $match: { 'userInteraction.createdBy': userId } },
      { $unwind: '$userInteraction.ratings' },
      {
        $group: {
          _id: '$userInteraction.ratings.rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = {
      overview: recipeStats[0] || {
        totalRecipes: 0,
        averageRating: 0,
        totalRatings: 0,
        cuisines: [],
        difficulties: [],
        cookingTimes: []
      },
      trends: {
        monthly: monthlyTrend,
        cuisineDistribution,
        ratingDistribution
      },
      insights: {
        mostPopularCuisine: cuisineDistribution[0]?.id || 'None',
        averageCookingTime: recipeStats[0] ? 
          recipeStats[0].cookingTimes.reduce((a, b) => a + b, 0) / recipeStats[0].cookingTimes.length : 0,
        preferredDifficulty: recipeStats[0] ? 
          recipeStats[0].difficulties.reduce((acc, diff) => {
            acc[diff] = (acc[diff] || 0) + 1;
            return acc;
          }, {}) : {}
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Failed to fetch user statistics' });
  }
});

module.exports = router;