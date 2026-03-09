const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  aliases: [String], // Alternative names for the ingredient
  category: {
    type: String,
    required: true,
    enum: ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'herb', 'oil', 'condiment', 'sweetener', 'other']
  },
  subcategory: String,
  nutritionalInfo: {
    caloriesPerUnit: Number, // calories per 100g
    protein: Number, // grams per 100g
    carbohydrates: Number, // grams per 100g
    fat: Number, // grams per 100g
    fiber: Number, // grams per 100g
    sugar: Number, // grams per 100g
    sodium: Number, // mg per 100g
    cholesterol: Number, // mg per 100g
    vitamins: [{
      name: String,
      amount: Number,
      unit: String
    }],
    minerals: [{
      name: String,
      amount: Number,
      unit: String
    }]
  },
  properties: {
    flavor: {
      type: String,
      enum: ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy', 'neutral']
    },
    texture: {
      type: String,
      enum: ['soft', 'hard', 'crunchy', 'smooth', 'rough', 'liquid', 'powder']
    },
    cookingBehavior: {
      heatSensitive: Boolean,
      cookingTime: String, // 'quick', 'medium', 'long'
      cookingMethods: [String] // 'boil', 'fry', 'bake', 'steam', etc.
    },
    seasonality: [String], // months when ingredient is in season
    shelfLife: String,
    storageRequirements: String
  },
  compatibility: {
    pairsWellWith: [String], // ingredient names that pair well
    avoidsWellWith: [String], // ingredient names to avoid
    cuisineCompatibility: [String], // cuisines where this ingredient is common
    flavorProfile: {
      intensity: {
        type: Number,
        min: 1,
        max: 10
      },
      dominance: {
        type: String,
        enum: ['subtle', 'moderate', 'strong', 'overpowering']
      }
    }
  },
  dietaryInfo: {
    isVegetarian: {
      type: Boolean,
      default: true
    },
    isVegan: {
      type: Boolean,
      default: true
    },
    isGlutenFree: {
      type: Boolean,
      default: true
    },
    isDairyFree: {
      type: Boolean,
      default: true
    },
    commonAllergens: [String], // 'nuts', 'dairy', 'gluten', 'soy', etc.
    dietaryRestrictions: [String]
  },
  usage: {
    commonQuantities: [{
      amount: String,
      unit: String,
      servings: Number
    }],
    preparationMethods: [String], // 'chopped', 'diced', 'sliced', 'whole', etc.
    cookingStages: [String], // 'beginning', 'middle', 'end', 'garnish'
  },
  aiKnowledge: {
    substitutes: [{
      ingredient: String,
      ratio: String, // '1:1', '2:1', etc.
      notes: String
    }],
    complementaryIngredients: [{
      ingredient: String,
      relationship: String, // 'enhances', 'balances', 'contrasts'
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    }],
    cuisineRules: [{
      cuisine: String,
      usage: String,
      importance: {
        type: String,
        enum: ['essential', 'common', 'occasional', 'rare']
      }
    }],
    constraintImpact: [{
      constraint: String,
      impact: String, // 'positive', 'negative', 'neutral'
      reason: String
    }]
  },
  metadata: {
    source: String, // where this data came from
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    usageCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient searching
ingredientSchema.index({ name: 1 });
ingredientSchema.index({ category: 1 });
ingredientSchema.index({ aliases: 1 });
ingredientSchema.index({ 'compatibility.cuisineCompatibility': 1 });

// Method to find compatible ingredients
ingredientSchema.methods.findCompatibleIngredients = function() {
  return this.model('Ingredient').find({
    name: { $in: this.compatibility.pairsWellWith }
  });
};

// Method to check dietary compatibility
ingredientSchema.methods.checkDietaryCompatibility = function(dietaryRestrictions) {
  const restrictions = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [dietaryRestrictions];
  
  for (const restriction of restrictions) {
    switch (restriction.toLowerCase()) {
      case 'vegetarian':
        if (!this.dietaryInfo.isVegetarian) return false;
        break;
      case 'vegan':
        if (!this.dietaryInfo.isVegan) return false;
        break;
      case 'gluten-free':
        if (!this.dietaryInfo.isGlutenFree) return false;
        break;
      case 'dairy-free':
        if (!this.dietaryInfo.isDairyFree) return false;
        break;
    }
  }
  return true;
};

module.exports = mongoose.model('Ingredient', ingredientSchema);