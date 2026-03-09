const GeminiRecipeEngine = require('./GeminiRecipeEngine');
const EnhancedRecipeEngine = require('./EnhancedRecipeEngine');

class HybridRecipeEngine {
  constructor() {
    this.geminiEngine = new GeminiRecipeEngine();
    this.localEngine = new EnhancedRecipeEngine();
    this.useGemini = true; // Try Gemini first
  }

  async generateRecipe(ingredients, constraints = {}, userContext = {}) {
    try {
      console.log('🔄 Hybrid recipe generation starting...');
      
      if (this.useGemini) {
        console.log('🚀 Attempting Gemini API generation...');
        try {
          const recipe = await this.geminiEngine.generateRecipe(ingredients, constraints, userContext);
          console.log('✅ Gemini API generation successful!');
          return recipe;
        } catch (error) {
          console.log('⚠️ Gemini API failed:', error.message);
          
          // Check if it's a quota/rate limit error
          if (error.message.includes('429') || 
              error.message.includes('quota') || 
              error.message.includes('RESOURCE_EXHAUSTED')) {
            console.log('📉 Quota exceeded, switching to local engine for this session');
            this.useGemini = false; // Disable Gemini for this session
          }
          
          // Fall back to local engine
          console.log('🔄 Falling back to Enhanced Local Engine...');
          const recipe = await this.localEngine.generateRecipe(ingredients, constraints, userContext);
          console.log('✅ Local engine generation successful!');
          return recipe;
        }
      } else {
        console.log('🏠 Using Enhanced Local Engine (Gemini disabled due to quota)...');
        const recipe = await this.localEngine.generateRecipe(ingredients, constraints, userContext);
        console.log('✅ Local engine generation successful!');
        return recipe;
      }
      
    } catch (error) {
      console.error('❌ Hybrid recipe generation failed:', error);
      throw new Error(`Recipe generation failed: ${error.message}`);
    }
  }

  async learnFromFeedback(recipeId, rating, feedback, userPreferences) {
    // Try to learn from both engines
    try {
      if (this.useGemini) {
        await this.geminiEngine.learnFromFeedback(recipeId, rating, feedback, userPreferences);
      }
      await this.localEngine.learnFromFeedback(recipeId, rating, feedback, userPreferences);
    } catch (error) {
      console.log('Learning feedback error:', error.message);
    }
    return true;
  }

  // Method to reset Gemini usage (can be called periodically)
  resetGeminiUsage() {
    console.log('🔄 Resetting Gemini usage flag');
    this.useGemini = true;
  }

  // Get current engine status
  getEngineStatus() {
    return {
      geminiEnabled: this.useGemini,
      currentEngine: this.useGemini ? 'Gemini API' : 'Enhanced Local Engine'
    };
  }
}

module.exports = HybridRecipeEngine;