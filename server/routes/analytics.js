const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/user-insights
// @desc    Get personalized user analytics and insights
// @access  Private
router.get('/user-insights', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's recipe generation patterns
    const userRecipes = await Recipe.find({ 'userInteraction.createdBy': userId });
    
    // Cuisine preferences analysis
    const cuisineStats = {};
    const ingredientStats = {};
    const difficultyStats = {};
    const timeStats = { quick: 0, medium: 0, long: 0 };

    userRecipes.forEach(recipe => {
      // Cuisine analysis
      const cuisine = recipe.metadata.cuisine;
      cuisineStats[cuisine] = (cuisineStats[cuisine] || 0) + 1;

      // Ingredient analysis
      recipe.ingredients.forEach(ingredient => {
        ingredientStats[ingredient.name] = (ingredientStats[ingredient.name] || 0) + 1;
      });

      // Difficulty analysis
      const difficulty = recipe.metadata.difficulty;
      difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;

      // Time analysis
      const cookingTime = recipe.metadata.cookingTime;
      if (cookingTime <= 30) timeStats.quick++;
      else if (cookingTime <= 60) timeStats.medium++;
      else timeStats.long++;
    });

    // Get user's rating patterns
    const user = await User.findById(userId);
    const avgUserRating = user.feedbackHistory.length > 0 
      ? user.feedbackHistory.reduce((sum, feedback) => sum + feedback.rating, 0) / user.feedbackHistory.length
      : 0;

    // Generate insights
    const insights = {
      totalRecipes: userRecipes.length,
      averageRating: avgUserRating,
      preferences: {
        favoriteCuisine: Object.keys(cuisineStats).reduce((a, b) => cuisineStats[a] > cuisineStats[b] ? a : b, 'none'),
        mostUsedIngredients: Object.entries(ingredientStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([ingredient, count]) => ({ ingredient, count })),
        preferredDifficulty: Object.keys(difficultyStats).reduce((a, b) => difficultyStats[a] > difficultyStats[b] ? a : b, 'none'),
        cookingTimePreference: Object.keys(timeStats).reduce((a, b) => timeStats[a] > timeStats[b] ? a : b, 'medium')
      },
      patterns: {
        cuisineDistribution: cuisineStats,
        difficultyDistribution: difficultyStats,
        timeDistribution: timeStats
      },
      recommendations: generateUserRecommendations(cuisineStats, ingredientStats, difficultyStats, avgUserRating)
    };

    res.json(insights);

  } catch (error) {
    console.error('User insights error:', error);
    res.status(500).json({ message: 'Failed to generate user insights' });
  }
});

// @route   GET /api/analytics/recipe-performance/:id
// @desc    Get detailed analytics for a specific recipe
// @access  Private
router.get('/recipe-performance/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id)
      .populate('userInteraction.ratings.userId', 'username')
      .populate('userInteraction.createdBy', 'username');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user owns this recipe or is admin
    if (recipe.userInteraction.createdBy._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    recipe.userInteraction.ratings.forEach(rating => {
      ratingDistribution[rating.rating]++;
    });

    // Rating trends over time
    const ratingTrends = recipe.userInteraction.ratings
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((rating, index) => ({
        date: rating.createdAt,
        rating: rating.rating,
        cumulativeAverage: recipe.userInteraction.ratings
          .slice(0, index + 1)
          .reduce((sum, r) => sum + r.rating, 0) / (index + 1)
      }));

    // Feedback analysis
    const feedbackKeywords = analyzeFeedback(recipe.userInteraction.ratings.map(r => r.feedback).filter(Boolean));

    const performance = {
      recipe: {
        id: recipe._id,
        name: recipe.name,
        createdAt: recipe.createdAt
      },
      metrics: {
        totalRatings: recipe.userInteraction.totalRatings,
        averageRating: recipe.userInteraction.averageRating,
        timesGenerated: recipe.userInteraction.timesGenerated,
        isFavorited: recipe.userInteraction.isFavorited
      },
      ratingDistribution,
      ratingTrends,
      feedbackAnalysis: {
        totalFeedbacks: recipe.userInteraction.ratings.filter(r => r.feedback).length,
        keywords: feedbackKeywords,
        sentiment: calculateSentiment(recipe.userInteraction.ratings.map(r => r.feedback).filter(Boolean))
      },
      comparisons: {
        vsAverageRating: recipe.userInteraction.averageRating - 3.5, // Assuming 3.5 is platform average
        vsUserAverage: 0 // Would need user's average rating
      }
    };

    res.json(performance);

  } catch (error) {
    console.error('Recipe performance error:', error);
    res.status(500).json({ message: 'Failed to get recipe performance' });
  }
});

// @route   GET /api/analytics/platform-stats
// @desc    Get platform-wide analytics (Admin only)
// @access  Admin
router.get('/platform-stats', auth, adminAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      case '1y':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
    }

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Recipe generation trends
    const recipeGrowth = await Recipe.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Popular cuisines
    const popularCuisines = await Recipe.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: '$metadata.cuisine',
          count: { $sum: 1 },
          avgRating: { $avg: '$userInteraction.averageRating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // User engagement metrics
    const engagementStats = await User.aggregate([
      {
        $project: {
          recipesGenerated: { $size: '$generatedRecipes' },
          feedbackGiven: { $size: '$feedbackHistory' },
          isActive: '$isActive'
        }
      },
      {
        $group: {
          _id: null,
          avgRecipesPerUser: { $avg: '$recipesGenerated' },
          avgFeedbackPerUser: { $avg: '$feedbackGiven' },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    // AI performance metrics
    const aiStats = await Recipe.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$userInteraction.averageRating' },
          totalRatings: { $sum: '$userInteraction.totalRatings' },
          avgConstraintsSatisfied: { $avg: { $size: '$constraints.satisfiedConstraints' } }
        }
      }
    ]);

    const platformStats = {
      period,
      overview: {
        totalUsers: await User.countDocuments(),
        totalRecipes: await Recipe.countDocuments(),
        totalRatings: aiStats[0]?.totalRatings || 0,
        averageRating: aiStats[0]?.avgRating || 0,
        activeUsers: engagementStats[0]?.activeUsers || 0
      },
      growth: {
        users: userGrowth,
        recipes: recipeGrowth
      },
      engagement: engagementStats[0] || {},
      popular: {
        cuisines: popularCuisines
      },
      aiPerformance: {
        averageRating: aiStats[0]?.avgRating || 0,
        constraintSatisfactionRate: aiStats[0]?.avgConstraintsSatisfied || 0
      }
    };

    res.json(platformStats);

  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({ message: 'Failed to get platform statistics' });
  }
});

// @route   GET /api/analytics/ingredient-insights
// @desc    Get insights about ingredient usage and trends
// @access  Private
router.get('/ingredient-insights', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
    }

    // Most popular ingredients
    const popularIngredients = await Recipe.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      { $unwind: '$ingredients' },
      {
        $group: {
          _id: '$ingredients.name',
          count: { $sum: 1 },
          avgRating: { $avg: '$userInteraction.averageRating' },
          cuisines: { $addToSet: '$metadata.cuisine' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Ingredient combinations
    const combinations = await Recipe.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $project: {
          ingredients: { $map: { input: '$ingredients', as: 'ing', in: '$$ing.name' } },
          rating: '$userInteraction.averageRating'
        }
      },
      { $match: { 'ingredients.1': { $exists: true } } }, // At least 2 ingredients
      {
        $project: {
          combinations: {
            $reduce: {
              input: { $range: [0, { $size: '$ingredients' }] },
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $map: {
                      input: { $range: [{ $add: ['$$this', 1] }, { $size: '$ingredients' }] },
                      as: 'j',
                      in: {
                        pair: { $concat: [{ $arrayElemAt: ['$ingredients', '$$this'] }, ' + ', { $arrayElemAt: ['$ingredients', '$$j'] }] },
                        rating: '$rating'
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      { $unwind: '$combinations' },
      {
        $group: {
          _id: '$combinations.pair',
          count: { $sum: 1 },
          avgRating: { $avg: '$combinations.rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    const insights = {
      period,
      popularIngredients: popularIngredients.map(item => ({
        name: item._id,
        usageCount: item.count,
        averageRating: item.avgRating,
        cuisines: item.cuisines
      })),
      topCombinations: combinations.map(item => ({
        combination: item._id,
        usageCount: item.count,
        averageRating: item.avgRating
      })),
      trends: {
        seasonal: await getSeasonalTrends(dateFilter),
        emerging: await getEmergingIngredients(dateFilter)
      }
    };

    res.json(insights);

  } catch (error) {
    console.error('Ingredient insights error:', error);
    res.status(500).json({ message: 'Failed to get ingredient insights' });
  }
});

// Helper functions
function generateUserRecommendations(cuisineStats, ingredientStats, difficultyStats, avgRating) {
  const recommendations = [];

  // Cuisine recommendations
  const topCuisine = Object.keys(cuisineStats).reduce((a, b) => cuisineStats[a] > cuisineStats[b] ? a : b, null);
  if (topCuisine) {
    recommendations.push(`Try exploring more ${topCuisine} recipes - it seems to be your favorite!`);
  }

  // Difficulty recommendations
  const preferredDifficulty = Object.keys(difficultyStats).reduce((a, b) => difficultyStats[a] > difficultyStats[b] ? a : b, null);
  if (preferredDifficulty === 'easy') {
    recommendations.push('Consider trying some medium difficulty recipes to expand your skills!');
  }

  // Rating-based recommendations
  if (avgRating < 3) {
    recommendations.push('Try adjusting your ingredient preferences for better recipe matches.');
  } else if (avgRating > 4) {
    recommendations.push('You seem to love most recipes! Consider sharing your favorites with others.');
  }

  return recommendations;
}

function analyzeFeedback(feedbacks) {
  const keywords = {};
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'was', 'are', 'were', 'this', 'that', 'it'];

  feedbacks.forEach(feedback => {
    if (feedback) {
      const words = feedback.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 3 && !commonWords.includes(word)) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(keywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function calculateSentiment(feedbacks) {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'delicious', 'perfect', 'love', 'wonderful', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'worst', 'disappointing'];

  let positiveScore = 0;
  let negativeScore = 0;

  feedbacks.forEach(feedback => {
    if (feedback) {
      const words = feedback.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveScore++;
        if (negativeWords.includes(word)) negativeScore++;
      });
    }
  });

  const total = positiveScore + negativeScore;
  if (total === 0) return 'neutral';

  const positiveRatio = positiveScore / total;
  if (positiveRatio > 0.6) return 'positive';
  if (positiveRatio < 0.4) return 'negative';
  return 'neutral';
}

async function getSeasonalTrends(dateFilter) {
  // This would analyze seasonal ingredient usage patterns
  // Simplified implementation
  return [];
}

async function getEmergingIngredients(dateFilter) {
  // This would identify ingredients with growing usage
  // Simplified implementation
  return [];
}

module.exports = router;