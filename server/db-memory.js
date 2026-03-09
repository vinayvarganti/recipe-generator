// Simple in-memory database for testing without MongoDB
class MemoryDB {
  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.ingredients = new Map();
    this.init();
  }

  init() {
    // Add sample admin user
    this.users.set('admin@recipeapp.com', {
      _id: '1',
      username: 'admin',
      email: 'admin@recipeapp.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', // admin123
      role: 'admin',
      profile: { firstName: 'Admin', lastName: 'User' },
      preferences: { defaultCalorieLimit: 2000, defaultCookingTime: 60 },
      generatedRecipes: [],
      favoriteRecipes: [],
      feedbackHistory: [],
      isActive: true,
      createdAt: new Date()
    });

    // Add sample regular user
    this.users.set('user@recipeapp.com', {
      _id: '2',
      username: 'sampleuser',
      email: 'user@recipeapp.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', // user123
      role: 'user',
      profile: { firstName: 'Sample', lastName: 'User' },
      preferences: { defaultCalorieLimit: 1800, defaultCookingTime: 45 },
      generatedRecipes: [],
      favoriteRecipes: [],
      feedbackHistory: [],
      isActive: true,
      createdAt: new Date()
    });

    // Add sample ingredients
    const ingredients = [
      { name: 'chicken breast', category: 'protein' },
      { name: 'tomato', category: 'vegetable' },
      { name: 'garlic', category: 'herb' },
      { name: 'onion', category: 'vegetable' },
      { name: 'rice', category: 'grain' }
    ];

    ingredients.forEach((ing, index) => {
      this.ingredients.set(ing.name, {
        _id: (index + 1).toString(),
        ...ing,
        nutritionalInfo: { caloriesPerUnit: 100, protein: 10, carbohydrates: 5, fat: 2 },
        metadata: { verified: true, confidence: 0.9 }
      });
    });
  }

  // User methods
  findUserByEmail(email) {
    return this.users.get(email);
  }

  findUserById(id) {
    for (let user of this.users.values()) {
      if (user._id === id) return user;
    }
    return null;
  }

  createUser(userData) {
    const id = (this.users.size + 1).toString();
    const user = { _id: id, ...userData, createdAt: new Date() };
    this.users.set(userData.email, user);
    return user;
  }

  // Recipe methods
  createRecipe(recipeData) {
    const id = (this.recipes.size + 1).toString();
    const recipe = { _id: id, ...recipeData, createdAt: new Date() };
    this.recipes.set(id, recipe);
    return recipe;
  }

  findRecipeById(id) {
    return this.recipes.get(id);
  }

  findRecipesByUser(userId) {
    return Array.from(this.recipes.values()).filter(
      recipe => recipe.userInteraction?.createdBy === userId
    );
  }

  // Ingredient methods
  findIngredients(filter = {}) {
    return Array.from(this.ingredients.values());
  }
}

module.exports = new MemoryDB();