const GeminiRecipeEngine = require('./ai-engine/GeminiRecipeEngine');
require('dotenv').config();

async function testGeminiConnection() {
  try {
    console.log('🧪 Testing Gemini API connection...');
    
    const engine = new GeminiRecipeEngine();
    console.log('✅ Engine instantiated');
    
    // Test with simple ingredients
    const testIngredients = ['chicken', 'rice', 'onion'];
    const testConstraints = {
      cuisine: 'asian',
      servings: 2,
      cookingTime: 30
    };
    
    console.log('🚀 Generating test recipe...');
    const recipe = await engine.generateRecipe(testIngredients, testConstraints);
    
    console.log('✅ Recipe generated successfully!');
    console.log('Recipe name:', recipe.name);
    console.log('Description:', recipe.description);
    console.log('Ingredients count:', recipe.ingredients.length);
    console.log('Instructions count:', recipe.instructions.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testGeminiConnection();