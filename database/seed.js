const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../server/models/User');
const Ingredient = require('../server/models/Ingredient');

// Sample ingredients data
const ingredientsData = [
  {
    name: 'chicken breast',
    aliases: ['chicken', 'poultry'],
    category: 'protein',
    subcategory: 'poultry',
    nutritionalInfo: {
      caloriesPerUnit: 165,
      protein: 31,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      cholesterol: 85
    },
    properties: {
      flavor: 'neutral',
      texture: 'soft',
      cookingBehavior: {
        heatSensitive: true,
        cookingTime: 'medium',
        cookingMethods: ['grill', 'bake', 'pan-fry', 'boil']
      }
    },
    compatibility: {
      pairsWellWith: ['garlic', 'onion', 'herbs', 'lemon', 'vegetables'],
      cuisineCompatibility: ['american', 'italian', 'asian', 'mediterranean']
    },
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isDairyFree: true,
      commonAllergens: []
    },
    metadata: {
      verified: true,
      confidence: 0.95
    }
  },
  {
    name: 'tomato',
    aliases: ['tomatoes'],
    category: 'vegetable',
    subcategory: 'fruit-vegetable',
    nutritionalInfo: {
      caloriesPerUnit: 18,
      protein: 0.9,
      carbohydrates: 3.9,
      fat: 0.2,
      fiber: 1.2,
      sugar: 2.6,
      sodium: 5,
      cholesterol: 0
    },
    properties: {
      flavor: 'umami',
      texture: 'soft',
      cookingBehavior: {
        heatSensitive: false,
        cookingTime: 'quick',
        cookingMethods: ['raw', 'sauté', 'roast', 'grill']
      }
    },
    compatibility: {
      pairsWellWith: ['basil', 'garlic', 'onion', 'cheese', 'olive oil'],
      cuisineCompatibility: ['italian', 'mediterranean', 'mexican', 'american']
    },
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      commonAllergens: []
    },
    metadata: {
      verified: true,
      confidence: 0.98
    }
  },
  {
    name: 'garlic',
    aliases: ['garlic cloves'],
    category: 'herb',
    subcategory: 'aromatic',
    nutritionalInfo: {
      caloriesPerUnit: 149,
      protein: 6.4,
      carbohydrates: 33,
      fat: 0.5,
      fiber: 2.1,
      sugar: 1,
      sodium: 17,
      cholesterol: 0
    },
    properties: {
      flavor: 'spicy',
      texture: 'hard',
      cookingBehavior: {
        heatSensitive: true,
        cookingTime: 'quick',
        cookingMethods: ['sauté', 'roast', 'raw']
      }
    },
    compatibility: {
      pairsWellWith: ['onion', 'herbs', 'olive oil', 'tomato', 'chicken'],
      cuisineCompatibility: ['italian', 'asian', 'mediterranean', 'mexican']
    },
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      commonAllergens: []
    },
    metadata: {
      verified: true,
      confidence: 0.97
    }
  },
  {
    name: 'onion',
    aliases: ['onions', 'yellow onion'],
    category: 'vegetable',
    subcategory: 'aromatic',
    nutritionalInfo: {
      caloriesPerUnit: 40,
      protein: 1.1,
      carbohydrates: 9.3,
      fat: 0.1,
      fiber: 1.7,
      sugar: 4.2,
      sodium: 4,
      cholesterol: 0
    },
    properties: {
      flavor: 'sweet',
      texture: 'hard',
      cookingBehavior: {
        heatSensitive: false,
        cookingTime: 'medium',
        cookingMethods: ['sauté', 'roast', 'caramelize', 'raw']
      }
    },
    compatibility: {
      pairsWellWith: ['garlic', 'herbs', 'tomato', 'meat', 'vegetables'],
      cuisineCompatibility: ['universal']
    },
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      commonAllergens: []
    },
    metadata: {
      verified: true,
      confidence: 0.99
    }
  },
  {
    name: 'rice',
    aliases: ['white rice', 'jasmine rice'],
    category: 'grain',
    subcategory: 'cereal',
    nutritionalInfo: {
      caloriesPerUnit: 130,
      protein: 2.7,
      carbohydrates: 28,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      sodium: 1,
      cholesterol: 0
    },
    properties: {
      flavor: 'neutral',
      texture: 'soft',
      cookingBehavior: {
        heatSensitive: false,
        cookingTime: 'medium',
        cookingMethods: ['boil', 'steam', 'fry']
      }
    },
    compatibility: {
      pairsWellWith: ['vegetables', 'protein', 'sauces', 'herbs'],
      cuisineCompatibility: ['asian', 'indian', 'mexican', 'american']
    },
    dietaryInfo: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      commonAllergens: []
    },
    metadata: {
      verified: true,
      confidence: 0.96
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_generator');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ingredient.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@recipeapp.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create sample regular user
    const sampleUser = new User({
      username: 'sampleuser',
      email: 'user@recipeapp.com',
      password: 'user123',
      profile: {
        firstName: 'Sample',
        lastName: 'User',
        dietaryPreferences: ['vegetarian'],
        allergies: ['nuts'],
        favoriteIngredients: ['tomato', 'garlic', 'basil'],
        favoriteCuisines: ['italian', 'mediterranean']
      },
      preferences: {
        defaultCalorieLimit: 1800,
        defaultCookingTime: 45,
        preferredDifficulty: 'medium'
      }
    });
    await sampleUser.save();
    console.log('Created sample user');

    // Seed ingredients
    for (const ingredientData of ingredientsData) {
      const ingredient = new Ingredient(ingredientData);
      await ingredient.save();
    }
    console.log(`Seeded ${ingredientsData.length} ingredients`);

    console.log('Database seeding completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@recipeapp.com / admin123');
    console.log('User: user@recipeapp.com / user123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;