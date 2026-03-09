const express = require('express');
const router = express.Router();
const memoryDB = require('../db-memory');

// Import AI engines
const HybridRecipeEngine = require('../../ai-engine/HybridRecipeEngine');
const recipeEngine = new HybridRecipeEngine();

// @route   POST /api/recipes/generate
router.post('/generate', async (req, res) => {
  try {
    const { ingredients, constraints = {} } = req.body;

    if (!ingredients || ingredients.length < 2) {
      return res.status(400).json({ 
        message: 'Please provide at least 2 ingredients' 
      });
    }

    console.log('Generating recipe with:', { ingredients, constraints });

    // Generate recipe using AI engine
    const recipe = await recipeEngine.generateRecipe(ingredients, constraints);

    // Save to memory DB
    const savedRecipe = memoryDB.createRecipe({
      ...recipe,
      userInteraction: {
        createdBy: 'guest',
        ratings: [],
        averageRating: 0,
        views: 0
      }
    });

    console.log('Recipe generated successfully:', savedRecipe.name);

    res.json({
      message: 'Recipe generated successfully',
      recipe: savedRecipe
    });

  } catch (error) {
    console.error('Recipe generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate recipe',
      error: error.message 
    });
  }
});

// @route   GET /api/recipes/my-recipes
router.get('/my-recipes', (req, res) => {
  try {
    const recipes = Array.from(memoryDB.recipes.values());
    res.json({ recipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

// @route   GET /api/recipes/:id
router.get('/:id', (req, res) => {
  try {
    const recipe = memoryDB.findRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ message: 'Failed to fetch recipe' });
  }
});

module.exports = router;
