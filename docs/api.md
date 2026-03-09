# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

#### POST /auth/login
Login user.

#### GET /auth/me
Get current user information. (Protected)

### Recipe Generation

#### POST /recipes/generate
Generate a new recipe using AI. (Protected)

#### GET /recipes/my-recipes
Get user's generated recipes. (Protected)

#### GET /recipes/:id
Get recipe by ID. (Protected)

#### POST /recipes/:id/rate
Rate a recipe and provide feedback. (Protected)

### Nutrition APIs

#### POST /nutrition/calculate
Calculate nutritional information for ingredients. (Protected)

**Request Body:**
```json
{
  "ingredients": [
    {
      "name": "chicken breast",
      "quantity": "200",
      "unit": "grams"
    }
  ],
  "servings": 2
}
```

**Response:**
```json
{
  "totalNutrition": {
    "calories": 330,
    "protein": 62,
    "carbohydrates": 0,
    "fat": 7.2
  },
  "nutritionPerServing": {
    "calories": 165,
    "protein": 31,
    "carbohydrates": 0,
    "fat": 3.6
  },
  "nutritionBreakdown": [...]
}
```

#### GET /nutrition/daily-values
Get daily recommended nutritional values. (Protected)

#### POST /nutrition/analyze-recipe
Analyze nutritional quality of a recipe. (Protected)

### Search APIs

#### GET /search/recipes
Advanced recipe search with multiple filters. (Protected)

**Query Parameters:**
- `q` - Search query
- `cuisine` - Cuisine types (comma-separated)
- `difficulty` - Difficulty levels
- `maxTime` - Maximum cooking time
- `minRating` - Minimum rating
- `dietary` - Dietary restrictions
- `ingredients` - Required ingredients
- `excludeIngredients` - Ingredients to exclude
- `maxCalories` - Maximum calories
- `sortBy` - Sort by (relevance, rating, newest, cookingTime, calories)

#### GET /search/ingredients
Search ingredients with autocomplete. (Protected)

#### GET /search/similar-recipes/:id
Find similar recipes based on ingredients and cuisine. (Protected)

#### GET /search/trending
Get trending recipes, ingredients, or cuisines. (Protected)

**Query Parameters:**
- `type` - Type of trending data (recipes, ingredients, cuisines)
- `period` - Time period (day, week, month)

### Analytics APIs

#### GET /analytics/user-insights
Get personalized user analytics and insights. (Protected)

**Response:**
```json
{
  "totalRecipes": 15,
  "averageRating": 4.2,
  "preferences": {
    "favoriteCuisine": "italian",
    "mostUsedIngredients": [...],
    "preferredDifficulty": "medium"
  },
  "patterns": {...},
  "recommendations": [...]
}
```

#### GET /analytics/recipe-performance/:id
Get detailed analytics for a specific recipe. (Protected)

#### GET /analytics/platform-stats
Get platform-wide analytics. (Admin only)

#### GET /analytics/ingredient-insights
Get insights about ingredient usage and trends. (Protected)

### Social Features

#### POST /social/share-recipe/:id
Share a recipe publicly or make it private. (Protected)

**Request Body:**
```json
{
  "isPublic": true,
  "shareMessage": "Check out this amazing recipe!"
}
```

#### GET /social/public-recipes
Get public recipes from the community. (Protected)

#### POST /social/like-recipe/:id
Like or unlike a public recipe. (Protected)

#### POST /social/view-recipe/:id
Increment view count for a public recipe. (Protected)

#### GET /social/user-profile/:username
Get public profile of a user. (Protected)

#### POST /social/follow-user/:username
Follow or unfollow a user. (Protected)

#### GET /social/feed
Get personalized feed of recipes from followed users. (Protected)

#### GET /social/my-social-stats
Get current user's social statistics. (Protected)

### Ingredients

#### GET /ingredients
Get all ingredients with search and filtering. (Protected)

#### POST /ingredients/suggest
Get ingredient suggestions based on input. (Protected)

### AI Engine

#### POST /ai/analyze-ingredients
Analyze ingredient compatibility. (Protected)

#### POST /ai/suggest-improvements
Suggest recipe improvements based on constraints. (Protected)

#### POST /ai/validate-constraints
Validate if a recipe satisfies given constraints. (Protected)

#### POST /ai/explain-reasoning
Explain AI reasoning for a generated recipe. (Protected)

#### GET /ai/learning-insights
Get AI learning insights and statistics. (Protected)

### Admin Endpoints

#### GET /admin/dashboard
Get admin dashboard statistics. (Admin only)

#### GET /admin/users
Get all users with pagination and filtering. (Admin only)

#### PUT /admin/users/:id
Update user (activate/deactivate, change role). (Admin only)

#### GET /admin/recipes
Get all recipes with filtering. (Admin only)

#### PUT /admin/recipes/:id
Update recipe status. (Admin only)

## New API Features Added

### 🔬 **Nutrition Analysis**
- Calculate detailed nutritional information
- Analyze recipe health scores
- Get daily value recommendations
- Macro and micronutrient analysis

### 🔍 **Advanced Search**
- Multi-filter recipe search
- Ingredient autocomplete
- Similar recipe recommendations
- Trending content discovery

### 📊 **Analytics & Insights**
- Personal cooking analytics
- Recipe performance metrics
- Platform-wide statistics
- Ingredient usage trends

### 👥 **Social Features**
- Recipe sharing and community
- User following system
- Personalized feed
- Like and view tracking

### 🤖 **Enhanced AI**
- Recipe improvement suggestions
- Constraint validation
- AI reasoning explanations
- Learning insights

## Error Responses

All endpoints may return standard HTTP error responses with JSON error messages.