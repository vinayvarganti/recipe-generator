import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Stack,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Add,
  Delete,
  Restaurant,
  AutoAwesome,
  Timer,
  LocalDining,
  Favorite,
  Share,
  Save,
  TrendingUp,
  Psychology,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import AnimatedCard from '../components/Common/AnimatedCard';
import GradientButton from '../components/Common/GradientButton';

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

const RecipeGenerator = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState(['']);
  const [constraints, setConstraints] = useState({
    dietaryPreference: '',
    allergies: [],
    calorieLimit: 2000,
    cookingTime: 60,
    cuisine: '',
    difficulty: 'medium',
    servings: 4,
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const handleConstraintChange = (field, value) => {
    setConstraints({
      ...constraints,
      [field]: value,
    });
  };

  const addAllergy = () => {
    if (allergyInput.trim() && !constraints.allergies.includes(allergyInput.trim())) {
      setConstraints({
        ...constraints,
        allergies: [...constraints.allergies, allergyInput.trim()],
      });
      setAllergyInput('');
    }
  };

  const removeAllergy = (allergy) => {
    setConstraints({
      ...constraints,
      allergies: constraints.allergies.filter(a => a !== allergy),
    });
  };

  const handleGenerate = async () => {
    const validIngredients = ingredients.filter(ing => ing.trim() !== '');

    if (validIngredients.length < 2) {
      toast.error('Please provide at least 2 ingredients');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending request with:', { ingredients: validIngredients, constraints });

      const response = await axios.post('/api/recipes/generate', {
        ingredients: validIngredients,
        constraints,
      });

      console.log('Recipe generated:', response.data);
      setGeneratedRecipe(response.data.recipe);
      toast.success('Recipe generated successfully!');
    } catch (error) {
      console.error('Recipe generation error:', error);
      console.error('Error response:', error.response?.data);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to generate recipe. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (generatedRecipe) {
      navigate(`/recipe/${generatedRecipe._id}`);
    }
  };

  const cuisineOptions = [
    { value: '', label: 'Any Cuisine' },
    { value: 'italian', label: '🇮🇹 Italian' },
    { value: 'asian', label: '🥢 Asian' },
    { value: 'mexican', label: '🌮 Mexican' },
    { value: 'american', label: '🍔 American' },
    { value: 'mediterranean', label: '🫒 Mediterranean' },
    { value: 'indian', label: '🍛 Indian' },
    { value: 'french', label: '🇫🇷 French' },
    { value: 'thai', label: '🌶️ Thai' },
  ];

  const dietaryOptions = [
    { value: '', label: 'No Preference' },
    { value: 'vegetarian', label: '🥬 Vegetarian' },
    { value: 'vegan', label: '🌱 Vegan' },
    { value: 'non-vegetarian', label: '🥩 Non-Vegetarian' },
    { value: 'pescatarian', label: '🐟 Pescatarian' },
    { value: 'keto', label: '🥑 Keto' },
    { value: 'paleo', label: '🦴 Paleo' },
    { value: 'gluten-free', label: '🌾 Gluten-Free' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        textAlign="center"
        sx={{ mb: 6 }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FF6B35 0%, #4CAF50 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🤖 AI Recipe Generator
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          Transform your ingredients into culinary masterpieces using advanced cognitive AI
        </Typography>
      </MotionBox>

      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} lg={6}>
          <AnimatedCard gradient sx={{ p: 4, height: 'fit-content' }}>
            <Stack spacing={4}>
              {/* Header */}
              <Box>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Psychology color="primary" />
                  Smart Recipe Builder
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tell our AI about your ingredients and preferences
                </Typography>
              </Box>

              {/* Ingredients Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Restaurant color="secondary" />
                  Available Ingredients
                </Typography>
                <Stack spacing={2}>
                  <AnimatePresence>
                    {ingredients.map((ingredient, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            fullWidth
                            size="medium"
                            placeholder={`Ingredient ${index + 1}`}
                            value={ingredient}
                            onChange={(e) => handleIngredientChange(index, e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                              }
                            }}
                          />
                          <IconButton
                            color="error"
                            onClick={() => removeIngredient(index)}
                            disabled={ingredients.length === 1}
                            sx={{
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'error.main',
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'white',
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addIngredient}
                    sx={{
                      borderRadius: 3,
                      borderStyle: 'dashed',
                      py: 1.5,
                      '&:hover': {
                        borderStyle: 'solid',
                      }
                    }}
                  >
                    Add Another Ingredient
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {/* Preferences */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="success" />
                  Recipe Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Dietary Preference</InputLabel>
                      <Select
                        value={constraints.dietaryPreference}
                        label="Dietary Preference"
                        onChange={(e) => handleConstraintChange('dietaryPreference', e.target.value)}
                        sx={{ borderRadius: 3 }}
                      >
                        {dietaryOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Cuisine Type</InputLabel>
                      <Select
                        value={constraints.cuisine}
                        label="Cuisine Type"
                        onChange={(e) => handleConstraintChange('cuisine', e.target.value)}
                        sx={{ borderRadius: 3 }}
                      >
                        {cuisineOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Difficulty Level</InputLabel>
                      <Select
                        value={constraints.difficulty}
                        label="Difficulty Level"
                        onChange={(e) => handleConstraintChange('difficulty', e.target.value)}
                        sx={{ borderRadius: 3 }}
                      >
                        <MenuItem value="easy">🟢 Easy</MenuItem>
                        <MenuItem value="medium">🟡 Medium</MenuItem>
                        <MenuItem value="hard">🔴 Hard</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Number of Servings"
                      value={constraints.servings}
                      onChange={(e) => handleConstraintChange('servings', parseInt(e.target.value) || 4)}
                      inputProps={{ min: 1, max: 12 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Sliders */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timer color="info" />
                  Constraints
                </Typography>

                <Stack spacing={4}>
                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 600 }}>
                      Maximum Calories: {constraints.calorieLimit} cal
                    </Typography>
                    <Slider
                      value={constraints.calorieLimit}
                      onChange={(e, value) => handleConstraintChange('calorieLimit', value)}
                      min={500}
                      max={3000}
                      step={100}
                      marks={[
                        { value: 500, label: '500' },
                        { value: 1500, label: '1500' },
                        { value: 3000, label: '3000' },
                      ]}
                      sx={{
                        '& .MuiSlider-thumb': {
                          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
                        },
                        '& .MuiSlider-track': {
                          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 600 }}>
                      Maximum Cooking Time: {constraints.cookingTime} minutes
                    </Typography>
                    <Slider
                      value={constraints.cookingTime}
                      onChange={(e, value) => handleConstraintChange('cookingTime', value)}
                      min={15}
                      max={240}
                      step={15}
                      marks={[
                        { value: 15, label: '15m' },
                        { value: 60, label: '1h' },
                        { value: 240, label: '4h' },
                      ]}
                      sx={{
                        '& .MuiSlider-thumb': {
                          background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                        },
                        '& .MuiSlider-track': {
                          background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Allergies */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  🚫 Allergies & Restrictions
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder="Add allergy or restriction"
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                      sx={{
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={addAllergy}
                      sx={{ borderRadius: 3, px: 3 }}
                    >
                      Add
                    </Button>
                  </Box>

                  {constraints.allergies.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <AnimatePresence>
                        {constraints.allergies.map((allergy, index) => (
                          <motion.div
                            key={allergy}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Chip
                              label={allergy}
                              onDelete={() => removeAllergy(allergy)}
                              color="error"
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Generate Button */}
              <GradientButton
                fullWidth
                size="large"
                onClick={handleGenerate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                sx={{ py: 2, fontSize: '1.1rem' }}
              >
                {loading ? 'AI is Creating Your Recipe...' : 'Generate Recipe with AI'}
              </GradientButton>
            </Stack>
          </AnimatedCard>
        </Grid>

        {/* Generated Recipe Display */}
        <Grid item xs={12} lg={6}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard sx={{ p: 4, textAlign: 'center', minHeight: 400 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <CircularProgress size={80} thickness={4} />
                    <Typography variant="h5" fontWeight="bold">
                      AI is Analyzing Your Ingredients...
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Our cognitive engine is crafting the perfect recipe for you
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {['Analyzing flavors', 'Checking compatibility', 'Optimizing nutrition', 'Finalizing recipe'].map((step, index) => (
                        <Chip
                          key={step}
                          label={step}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            animation: `pulse 2s infinite ${index * 0.5}s`,
                            '@keyframes pulse': {
                              '0%': { opacity: 0.5 },
                              '50%': { opacity: 1 },
                              '100%': { opacity: 0.5 },
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </AnimatedCard>
              </motion.div>
            )}

            {generatedRecipe && (
              <motion.div
                key="recipe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AnimatedCard gradient sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    {/* Recipe Header */}
                    <Box>
                      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🍽️ {generatedRecipe.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {generatedRecipe.description}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          icon={<LocalDining />}
                          label={`${generatedRecipe.metadata.cuisine} Cuisine`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<Timer />}
                          label={`${generatedRecipe.metadata.cookingTime} min`}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${generatedRecipe.metadata.difficulty} Level`}
                          color="success"
                          variant="outlined"
                        />
                        <Chip
                          label={`${generatedRecipe.metadata.servings} Servings`}
                          color="info"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>

                    {/* Nutrition Info */}
                    {generatedRecipe.nutritionalInfo && (
                      <Alert
                        severity="info"
                        sx={{
                          borderRadius: 3,
                          '& .MuiAlert-message': { width: '100%' }
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          <strong>Nutritional Information</strong>
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>{generatedRecipe.nutritionalInfo.calories}</strong> calories
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>{generatedRecipe.nutritionalInfo.protein}g</strong> protein
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>{generatedRecipe.nutritionalInfo.carbohydrates}g</strong> carbs
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2">
                              <strong>{generatedRecipe.nutritionalInfo.fat || 'N/A'}g</strong> fat
                            </Typography>
                          </Grid>
                        </Grid>
                      </Alert>
                    )}

                    {/* Ingredients */}
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Restaurant color="primary" />
                        Ingredients
                      </Typography>
                      <Grid container spacing={1}>
                        {generatedRecipe.ingredients.map((ingredient, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                backgroundColor: 'rgba(255, 107, 53, 0.05)',
                                borderRadius: 2,
                                border: '1px solid rgba(255, 107, 53, 0.1)',
                              }}
                            >
                              <Typography variant="body2">
                                <strong>{ingredient.quantity} {ingredient.unit}</strong> {ingredient.name}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Instructions */}
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome color="secondary" />
                        Cooking Instructions
                      </Typography>
                      <Stack spacing={2}>
                        {generatedRecipe.instructions.map((instruction, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 3,
                              backgroundColor: 'rgba(76, 175, 80, 0.05)',
                              borderRadius: 2,
                              border: '1px solid rgba(76, 175, 80, 0.1)',
                              position: 'relative',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                left: -1,
                                top: -1,
                                bottom: -1,
                                width: 4,
                                backgroundColor: 'secondary.main',
                                borderRadius: '2px 0 0 2px',
                              }}
                            />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              <strong>Step {instruction.step}:</strong> {instruction.description}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <GradientButton
                        onClick={handleSaveRecipe}
                        startIcon={<Save />}
                        sx={{ flex: 1 }}
                      >
                        View Full Recipe
                      </GradientButton>
                      <Button
                        variant="outlined"
                        startIcon={<Favorite />}
                        sx={{ borderRadius: 3 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Share />}
                        sx={{ borderRadius: 3 }}
                      >
                        Share
                      </Button>
                    </Stack>
                  </Stack>
                </AnimatedCard>
              </motion.div>
            )}

            {!loading && !generatedRecipe && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard sx={{ p: 6, textAlign: 'center', minHeight: 400 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(76,175,80,0.1) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Restaurant sx={{ fontSize: 60, color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="h5" color="text.secondary" fontWeight="bold">
                      Your AI-Generated Recipe Will Appear Here
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                      Fill in your ingredients and preferences, then let our cognitive AI create the perfect recipe for you
                    </Typography>
                  </Box>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecipeGenerator;