// Enhanced Recipe Engine with intelligent constraint-based generation
class SimpleRecipeEngine {
  constructor() {
    this.cuisineTemplates = {
      breakfast: {
        commonIngredients: ['banana', 'milk', 'oats', 'yogurt', 'berries', 'eggs', 'bread', 'honey'],
        cookingMethods: ['blend', 'mix', 'cook', 'scramble', 'toast'],
        flavorProfile: 'sweet and nutritious',
        baseIngredients: ['oats', 'milk', 'eggs'],
        spices: ['cinnamon', 'vanilla', 'nutmeg']
      },
      dessert: {
        commonIngredients: ['chocolate', 'sugar', 'vanilla', 'cream', 'flour', 'butter', 'eggs'],
        cookingMethods: ['bake', 'whip', 'chill', 'melt'],
        flavorProfile: 'sweet and indulgent',
        baseIngredients: ['flour', 'sugar', 'butter'],
        spices: ['vanilla', 'cinnamon', 'cocoa']
      },
      italian: {
        commonIngredients: ['tomato', 'garlic', 'basil', 'olive oil', 'cheese', 'pasta', 'onion'],
        cookingMethods: ['sauté', 'simmer', 'bake', 'boil'],
        flavorProfile: 'savory with herbs',
        baseIngredients: ['olive oil', 'garlic', 'onion'],
        spices: ['basil', 'oregano', 'parsley', 'black pepper']
      },
      asian: {
        commonIngredients: ['soy sauce', 'ginger', 'garlic', 'rice', 'vegetables', 'sesame oil'],
        cookingMethods: ['stir-fry', 'steam', 'boil', 'deep-fry'],
        flavorProfile: 'umami and aromatic',
        baseIngredients: ['garlic', 'ginger', 'soy sauce'],
        spices: ['ginger', 'garlic', 'chili', 'sesame seeds']
      },
      american: {
        commonIngredients: ['chicken', 'beef', 'potatoes', 'onion', 'cheese', 'butter'],
        cookingMethods: ['grill', 'bake', 'fry', 'roast'],
        flavorProfile: 'hearty and satisfying',
        baseIngredients: ['onion', 'butter', 'salt'],
        spices: ['black pepper', 'paprika', 'garlic powder']
      },
      mexican: {
        commonIngredients: ['tomato', 'onion', 'peppers', 'beans', 'cheese', 'lime', 'cilantro'],
        cookingMethods: ['sauté', 'simmer', 'grill', 'roast'],
        flavorProfile: 'spicy and vibrant',
        baseIngredients: ['onion', 'garlic', 'tomato'],
        spices: ['cumin', 'chili powder', 'paprika', 'lime juice']
      },
      indian: {
        commonIngredients: ['onion', 'garlic', 'ginger', 'spices', 'tomato', 'yogurt'],
        cookingMethods: ['sauté', 'simmer', 'curry', 'roast'],
        flavorProfile: 'aromatic and spiced',
        baseIngredients: ['onion', 'ginger', 'garlic'],
        spices: ['turmeric', 'cumin', 'coriander', 'garam masala']
      },
      mediterranean: {
        commonIngredients: ['olive oil', 'tomato', 'garlic', 'herbs', 'lemon', 'cheese'],
        cookingMethods: ['grill', 'roast', 'sauté', 'marinate'],
        flavorProfile: 'fresh and herbaceous',
        baseIngredients: ['olive oil', 'garlic', 'lemon'],
        spices: ['oregano', 'thyme', 'rosemary', 'lemon zest']
      }
    };

    // Enhanced nutrition database with more accurate data
    this.nutritionData = {
      // Proteins (per 100g)
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
      'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
      'beef': { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0 },
      'pork': { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
      'fish': { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
      'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
      'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
      'beans': { calories: 127, protein: 8, carbs: 23, fat: 0.5, fiber: 6.4 },
      'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
      
      // Fruits (per 100g)
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
      'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 6.7 },
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
      'berries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
      'strawberries': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
      'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
      'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
      'lemon': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8 },
      
      // Vegetables (per 100g)
      'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
      'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
      'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
      'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
      'bell pepper': { calories: 31, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5 },
      'mushroom': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
      'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
      
      // Grains & Starches (per 100g cooked)
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
      'brown rice': { calories: 112, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
      'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
      'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
      'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
      'oats': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 },
      'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
      
      // Dairy (per 100g)
      'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 },
      'cheese': { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0 },
      'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
      'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
      'cream': { calories: 345, protein: 2.8, carbs: 2.8, fat: 37, fiber: 0 },
      
      // Oils & Fats (per 100g)
      'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
      'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
      'nuts': { calories: 607, protein: 20, carbs: 21, fat: 54, fiber: 8.5 },
      'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
      
      // Herbs & Spices (per 100g - but used in small amounts)
      'basil': { calories: 22, protein: 3.2, carbs: 2.6, fat: 0.6, fiber: 1.6 },
      'cilantro': { calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8 },
      'parsley': { calories: 36, protein: 3, carbs: 6.3, fat: 0.8, fiber: 3.3 },
      
      'default': { calories: 50, protein: 2, carbs: 8, fat: 1, fiber: 1 }
    };

    // Ingredient compatibility matrix
    this.ingredientCompatibility = {
      'chicken': ['garlic', 'onion', 'tomato', 'herbs', 'lemon', 'rice', 'pasta'],
      'beef': ['onion', 'garlic', 'potato', 'mushroom', 'herbs'],
      'fish': ['lemon', 'garlic', 'herbs', 'tomato', 'olive oil'],
      'tofu': ['soy sauce', 'ginger', 'garlic', 'vegetables', 'rice'],
      'tomato': ['basil', 'garlic', 'onion', 'cheese', 'olive oil'],
      'pasta': ['tomato', 'garlic', 'basil', 'cheese', 'olive oil'],
      'rice': ['vegetables', 'soy sauce', 'garlic', 'ginger']
    };

    // Dietary restriction mappings
    this.dietaryRestrictions = {
      'vegetarian': {
        forbidden: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'meat'],
        allowed: ['vegetables', 'fruits', 'grains', 'dairy', 'eggs']
      },
      'vegan': {
        forbidden: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'meat', 'milk', 'cheese', 'yogurt', 'butter', 'eggs', 'cream'],
        allowed: ['vegetables', 'fruits', 'grains', 'nuts', 'tofu', 'beans', 'lentils']
      },
      'keto': {
        forbidden: ['rice', 'pasta', 'bread', 'potato', 'sweet potato', 'oats', 'quinoa'],
        allowed: ['meat', 'fish', 'eggs', 'cheese', 'vegetables', 'nuts', 'olive oil']
      },
      'paleo': {
        forbidden: ['rice', 'pasta', 'bread', 'oats', 'quinoa', 'beans', 'lentils', 'milk', 'cheese'],
        allowed: ['meat', 'fish', 'eggs', 'vegetables', 'fruits', 'nuts']
      }
    };
  }

  async generateRecipe(ingredients, constraints = {}, userContext = {}) {
    try {
      console.log('🚀 Enhanced recipe generation starting...');
      console.log('Input ingredients:', ingredients);
      console.log('Constraints:', constraints);
      console.log('User context:', userContext);

      // Step 1: Validate and filter ingredients based on constraints
      const validatedIngredients = this.validateIngredientsAgainstConstraints(ingredients, constraints, userContext);
      console.log('✅ Validated ingredients:', validatedIngredients.allowed);
      
      if (validatedIngredients.violations.length > 0) {
        console.log('⚠️ Constraint violations:', validatedIngredients.violations);
      }

      // Step 2: Enhance ingredient list with complementary ingredients
      const enhancedIngredients = this.enhanceIngredientList(validatedIngredients.allowed, constraints);
      console.log('🔧 Enhanced ingredients:', enhancedIngredients);

      // Step 3: Determine optimal cuisine based on ingredients and constraints
      const cuisine = this.intelligentCuisineSelection(enhancedIngredients, constraints);
      console.log('🍽️ Selected cuisine:', cuisine);

      // Step 4: Generate recipe structure
      const recipeStructure = this.generateRecipeStructure(enhancedIngredients, cuisine, constraints);
      
      // Step 5: Calculate accurate nutrition
      const nutrition = this.calculateAccurateNutrition(enhancedIngredients, constraints.servings || 4);
      
      // Step 6: Validate against calorie and dietary constraints
      const constraintValidation = this.validateNutritionalConstraints(nutrition, constraints);
      
      // Step 7: Generate cooking instructions based on ingredients and techniques
      const instructions = this.generateIntelligentInstructions(enhancedIngredients, cuisine, constraints);

      // Generate unique ID
      const generationId = this.generateUniqueId();

      const recipe = {
        generationId,
        name: recipeStructure.name,
        description: recipeStructure.description,
        ingredients: recipeStructure.formattedIngredients,
        instructions: instructions,
        nutritionalInfo: nutrition,
        metadata: {
          cuisine: cuisine,
          difficulty: this.calculateDifficulty(enhancedIngredients, instructions),
          cookingTime: this.calculateCookingTime(instructions, enhancedIngredients),
          prepTime: this.calculatePrepTime(enhancedIngredients),
          servings: constraints.servings || 4,
          dietaryTags: this.generateDietaryTags(enhancedIngredients, constraints),
          cost: this.estimateCost(enhancedIngredients)
        },
        constraints: {
          appliedConstraints: this.formatAppliedConstraints(constraints),
          satisfiedConstraints: constraintValidation.satisfied,
          violations: constraintValidation.violations
        },
        aiGeneration: {
          generationId,
          inputIngredients: ingredients,
          enhancedIngredients: enhancedIngredients,
          reasoningPath: [
            {
              step: 'Ingredient Validation',
              decision: `Validated ${validatedIngredients.allowed.length}/${ingredients.length} ingredients`,
              confidence: validatedIngredients.violations.length === 0 ? 0.95 : 0.7
            },
            {
              step: 'Ingredient Enhancement',
              decision: `Added ${enhancedIngredients.length - validatedIngredients.allowed.length} complementary ingredients`,
              confidence: 0.85
            },
            {
              step: 'Cuisine Selection',
              decision: `Selected ${cuisine} based on ingredient analysis`,
              confidence: 0.9
            },
            {
              step: 'Nutritional Optimization',
              decision: `Optimized for ${constraints.calorieLimit || 'balanced'} calories`,
              confidence: constraintValidation.violations.length === 0 ? 0.9 : 0.6
            }
          ],
          alternativeOptions: this.generateAlternatives(enhancedIngredients, cuisine),
          constraintValidation: {
            allSatisfied: constraintValidation.violations.length === 0,
            violations: constraintValidation.violations,
            warnings: constraintValidation.warnings
          }
        }
      };

      console.log('✅ Enhanced recipe generated successfully:', recipe.name);
      return recipe;

    } catch (error) {
      console.error('❌ Enhanced recipe generation error:', error);
      throw new Error(`Enhanced recipe generation failed: ${error.message}`);
    }
  }

  // Enhanced ingredient validation against dietary constraints
  validateIngredientsAgainstConstraints(ingredients, constraints, userContext) {
    const result = {
      allowed: [],
      violations: [],
      substitutions: []
    };

    const dietaryPreference = constraints.dietaryPreference || userContext.dietaryPreferences?.[0];
    const allergies = [...(constraints.allergies || []), ...(userContext.allergies || [])];

    ingredients.forEach(ingredient => {
      const lowerIngredient = ingredient.toLowerCase();
      let isAllowed = true;
      let violationReason = '';

      // Check dietary restrictions
      if (dietaryPreference && this.dietaryRestrictions[dietaryPreference]) {
        const restriction = this.dietaryRestrictions[dietaryPreference];
        if (restriction.forbidden.some(forbidden => lowerIngredient.includes(forbidden))) {
          isAllowed = false;
          violationReason = `${ingredient} violates ${dietaryPreference} diet`;
          
          // Suggest substitution
          const substitution = this.findSubstitution(ingredient, dietaryPreference);
          if (substitution) {
            result.substitutions.push({
              original: ingredient,
              substitute: substitution,
              reason: violationReason
            });
          }
        }
      }

      // Check allergies
      allergies.forEach(allergy => {
        if (lowerIngredient.includes(allergy.toLowerCase())) {
          isAllowed = false;
          violationReason = `${ingredient} contains allergen: ${allergy}`;
        }
      });

      if (isAllowed) {
        result.allowed.push(ingredient);
      } else {
        result.violations.push({
          ingredient,
          reason: violationReason
        });
      }
    });

    return result;
  }

  // Find suitable substitutions for restricted ingredients
  findSubstitution(ingredient, dietaryPreference) {
    const substitutions = {
      'vegetarian': {
        'chicken': 'tofu',
        'beef': 'mushroom',
        'fish': 'tofu'
      },
      'vegan': {
        'chicken': 'tofu',
        'beef': 'lentils',
        'fish': 'tofu',
        'milk': 'almond milk',
        'cheese': 'nutritional yeast',
        'butter': 'olive oil',
        'eggs': 'flax eggs'
      },
      'keto': {
        'rice': 'cauliflower rice',
        'pasta': 'zucchini noodles',
        'potato': 'cauliflower',
        'bread': 'lettuce wraps'
      }
    };

    const lowerIngredient = ingredient.toLowerCase();
    const subs = substitutions[dietaryPreference] || {};
    
    for (const [original, substitute] of Object.entries(subs)) {
      if (lowerIngredient.includes(original)) {
        return substitute;
      }
    }
    
    return null;
  }

  // Enhance ingredient list with complementary ingredients
  enhanceIngredientList(ingredients, constraints) {
    const enhanced = [...ingredients];
    const cuisine = constraints.cuisine || this.inferCuisine(ingredients);
    const template = this.cuisineTemplates[cuisine] || this.cuisineTemplates.american;

    // Add base ingredients if missing
    template.baseIngredients.forEach(baseIngredient => {
      if (!enhanced.some(ing => ing.toLowerCase().includes(baseIngredient))) {
        enhanced.push(baseIngredient);
      }
    });

    // Add complementary spices (limit to 2-3)
    const spicesToAdd = template.spices.slice(0, 2);
    spicesToAdd.forEach(spice => {
      if (!enhanced.some(ing => ing.toLowerCase().includes(spice))) {
        enhanced.push(spice);
      }
    });

    // Add ingredients based on compatibility
    ingredients.forEach(ingredient => {
      const compatible = this.ingredientCompatibility[ingredient.toLowerCase()] || [];
      const compatibleToAdd = compatible.filter(comp => 
        !enhanced.some(ing => ing.toLowerCase().includes(comp))
      ).slice(0, 1); // Add only 1 compatible ingredient per main ingredient
      
      enhanced.push(...compatibleToAdd);
    });

    return enhanced;
  }

  // Intelligent cuisine selection based on ingredient analysis
  intelligentCuisineSelection(ingredients, constraints) {
    if (constraints.cuisine) return constraints.cuisine;

    const cuisineScores = {};
    const ingredientStr = ingredients.join(' ').toLowerCase();

    // Score each cuisine based on ingredient matches
    Object.keys(this.cuisineTemplates).forEach(cuisine => {
      const template = this.cuisineTemplates[cuisine];
      let score = 0;

      // Check common ingredients
      template.commonIngredients.forEach(common => {
        if (ingredientStr.includes(common)) {
          score += 2;
        }
      });

      // Check base ingredients (higher weight)
      template.baseIngredients.forEach(base => {
        if (ingredientStr.includes(base)) {
          score += 3;
        }
      });

      // Check spices
      template.spices.forEach(spice => {
        if (ingredientStr.includes(spice)) {
          score += 1;
        }
      });

      cuisineScores[cuisine] = score;
    });

    // Return cuisine with highest score
    const bestCuisine = Object.keys(cuisineScores).reduce((a, b) => 
      cuisineScores[a] > cuisineScores[b] ? a : b
    );

    return cuisineScores[bestCuisine] > 0 ? bestCuisine : 'american';
  }

  // Generate recipe structure with intelligent naming and description
  generateRecipeStructure(ingredients, cuisine, constraints) {
    const mainIngredients = ingredients.slice(0, 3);
    const name = this.generateIntelligentName(mainIngredients, cuisine, constraints);
    const description = this.generateIntelligentDescription(ingredients, cuisine, constraints);
    const formattedIngredients = this.formatIngredientsIntelligently(ingredients, constraints.servings || 4);

    return {
      name,
      description,
      formattedIngredients
    };
  }

  // Generate intelligent recipe names
  generateIntelligentName(mainIngredients, cuisine, constraints) {
    const primary = mainIngredients[0];
    const secondary = mainIngredients[1] || '';
    
    const nameTemplates = {
      italian: [
        `${primary} Parmigiana`,
        `Rustic ${primary} Pasta`,
        `${primary} Risotto`,
        `Mediterranean ${primary}`,
        `${primary} alla ${secondary || 'Italiana'}`
      ],
      asian: [
        `${primary} Stir-fry`,
        `Teriyaki ${primary}`,
        `${primary} with ${secondary || 'Vegetables'}`,
        `Asian-style ${primary}`,
        `${primary} Bowl`
      ],
      mexican: [
        `${primary} Tacos`,
        `${primary} Burrito Bowl`,
        `Spicy ${primary} Skillet`,
        `${primary} Fajitas`,
        `Mexican ${primary} Fiesta`
      ],
      indian: [
        `${primary} Curry`,
        `${primary} Masala`,
        `Spiced ${primary}`,
        `${primary} Biryani`,
        `${primary} Tikka`
      ],
      american: [
        `${primary} Casserole`,
        `Comfort ${primary}`,
        `${primary} Skillet`,
        `Hearty ${primary} Bake`,
        `Classic ${primary}`
      ]
    };

    const templates = nameTemplates[cuisine] || nameTemplates.american;
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Add dietary preference to name if specified
    if (constraints.dietaryPreference && constraints.dietaryPreference !== 'non-vegetarian') {
      return `${constraints.dietaryPreference.charAt(0).toUpperCase() + constraints.dietaryPreference.slice(1)} ${selectedTemplate}`;
    }
    
    return selectedTemplate;
  }

  // Generate intelligent descriptions
  generateIntelligentDescription(ingredients, cuisine, constraints) {
    const template = this.cuisineTemplates[cuisine] || this.cuisineTemplates.american;
    const mainIngredients = ingredients.slice(0, 4).join(', ');
    
    let description = `A delicious ${cuisine} recipe featuring ${mainIngredients}. `;
    description += `This dish combines ${template.flavorProfile} flavors `;
    
    if (constraints.cookingTime && constraints.cookingTime <= 30) {
      description += 'in a quick and easy preparation ';
    } else if (constraints.difficulty === 'easy') {
      description += 'with simple cooking techniques ';
    }
    
    description += 'for a satisfying meal.';
    
    if (constraints.dietaryPreference) {
      description += ` Perfect for ${constraints.dietaryPreference} diets.`;
    }
    
    return description;
  }

  // Format ingredients with intelligent quantities based on servings
  formatIngredientsIntelligently(ingredients, servings) {
    const baseQuantities = {
      // Proteins (per serving)
      'chicken': { amount: 150, unit: 'g' },
      'beef': { amount: 120, unit: 'g' },
      'fish': { amount: 140, unit: 'g' },
      'tofu': { amount: 100, unit: 'g' },
      'eggs': { amount: 1, unit: 'piece' },
      
      // Vegetables
      'tomato': { amount: 1, unit: 'medium' },
      'onion': { amount: 0.5, unit: 'medium' },
      'garlic': { amount: 2, unit: 'cloves' },
      'bell pepper': { amount: 0.5, unit: 'piece' },
      
      // Grains
      'rice': { amount: 60, unit: 'g' },
      'pasta': { amount: 80, unit: 'g' },
      
      // Dairy
      'cheese': { amount: 50, unit: 'g' },
      'milk': { amount: 100, unit: 'ml' },
      
      // Oils and seasonings
      'olive oil': { amount: 1, unit: 'tablespoon' },
      'salt': { amount: 0.5, unit: 'teaspoon' },
      
      // Default
      'default': { amount: 1, unit: 'cup' }
    };

    return ingredients.map(ingredient => {
      const lowerIngredient = ingredient.toLowerCase();
      let quantity = baseQuantities.default;
      
      // Find matching quantity
      for (const [key, value] of Object.entries(baseQuantities)) {
        if (lowerIngredient.includes(key)) {
          quantity = value;
          break;
        }
      }
      
      // Scale by servings
      const scaledAmount = quantity.amount * servings;
      
      return {
        name: ingredient,
        quantity: scaledAmount.toString(),
        unit: quantity.unit,
        category: this.categorizeIngredient(ingredient)
      };
    });
  }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  inferCuisine(ingredients) {
    const ingredientStr = ingredients.join(' ').toLowerCase();
    
    // Breakfast/Smoothie ingredients
    if (ingredientStr.includes('banana') || ingredientStr.includes('milk') || ingredientStr.includes('yogurt') || ingredientStr.includes('oats')) {
      return 'breakfast';
    }
    
    // Dessert ingredients
    if (ingredientStr.includes('chocolate') || ingredientStr.includes('sugar') || ingredientStr.includes('vanilla') || ingredientStr.includes('cream')) {
      return 'dessert';
    }
    
    // Traditional cuisines
    if (ingredientStr.includes('tomato') && (ingredientStr.includes('basil') || ingredientStr.includes('cheese'))) {
      return 'italian';
    }
    if (ingredientStr.includes('soy') || ingredientStr.includes('ginger') || ingredientStr.includes('rice')) {
      return 'asian';
    }
    if (ingredientStr.includes('pepper') || ingredientStr.includes('beans') || ingredientStr.includes('salsa')) {
      return 'mexican';
    }
    if (ingredientStr.includes('curry') || ingredientStr.includes('turmeric') || ingredientStr.includes('cumin')) {
      return 'indian';
    }
    
    return 'american';
  }

  generateRecipeName(ingredients, cuisine) {
    const mainIngredient = ingredients[0];
    const secondaryIngredient = ingredients[1] || '';
    
    const recipeTemplates = {
      italian: [
        `Classic ${mainIngredient} Marinara`,
        `Rustic ${mainIngredient} Parmigiana`,
        `Traditional ${mainIngredient} Risotto`,
        `Homemade ${mainIngredient} Pasta`,
        `Tuscan ${mainIngredient} Delight`
      ],
      asian: [
        `Savory ${mainIngredient} Stir-fry`,
        `Aromatic ${mainIngredient} Curry`,
        `Spicy ${mainIngredient} Noodles`,
        `Steamed ${mainIngredient} Dumplings`,
        `Teriyaki ${mainIngredient} Bowl`
      ],
      mexican: [
        `Spicy ${mainIngredient} Tacos`,
        `Zesty ${mainIngredient} Burrito Bowl`,
        `Fiesta ${mainIngredient} Quesadilla`,
        `Mexican ${mainIngredient} Enchiladas`,
        `Authentic ${mainIngredient} Fajitas`
      ],
      american: [
        `Hearty ${mainIngredient} Casserole`,
        `Comfort ${mainIngredient} Skillet`,
        `BBQ ${mainIngredient} Platter`,
        `Southern ${mainIngredient} Bake`,
        `Classic ${mainIngredient} Sandwich`
      ],
      indian: [
        `Spiced ${mainIngredient} Masala`,
        `Aromatic ${mainIngredient} Biryani`,
        `Creamy ${mainIngredient} Korma`,
        `Tandoori ${mainIngredient} Special`,
        `Mumbai ${mainIngredient} Curry`
      ],
      mediterranean: [
        `Greek ${mainIngredient} Salad`,
        `Mediterranean ${mainIngredient} Bowl`,
        `Herb-crusted ${mainIngredient}`,
        `Olive Oil ${mainIngredient}`,
        `Lemon ${mainIngredient} Delight`
      ]
    };

    const templates = recipeTemplates[cuisine] || recipeTemplates.american;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return randomTemplate;
  }

  generateDescription(ingredients, cuisine) {
    const template = this.cuisineTemplates[cuisine] || this.cuisineTemplates.american;
    return `A delicious ${cuisine} recipe featuring ${ingredients.slice(0, 3).join(', ')}. This dish combines ${template.flavorProfile} flavors for a satisfying meal.`;
  }

  formatIngredients(ingredients) {
    const quantities = ['1 cup', '2 pieces', '1 tablespoon', '1/2 cup', '2 cloves', '1 medium', '1 large', '2 cups'];
    
    return ingredients.map((ingredient, index) => ({
      name: ingredient,
      quantity: quantities[index % quantities.length].split(' ')[0],
      unit: quantities[index % quantities.length].split(' ').slice(1).join(' '),
      category: this.categorizeIngredient(ingredient)
    }));
  }

  categorizeIngredient(ingredient) {
    const categories = {
      protein: ['chicken', 'beef', 'pork', 'fish', 'eggs', 'tofu'],
      vegetable: ['tomato', 'onion', 'pepper', 'carrot', 'broccoli', 'spinach'],
      grain: ['rice', 'pasta', 'bread', 'quinoa', 'oats'],
      dairy: ['cheese', 'milk', 'butter', 'yogurt'],
      herb: ['basil', 'parsley', 'cilantro', 'oregano'],
      spice: ['garlic', 'ginger', 'cumin', 'paprika']
    };

    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => ingredient.toLowerCase().includes(item))) {
        return category;
      }
    }
    return 'other';
  }

  generateInstructions(ingredients, cuisine) {
    const instructions = [];
    let stepNumber = 1;

    // Cuisine-specific cooking methods
    const cookingStyles = {
      italian: {
        prep: `Prepare ingredients: dice ${ingredients.slice(0, 2).join(' and ')}, mince garlic.`,
        cooking: `Heat olive oil in a large pan. Sauté garlic until fragrant, add ${ingredients[0]} and cook until golden.`,
        flavor: `Add tomatoes, herbs, and seasonings. Simmer for 15-20 minutes until flavors meld.`,
        finish: `Garnish with fresh basil and parmesan. Serve with crusty bread.`
      },
      asian: {
        prep: `Slice ${ingredients[0]} thinly, prepare vegetables, and mix sauce ingredients.`,
        cooking: `Heat wok or large pan over high heat. Add oil and stir-fry ${ingredients[0]} for 3-4 minutes.`,
        flavor: `Add vegetables and sauce. Stir-fry for 2-3 minutes until vegetables are crisp-tender.`,
        finish: `Serve immediately over steamed rice, garnished with green onions and sesame seeds.`
      },
      mexican: {
        prep: `Season ${ingredients[0]} with cumin, chili powder, and lime juice. Dice onions and peppers.`,
        cooking: `Cook ${ingredients[0]} in a hot skillet until browned. Add vegetables and cook until tender.`,
        flavor: `Add salsa, beans, and spices. Simmer for 10 minutes until heated through.`,
        finish: `Serve with warm tortillas, avocado, cheese, and fresh cilantro.`
      },
      american: {
        prep: `Season ${ingredients[0]} with salt and pepper. Prepare vegetables and preheat oven to 375°F.`,
        cooking: `Brown ${ingredients[0]} in an oven-safe skillet. Add vegetables and cook until softened.`,
        flavor: `Add broth, herbs, and seasonings. Cover and bake for 25-30 minutes.`,
        finish: `Let rest for 5 minutes before serving. Garnish with fresh herbs.`
      },
      indian: {
        prep: `Marinate ${ingredients[0]} in yogurt and spices for 30 minutes. Prepare onion-ginger-garlic paste.`,
        cooking: `Heat oil in a heavy-bottomed pan. Add whole spices and onion paste, cook until golden.`,
        flavor: `Add ${ingredients[0]} and cook until sealed. Add tomatoes and spices, simmer covered.`,
        finish: `Garnish with fresh coriander and serve with basmati rice or naan bread.`
      }
    };

    const style = cookingStyles[cuisine] || cookingStyles.american;

    instructions.push({
      step: stepNumber++,
      description: style.prep,
      duration: 10,
      technique: 'preparation'
    });

    instructions.push({
      step: stepNumber++,
      description: style.cooking,
      duration: 8,
      technique: 'cooking'
    });

    instructions.push({
      step: stepNumber++,
      description: style.flavor,
      duration: 15,
      technique: 'flavoring'
    });

    instructions.push({
      step: stepNumber++,
      description: style.finish,
      duration: 2,
      technique: 'finishing'
    });

    return instructions;
  }

  calculateNutrition(ingredients, servings = 4) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    ingredients.forEach(ingredient => {
      const nutrition = this.nutritionData[ingredient.toLowerCase()] || this.nutritionData.default;
      totalCalories += nutrition.calories;
      totalProtein += nutrition.protein;
      totalCarbs += nutrition.carbs;
      totalFat += nutrition.fat;
    });

    return {
      calories: Math.round(totalCalories / servings),
      protein: Math.round(totalProtein / servings),
      carbohydrates: Math.round(totalCarbs / servings),
      fat: Math.round(totalFat / servings),
      fiber: Math.round(totalCarbs * 0.1 / servings),
      sugar: Math.round(totalCarbs * 0.2 / servings),
      sodium: Math.round(200 / servings),
      cholesterol: Math.round(50 / servings)
    };
  }

  inferDifficulty(ingredients) {
    if (ingredients.length <= 3) return 'easy';
    if (ingredients.length <= 6) return 'medium';
    return 'hard';
  }

  estimateCookingTime(ingredients) {
    const baseTime = 20;
    const additionalTime = ingredients.length * 5;
    return Math.min(baseTime + additionalTime, 90);
  }

  getDietaryTags(ingredients, constraints) {
    const tags = [];
    
    if (constraints.dietaryPreference) {
      tags.push(constraints.dietaryPreference);
    }

    const hasAnimalProducts = ingredients.some(ing => 
      ['chicken', 'beef', 'pork', 'fish', 'cheese', 'milk', 'eggs'].includes(ing.toLowerCase())
    );

    if (!hasAnimalProducts) {
      tags.push('vegetarian');
      
      const hasDairy = ingredients.some(ing => 
        ['cheese', 'milk', 'butter', 'yogurt'].includes(ing.toLowerCase())
      );
      
      if (!hasDairy) {
        tags.push('vegan');
      }
    }

    return [...new Set(tags)];
  }

  formatAppliedConstraints(constraints) {
    const formatted = [];
    
    for (const [key, value] of Object.entries(constraints)) {
      if (value !== undefined && value !== null) {
        formatted.push({
          constraintType: key,
          value: value
        });
      }
    }
    
    return formatted;
  }

  validateConstraints(constraints, metadata, nutrition) {
    const satisfied = [];

    if (constraints.calorieLimit && nutrition.calories <= constraints.calorieLimit) {
      satisfied.push({ constraint: 'calorieLimit', satisfied: true, reason: 'Within calorie limit' });
    }

    if (constraints.cookingTime && metadata.cookingTime <= constraints.cookingTime) {
      satisfied.push({ constraint: 'cookingTime', satisfied: true, reason: 'Within time limit' });
    }

    if (constraints.difficulty && metadata.difficulty === constraints.difficulty) {
      satisfied.push({ constraint: 'difficulty', satisfied: true, reason: 'Matches preferred difficulty' });
    }

    return satisfied;
  }

  // Learning methods (simplified)
  async learnFromFeedback(recipeId, rating, feedback, userPreferences) {
    console.log(`Learning from feedback for recipe ${recipeId}: ${rating}/5 - ${feedback}`);
    // In a real implementation, this would update the AI model
    return true;
  }
}

module.exports = SimpleRecipeEngine;