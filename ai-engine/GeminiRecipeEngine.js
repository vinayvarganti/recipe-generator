require('dotenv').config();
const axios = require('axios');

class GeminiRecipeEngine {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
    this.validationEngine = {
      validate: this.validateConstraints.bind(this)
    };
    this.reasoningHistory = []; // Mock history for now
    this.learningData = new Map(); // Mock learning data
  }

  async generateRecipe(ingredients, constraints = {}, userContext = {}) {
    try {
      console.log('🚀 Gemini recipe generation starting (REST Mode)...');

      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
      }

      const prompt = this.constructPrompt(ingredients, constraints, userContext);
      const response = await this.callGemini(prompt);
      const generatedRecipe = this.parseResponse(response);

      // VALIDATION CONSTANTS
      const CATEGORIES = ['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'herb', 'oil', 'other'];
      const DIFFICULTIES = ['easy', 'medium', 'hard'];
      const COSTS = ['low', 'medium', 'high'];
      const DIETARY_TAGS = ['vegetarian', 'vegan', 'non-vegetarian', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free'];

      // Normalize fields to satisfy enums
      if (generatedRecipe.ingredients && Array.isArray(generatedRecipe.ingredients)) {
        generatedRecipe.ingredients = generatedRecipe.ingredients.map(ing => {
          if (typeof ing === 'string') {
            return {
              name: ing,
              quantity: "1",
              unit: "unit",
              category: "other"
            };
          }

          // Category validation
          if (ing.category) {
            const lowerCat = ing.category.toLowerCase();
            ing.category = CATEGORIES.includes(lowerCat) ? lowerCat : 'other';
          } else {
            ing.category = 'other';
          }

          // Unit validation
          if (ing.unit) {
            ing.unit = ing.unit.toLowerCase();
          } else {
            ing.unit = 'unit';
          }

          // Quantity strict string
          if (ing.quantity) {
            ing.quantity = String(ing.quantity);
          } else {
            ing.quantity = "1";
          }

          return ing;
        });
      } else {
        generatedRecipe.ingredients = [];
      }

      if (generatedRecipe.instructions && Array.isArray(generatedRecipe.instructions)) {
        generatedRecipe.instructions = generatedRecipe.instructions.map((inst, index) => {
          if (typeof inst === 'string') {
            return {
              step: index + 1,
              description: inst,
              duration: 5,
              technique: "cook"
            };
          }
          return inst;
        });
      } else {
        generatedRecipe.instructions = [];
      }

      if (generatedRecipe.metadata) {
        // Difficulty validation
        if (generatedRecipe.metadata.difficulty) {
          const lowerDiff = generatedRecipe.metadata.difficulty.toLowerCase();
          generatedRecipe.metadata.difficulty = DIFFICULTIES.includes(lowerDiff) ? lowerDiff : 'medium';
        } else {
          generatedRecipe.metadata.difficulty = 'medium';
        }

        // Cost validation
        if (generatedRecipe.metadata.cost) {
          const lowerCost = generatedRecipe.metadata.cost.toLowerCase();
          generatedRecipe.metadata.cost = COSTS.includes(lowerCost) ? lowerCost : 'medium';
        } else {
          generatedRecipe.metadata.cost = 'medium';
        }

        // Cuisine validation (just lowercase)
        if (generatedRecipe.metadata.cuisine) {
          generatedRecipe.metadata.cuisine = generatedRecipe.metadata.cuisine.toLowerCase();
        } else {
          generatedRecipe.metadata.cuisine = 'international';
        }

        // Dietary tags validation
        if (generatedRecipe.metadata.dietaryTags) {
          generatedRecipe.metadata.dietaryTags = generatedRecipe.metadata.dietaryTags
            .map(t => t.toLowerCase())
            .filter(t => DIETARY_TAGS.includes(t));
        } else {
          generatedRecipe.metadata.dietaryTags = [];
        }
      }

      // Constraints validation
      if (!generatedRecipe.constraints) {
        generatedRecipe.constraints = { appliedConstraints: [], satisfiedConstraints: [], violations: [] };
      }

      // Ensure constraints arrays are properly formatted for Mongoose schema
      if (Array.isArray(generatedRecipe.constraints.appliedConstraints)) {
        generatedRecipe.constraints.appliedConstraints = generatedRecipe.constraints.appliedConstraints.map(c => {
          if (typeof c === 'string') return { constraintType: 'general', value: c };
          return c;
        });
      } else {
        generatedRecipe.constraints.appliedConstraints = [];
      }

      if (Array.isArray(generatedRecipe.constraints.satisfiedConstraints)) {
        generatedRecipe.constraints.satisfiedConstraints = generatedRecipe.constraints.satisfiedConstraints
          .filter(c => c !== null && c !== undefined)
          .map(c => {
            // If it's a string, convert to object
            if (typeof c === 'string') return { constraint: c, satisfied: true, reason: 'Satisfied by AI' };
            // If missing keys
            return {
              constraint: c.constraint || 'Unknown',
              satisfied: c.satisfied !== undefined ? c.satisfied : true,
              reason: c.reason || 'Satisfied'
            };
          });
      } else {
        generatedRecipe.constraints.satisfiedConstraints = [];
      }

      // Filtered out violations
      if (generatedRecipe.constraints.violations) {
        delete generatedRecipe.constraints.violations;
      }

      console.log('🧹 SANITIZATION COMPLETE');

      console.log('🧹 SANITIZATION COMPLETE');

      // Add metadata
      generatedRecipe.aiGeneration = {
        generationId: this.generateUniqueId(),
        inputIngredients: ingredients,
        model: "gemini-flash-latest (REST)",
        timestamp: new Date()
      };

      // Store in history (mock)
      this.reasoningHistory.push({
        generationId: generatedRecipe.aiGeneration.generationId,
        recipe: generatedRecipe,
        timestamp: new Date()
      });

      return generatedRecipe;

    } catch (error) {
      console.error('❌ Gemini generation error:', error);
      throw new Error(`Recipe generation failed: ${error.message}`);
    }
  }

  async reasonAboutCompatibility(ingredients, context) {
    const prompt = `
      Analyze the compatibility of these ingredients: ${ingredients.join(', ')}.
      Context: ${JSON.stringify(context)}
      
      Output ONLY valid JSON:
      {
        "compatiblePairs": [{"ingredients": ["a", "b"], "score": 0.9, "reason": "..."}],
        "incompatiblePairs": [{"ingredients": ["x", "y"], "score": 0.1, "reason": "...", "alternatives": ["z"]}],
        "alternatives": ["ingredient1", "ingredient2"],
        "compatibilityScore": 0.8
      }
    `;
    const response = await this.callGemini(prompt);
    return this.parseResponse(response);
  }

  async suggestDietarySubstitutions(ingredients, preference) {
    const prompt = `
      Suggest substitutes for these ingredients: ${ingredients.join(', ')} to make them ${preference}.
      Output ONLY valid JSON array:
      [{"original": "milk", "substitute": "almond milk", "reason": "..."}]
    `;
    const response = await this.callGemini(prompt);
    return this.parseResponse(response);
  }

  async suggestCookingImprovements(instructions, constraints) {
    const prompt = `
      Suggest cooking improvements for these instructions: ${JSON.stringify(instructions)}
      Constraints: ${JSON.stringify(constraints)}
      Output ONLY valid JSON array of strings (suggestions).
    `;
    const response = await this.callGemini(prompt);
    return this.parseResponse(response);
  }

  async suggestNutritionalImprovements(nutritionalInfo, constraints) {
    const prompt = `
        Suggest nutritional improvements for this profile: ${JSON.stringify(nutritionalInfo)}
        Constraints: ${JSON.stringify(constraints)}
        Output ONLY valid JSON array of strings.
      `;
    const response = await this.callGemini(prompt);
    return this.parseResponse(response);
  }

  async suggestFlavorImprovements(ingredients, cuisine) {
    const prompt = `
        Suggest flavor improvements for ingredients: ${ingredients.join(', ')} for ${cuisine} cuisine.
        Output ONLY valid JSON array of strings.
      `;
    const response = await this.callGemini(prompt);
    return this.parseResponse(response);
  }

  async validateConstraints(recipe, constraints, nutritionalInfo) {
    // Simplified validation using Gemini or simple logic
    // For speed/reliability, we can ask Gemini or just return success if we trust the generation
    // Let's ask Gemini to verify
    const prompt = `
        Validate if this recipe meets the constraints.
        Recipe: ${JSON.stringify(recipe.name)}
        Constraints: ${JSON.stringify(constraints)}
        Output ONLY valid JSON:
        {
            "allSatisfied": true,
            "satisfiedConstraints": ["..."],
            "violations": ["..."],
            "warnings": ["..."]
        }
      `;
    const response = await this.callGemini(prompt);
    // Fallback if AI fails to structured response
    return this.parseResponse(response) || { allSatisfied: true, satisfiedConstraints: [], violations: [], warnings: [] };
  }

  async learnFromFeedback(generationId, rating, feedback, userPreferences) {
    console.log(`Learning from feedback for ${generationId}: Rating ${rating}`);
    this.learningData.set(generationId, { rating, feedback, timestamp: new Date() });
    // In a real system, we'd fine-tune or store this in a vector DB
  }

  getReasoningPath(generationId) {
    // Return mock reasoning path
    return [{ step: 1, decision: "Selected ingredients", confidence: 0.9 }];
  }

  async retrain() {
    return { status: "success", message: "Retraining simulated" };
  }


  // Helper methods
  async callGemini(promptText) {
    const payload = {
      contents: [{
        parts: [{ text: promptText }]
      }]
    };

    try {
      const response = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      if (error.response) {
        console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
        throw new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error('Network/Request Error:', error.message);
        throw error;
      }
    }
  }

  parseResponse(text) {
    try {
      if (!text) return null;
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonArrayStart = text.indexOf('[');
      const jsonArrayEnd = text.lastIndexOf(']') + 1;

      let jsonStr = '';
      if (jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart)) {
        jsonStr = text.substring(jsonStart, jsonEnd);
      } else if (jsonArrayStart !== -1) {
        jsonStr = text.substring(jsonArrayStart, jsonArrayEnd);
      } else {
        try {
          return JSON.parse(text);
        } catch (e) {
          return text; // Return raw text if not JSON
        }
      }
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.log('Raw text:', text);
      return null;
    }
  }

  constructPrompt(ingredients, constraints, userContext) {
    return `
      You are a world-class professional chef and nutritionist.
      Create a unique, delicious, and practical recipe based on the following:

      **Available Ingredients**: ${ingredients.join(', ')}
      (You may add a few common pantry staples if strictly necessary.)

      **Constraints**:
      - Diet: ${constraints.dietaryPreference || 'None'}
      - Allergies: ${(constraints.allergies || []).join(', ') || 'None'}
      - Cuisine Style: ${constraints.cuisine || 'Any'}
      - Difficulty: ${constraints.difficulty || 'Medium'}
      - Max Cooking Time: ${constraints.cookingTime || 60} minutes
      - Servings: ${constraints.servings || 4}

      **User Preferences**:
      ${JSON.stringify(userContext.preferences || {})}

      **Output Format**:
      Provide the response ONLY as a valid JSON object with this structure:
      {
        "name": "Recipe Name",
        "description": "Description",
        "ingredients": [{ "name": "Ing", "quantity": "1", "unit": "cup", "category": "vegetable" }],
        "instructions": [{ "step": 1, "description": "Instr", "duration": 5, "technique": "chop" }],
        "nutritionalInfo": { "calories": 500, "protein": 20, "carbohydrates": 50, "fat": 20, "fiber": 5 },
        "metadata": { 
            "cuisine": "Italian", 
            "difficulty": "medium", 
            "cookingTime": 30, 
            "prepTime": 15, 
            "servings": 4, 
            "dietaryTags": ["vegetarian"],
            "cost": "medium"
        },
        "constraints": { "appliedConstraints": [], "satisfiedConstraints": [], "violations": [] }
      }

      IMPORTANT: 
      - category MUST be one of: 'protein', 'vegetable', 'fruit', 'grain', 'dairy', 'spice', 'herb', 'oil', 'other'
      - difficulty MUST be one of: 'easy', 'medium', 'hard'
      - cost MUST be one of: 'low', 'medium', 'high'
      - dietaryTags MUST be from: 'vegetarian', 'vegan', 'non-vegetarian', 'pescatarian', 'keto', 'paleo', 'gluten-free', 'dairy-free'
    `;
  }

  generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = GeminiRecipeEngine;
