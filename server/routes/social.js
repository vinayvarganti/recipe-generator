const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/social/share-recipe/:id
// @desc    Share a recipe (make it public)
// @access  Private
router.post('/share-recipe/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic, shareMessage } = req.body;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user owns this recipe
    if (recipe.userInteraction.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only share your own recipes' });
    }

    // Update recipe sharing status
    recipe.sharing = {
      isPublic: isPublic || false,
      shareMessage: shareMessage || '',
      sharedAt: isPublic ? new Date() : null,
      views: recipe.sharing?.views || 0,
      likes: recipe.sharing?.likes || []
    };

    await recipe.save();

    res.json({
      message: isPublic ? 'Recipe shared publicly' : 'Recipe made private',
      recipe: {
        id: recipe._id,
        name: recipe.name,
        isPublic: recipe.sharing.isPublic,
        shareMessage: recipe.sharing.shareMessage
      }
    });

  } catch (error) {
    console.error('Share recipe error:', error);
    res.status(500).json({ message: 'Failed to share recipe' });
  }
});

// @route   GET /api/social/public-recipes
// @desc    Get public recipes from community
// @access  Private
router.get('/public-recipes', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'recent',
      cuisine,
      difficulty
    } = req.query;

    const skip = (page - 1) * limit;
    let filter = { 
      'sharing.isPublic': true,
      status: 'active'
    };
    let sortOptions = {};

    // Apply filters
    if (cuisine) {
      filter['metadata.cuisine'] = cuisine;
    }
    if (difficulty) {
      filter['metadata.difficulty'] = difficulty;
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        sortOptions = { 'sharing.views': -1, 'userInteraction.averageRating': -1 };
        break;
      case 'rating':
        sortOptions = { 'userInteraction.averageRating': -1, 'userInteraction.totalRatings': -1 };
        break;
      case 'recent':
      default:
        sortOptions = { 'sharing.sharedAt': -1 };
    }

    const recipes = await Recipe.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userInteraction.createdBy', 'username profile.firstName profile.lastName')
      .select('name description ingredients metadata nutritionalInfo userInteraction sharing createdAt');

    const total = await Recipe.countDocuments(filter);

    res.json({
      recipes: recipes.map(recipe => ({
        ...recipe.toObject(),
        author: {
          username: recipe.userInteraction.createdBy.username,
          name: `${recipe.userInteraction.createdBy.profile?.firstName || ''} ${recipe.userInteraction.createdBy.profile?.lastName || ''}`.trim()
        }
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get public recipes error:', error);
    res.status(500).json({ message: 'Failed to get public recipes' });
  }
});

// @route   POST /api/social/like-recipe/:id
// @desc    Like or unlike a public recipe
// @access  Private
router.post('/like-recipe/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.sharing?.isPublic) {
      return res.status(403).json({ message: 'Recipe is not public' });
    }

    // Initialize sharing object if it doesn't exist
    if (!recipe.sharing) {
      recipe.sharing = { isPublic: true, likes: [], views: 0 };
    }
    if (!recipe.sharing.likes) {
      recipe.sharing.likes = [];
    }

    const isLiked = recipe.sharing.likes.includes(userId);

    if (isLiked) {
      // Unlike
      recipe.sharing.likes = recipe.sharing.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      recipe.sharing.likes.push(userId);
    }

    await recipe.save();

    res.json({
      message: isLiked ? 'Recipe unliked' : 'Recipe liked',
      isLiked: !isLiked,
      totalLikes: recipe.sharing.likes.length
    });

  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({ message: 'Failed to like recipe' });
  }
});

// @route   POST /api/social/view-recipe/:id
// @desc    Increment view count for a public recipe
// @access  Private
router.post('/view-recipe/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.sharing?.isPublic) {
      return res.status(403).json({ message: 'Recipe is not public' });
    }

    // Initialize sharing object if it doesn't exist
    if (!recipe.sharing) {
      recipe.sharing = { isPublic: true, likes: [], views: 0 };
    }

    recipe.sharing.views = (recipe.sharing.views || 0) + 1;
    await recipe.save();

    res.json({
      message: 'View recorded',
      views: recipe.sharing.views
    });

  } catch (error) {
    console.error('View recipe error:', error);
    res.status(500).json({ message: 'Failed to record view' });
  }
});

// @route   GET /api/social/user-profile/:username
// @desc    Get public profile of a user
// @access  Private
router.get('/user-profile/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('username profile createdAt')
      .populate({
        path: 'generatedRecipes',
        match: { 'sharing.isPublic': true, status: 'active' },
        select: 'name description metadata userInteraction sharing createdAt',
        options: { sort: { 'sharing.sharedAt': -1 }, limit: 10 }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate user stats
    const totalPublicRecipes = await Recipe.countDocuments({
      'userInteraction.createdBy': user._id,
      'sharing.isPublic': true,
      status: 'active'
    });

    const totalLikes = await Recipe.aggregate([
      {
        $match: {
          'userInteraction.createdBy': user._id,
          'sharing.isPublic': true,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: '$sharing.likes' } },
          totalViews: { $sum: '$sharing.views' },
          avgRating: { $avg: '$userInteraction.averageRating' }
        }
      }
    ]);

    const stats = totalLikes[0] || { totalLikes: 0, totalViews: 0, avgRating: 0 };

    const profile = {
      username: user.username,
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      memberSince: user.createdAt,
      stats: {
        publicRecipes: totalPublicRecipes,
        totalLikes: stats.totalLikes,
        totalViews: stats.totalViews,
        averageRating: stats.avgRating
      },
      recentRecipes: user.generatedRecipes
    };

    res.json(profile);

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
});

// @route   POST /api/social/follow-user/:username
// @desc    Follow or unfollow a user
// @access  Private
router.post('/follow-user/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;

    const userToFollow = await User.findOne({ username });
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);

    // Initialize social arrays if they don't exist
    if (!currentUser.social) {
      currentUser.social = { following: [], followers: [] };
    }
    if (!userToFollow.social) {
      userToFollow.social = { following: [], followers: [] };
    }

    const isFollowing = currentUser.social.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.social.following = currentUser.social.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.social.followers = userToFollow.social.followers.filter(
        id => id.toString() !== currentUserId
      );
    } else {
      // Follow
      currentUser.social.following.push(userToFollow._id);
      userToFollow.social.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? `Unfollowed ${username}` : `Now following ${username}`,
      isFollowing: !isFollowing,
      followerCount: userToFollow.social.followers.length
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Failed to follow/unfollow user' });
  }
});

// @route   GET /api/social/feed
// @desc    Get personalized feed of recipes from followed users
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const followingIds = user.social?.following || [];

    if (followingIds.length === 0) {
      // If not following anyone, return popular public recipes
      const popularRecipes = await Recipe.find({
        'sharing.isPublic': true,
        status: 'active'
      })
      .sort({ 'sharing.views': -1, 'userInteraction.averageRating': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userInteraction.createdBy', 'username profile.firstName profile.lastName')
      .select('name description metadata userInteraction sharing createdAt');

      return res.json({
        recipes: popularRecipes,
        feedType: 'popular',
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(await Recipe.countDocuments({ 'sharing.isPublic': true, status: 'active' }) / limit),
          total: await Recipe.countDocuments({ 'sharing.isPublic': true, status: 'active' })
        }
      });
    }

    // Get recipes from followed users
    const feedRecipes = await Recipe.find({
      'userInteraction.createdBy': { $in: followingIds },
      'sharing.isPublic': true,
      status: 'active'
    })
    .sort({ 'sharing.sharedAt': -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('userInteraction.createdBy', 'username profile.firstName profile.lastName')
    .select('name description metadata userInteraction sharing createdAt');

    const total = await Recipe.countDocuments({
      'userInteraction.createdBy': { $in: followingIds },
      'sharing.isPublic': true,
      status: 'active'
    });

    res.json({
      recipes: feedRecipes,
      feedType: 'following',
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Failed to get feed' });
  }
});

// @route   GET /api/social/my-social-stats
// @desc    Get current user's social statistics
// @access  Private
router.get('/my-social-stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    
    // Get public recipe stats
    const publicRecipeStats = await Recipe.aggregate([
      {
        $match: {
          'userInteraction.createdBy': user._id,
          'sharing.isPublic': true,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalPublicRecipes: { $sum: 1 },
          totalLikes: { $sum: { $size: '$sharing.likes' } },
          totalViews: { $sum: '$sharing.views' },
          avgRating: { $avg: '$userInteraction.averageRating' }
        }
      }
    ]);

    const stats = publicRecipeStats[0] || {
      totalPublicRecipes: 0,
      totalLikes: 0,
      totalViews: 0,
      avgRating: 0
    };

    const socialStats = {
      publicRecipes: stats.totalPublicRecipes,
      totalLikes: stats.totalLikes,
      totalViews: stats.totalViews,
      averageRating: stats.avgRating,
      followers: user.social?.followers?.length || 0,
      following: user.social?.following?.length || 0
    };

    res.json(socialStats);

  } catch (error) {
    console.error('Get social stats error:', error);
    res.status(500).json({ message: 'Failed to get social statistics' });
  }
});

module.exports = router;