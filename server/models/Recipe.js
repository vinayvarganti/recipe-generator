const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'herb', 'oil', 'other']
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    duration: Number, // in minutes
    temperature: String,
    technique: String
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number, // in grams
    carbohydrates: Number, // in grams
    fat: Number, // in grams
    fiber: Number, // in grams
    sugar: Number, // in grams
    sodium: Number, // in mg
    cholesterol: Number // in mg
  },
  metadata: {
    cuisine: {
      type: String,
      required: true
    },
    dietaryTags: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'non-vegetarian', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free']
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    cookingTime: {
      type: Number,
      required: true // in minutes
    },
    prepTime: {
      type: Number,
      required: true // in minutes
    },
    servings: {
      type: Number,
      required: true
    },
    cost: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  constraints: {
    appliedConstraints: [{
      constraintType: String,
      value: mongoose.Schema.Types.Mixed
    }],
    satisfiedConstraints: [{
      constraint: String,
      satisfied: Boolean,
      reason: String
    }]
  },
  aiGeneration: {
    generationId: {
      type: String,
      required: true,
      unique: true
    },
    inputIngredients: [String],
    reasoningPath: [{
      step: String,
      decision: String,
      confidence: Number
    }],
    alternativeOptions: [{
      ingredient: String,
      alternatives: [String],
      reason: String
    }],
    constraintValidation: {
      allSatisfied: Boolean,
      violations: [String],
      warnings: [String]
    }
  },
  userInteraction: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ratings: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    isFavorited: {
      type: Boolean,
      default: false
    },
    timesGenerated: {
      type: Number,
      default: 1
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'flagged'],
    default: 'active'
  },
  sharing: {
    isPublic: {
      type: Boolean,
      default: false
    },
    shareMessage: String,
    sharedAt: Date,
    views: {
      type: Number,
      default: 0
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

// Index for efficient searching
recipeSchema.index({ 'metadata.cuisine': 1 });
recipeSchema.index({ 'metadata.dietaryTags': 1 });
recipeSchema.index({ 'userInteraction.createdBy': 1 });
recipeSchema.index({ 'aiGeneration.generationId': 1 });

// Calculate average rating when ratings are updated
recipeSchema.methods.updateAverageRating = function() {
  if (this.userInteraction.ratings.length === 0) {
    this.userInteraction.averageRating = 0;
    this.userInteraction.totalRatings = 0;
  } else {
    const sum = this.userInteraction.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.userInteraction.averageRating = sum / this.userInteraction.ratings.length;
    this.userInteraction.totalRatings = this.userInteraction.ratings.length;
  }
};

module.exports = mongoose.model('Recipe', recipeSchema);