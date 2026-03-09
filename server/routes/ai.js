const express = require('express');
const GeminiRecipeEngine = require('../../ai-engine/GeminiRecipeEngine');
const { auth } = require('../middleware/auth');

const router = express.Router();
const aiEngine = new GeminiRecipeEngine();

// @route   POST /api/ai/analyze-ingredients
// @desc    Analyze ingredient compatibility
// @access  Private
router.post('/analyze-ingredients', auth, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
      return res.status(400).json({
        message: 'At least 2 ingredients are required for analysis'
      });
    }

    // Analyze ingredient compatibility
    const analysis = await aiEngine.reasonAboutCompatibility(ingredients, {
      cuisine: 'international',
      dietaryTags: [],
      difficulty: 'medium'
    });

    res.json({
      message: 'Ingredient analysis completed',
      analysis: {
        compatiblePairs: analysis.compatiblePairs,
        incompatiblePairs: analysis.incompatiblePairs,
        suggestions: analysis.alternatives,
        totalIngredients: ingredients.length,
        compatibilityScore: analysis.compatiblePairs.length > 0
          ? analysis.compatiblePairs.reduce((sum, pair) => sum + pair.score, 0) / analysis.compatiblePairs.length
          : 0.5
      }
    });

  } catch (error) {
    console.error('Ingredient analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze ingredients' });
  }
});

// @route   POST /api/ai/suggest-improvements
// @desc    Suggest recipe improvements based on constraints
// @access  Private
router.post('/suggest-improvements', auth, async (req, res) => {
  try {
    const { ingredients, constraints, currentRecipe } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients array is required' });
    }

    // Generate improvement suggestions
    const suggestions = {
      ingredientSubstitutions: [],
      cookingMethodImprovements: [],
      nutritionalEnhancements: [],
      flavorBalancing: []
    };

    // Analyze current recipe for improvements
    if (currentRecipe) {
      // Check for ingredient substitutions based on constraints
      if (constraints.dietaryPreference) {
        suggestions.ingredientSubstitutions = await aiEngine.suggestDietarySubstitutions(
          ingredients,
          constraints.dietaryPreference
        );
      }

      // Suggest cooking method improvements
      suggestions.cookingMethodImprovements = await aiEngine.suggestCookingImprovements(
        currentRecipe.instructions,
        constraints
      );

      // Nutritional enhancement suggestions
      if (constraints.calorieLimit || constraints.nutritionalGoals) {
        suggestions.nutritionalEnhancements = await aiEngine.suggestNutritionalImprovements(
          currentRecipe.nutritionalInfo,
          constraints
        );
      }

      // Flavor balancing suggestions
      suggestions.flavorBalancing = await aiEngine.suggestFlavorImprovements(
        ingredients,
        currentRecipe.metadata.cuisine
      );
    }

    res.json({
      message: 'Recipe improvement suggestions generated',
      suggestions,
      confidence: 0.85
    });

  } catch (error) {
    console.error('Recipe improvement error:', error);
    res.status(500).json({ message: 'Failed to generate improvement suggestions' });
  }
});

// @route   POST /api/ai/validate-constraints
// @desc    Validate if a recipe satisfies given constraints
// @access  Private
router.post('/validate-constraints', auth, async (req, res) => {
  try {
    const { recipe, constraints } = req.body;

    if (!recipe || !constraints) {
      return res.status(400).json({ message: 'Recipe and constraints are required' });
    }

    // Validate constraints using AI engine
    const validation = await aiEngine.validationEngine.validate(
      recipe,
      constraints,
      recipe.nutritionalInfo
    );

    res.json({
      message: 'Constraint validation completed',
      validation: {
        allSatisfied: validation.allSatisfied,
        satisfiedConstraints: validation.satisfiedConstraints,
        violations: validation.violations,
        warnings: validation.warnings,
        overallScore: validation.satisfiedConstraints.length /
          (validation.satisfiedConstraints.length + validation.violations.length)
      }
    });

  } catch (error) {
    console.error('Constraint validation error:', error);
    res.status(500).json({ message: 'Failed to validate constraints' });
  }
});

// @route   POST /api/ai/explain-reasoning
// @desc    Explain AI reasoning for a generated recipe
// @access  Private
router.post('/explain-reasoning', auth, async (req, res) => {
  try {
    const { generationId } = req.body;

    if (!generationId) {
      return res.status(400).json({ message: 'Generation ID is required' });
    }

    // Get reasoning path from AI engine
    const reasoningPath = aiEngine.getReasoningPath(generationId);

    if (!reasoningPath || reasoningPath.length === 0) {
      return res.status(404).json({ message: 'Reasoning path not found' });
    }

    // Format reasoning explanation
    const explanation = {
      generationId,
      steps: reasoningPath.map((step, index) => ({
        stepNumber: index + 1,
        phase: step.phase || 'Unknown',
        decision: step.decision || 'No decision recorded',
        reasoning: step.reasoning || 'No reasoning provided',
        confidence: step.confidence || 0.5,
        alternatives: step.alternatives || []
      })),
      summary: {
        totalSteps: reasoningPath.length,
        averageConfidence: reasoningPath.reduce((sum, step) =>
          sum + (step.confidence || 0.5), 0) / reasoningPath.length,
        keyDecisions: reasoningPath
          .filter(step => step.confidence > 0.8)
          .map(step => step.decision)
      }
    };

    res.json({
      message: 'Reasoning explanation generated',
      explanation
    });

  } catch (error) {
    console.error('Reasoning explanation error:', error);
    res.status(500).json({ message: 'Failed to explain reasoning' });
  }
});

// @route   GET /api/ai/learning-insights
// @desc    Get AI learning insights and statistics
// @access  Private
router.get('/learning-insights', auth, async (req, res) => {
  try {
    // Get learning statistics from AI engine
    const insights = {
      totalRecipesGenerated: aiEngine.reasoningHistory.length,
      learningDataPoints: aiEngine.learningData.size,
      averageUserSatisfaction: 0,
      topIngredientCombinations: [],
      mostSuccessfulConstraints: [],
      improvementAreas: []
    };

    // Calculate average satisfaction from learning data
    if (aiEngine.learningData.size > 0) {
      let totalRating = 0;
      let ratingCount = 0;

      aiEngine.learningData.forEach(data => {
        if (data.rating) {
          totalRating += data.rating;
          ratingCount++;
        }
      });

      insights.averageUserSatisfaction = ratingCount > 0 ? totalRating / ratingCount : 0;
    }

    // Analyze successful ingredient combinations
    const ingredientCombinations = new Map();
    aiEngine.reasoningHistory.forEach(entry => {
      if (entry.recipe && entry.recipe.aiGeneration.inputIngredients) {
        const combo = entry.recipe.aiGeneration.inputIngredients.sort().join(',');
        const existing = ingredientCombinations.get(combo) || { count: 0, totalRating: 0 };
        existing.count++;

        // Add rating if available
        const learningData = aiEngine.learningData.get(entry.generationId);
        if (learningData && learningData.rating) {
          existing.totalRating += learningData.rating;
        }

        ingredientCombinations.set(combo, existing);
      }
    });

    // Get top combinations
    insights.topIngredientCombinations = Array.from(ingredientCombinations.entries())
      .map(([combo, data]) => ({
        ingredients: combo.split(','),
        usageCount: data.count,
        averageRating: data.totalRating > 0 ? data.totalRating / data.count : 0
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);

    res.json({
      message: 'Learning insights retrieved',
      insights,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Learning insights error:', error);
    res.status(500).json({ message: 'Failed to retrieve learning insights' });
  }
});

// @route   POST /api/ai/retrain
// @desc    Trigger AI model retraining (admin only)
// @access  Private (Admin)
router.post('/retrain', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Trigger retraining process
    const retrainingResult = await aiEngine.retrain();

    res.json({
      message: 'AI retraining initiated',
      result: retrainingResult,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('AI retraining error:', error);
    res.status(500).json({ message: 'Failed to initiate retraining' });
  }
});

module.exports = router;