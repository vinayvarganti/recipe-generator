import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Rating,
  TextField,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  AccessTime,
  Restaurant,
  People,
  LocalDining,
  CheckCircle,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`/api/recipes/${id}`);
        setRecipe(response.data.recipe);
        setIsFavorited(response.data.recipe.userInteraction.isFavorited);
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
        toast.error('Recipe not found');
        navigate('/my-recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await axios.post(`/api/recipes/${id}/rate`, {
        rating,
        feedback,
      });

      setRecipe(prev => ({
        ...prev,
        userInteraction: {
          ...prev.userInteraction,
          averageRating: response.data.averageRating,
          totalRatings: response.data.totalRatings,
        }
      }));

      setRating(0);
      setFeedback('');
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      const response = await axios.post(`/api/recipes/${id}/favorite`);
      setIsFavorited(response.data.isFavorited);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading recipe..." />;
  }

  if (!recipe) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Recipe not found</Typography>
        <Button onClick={() => navigate('/my-recipes')} sx={{ mt: 2 }}>
          Back to My Recipes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h3" component="h1">
            {recipe.name}
          </Typography>
          <Button
            variant="outlined"
            startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
            onClick={handleFavoriteToggle}
            color={isFavorited ? 'error' : 'primary'}
          >
            {isFavorited ? 'Favorited' : 'Add to Favorites'}
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {recipe.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {recipe.metadata.dietaryTags.map((tag) => (
            <Chip key={tag} label={tag} color="primary" size="small" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime color="action" />
            <Typography variant="body2">
              {recipe.metadata.prepTime + recipe.metadata.cookingTime} min total
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Restaurant color="action" />
            <Typography variant="body2">
              {recipe.metadata.difficulty}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People color="action" />
            <Typography variant="body2">
              {recipe.metadata.servings} servings
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalDining color="action" />
            <Typography variant="body2">
              {recipe.metadata.cuisine}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Ingredients */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Ingredients
              </Typography>
              <List>
                {recipe.ingredients.map((ingredient, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Instructions
              </Typography>
              {recipe.instructions.map((instruction, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Step {instruction.step}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {instruction.description}
                  </Typography>
                  {instruction.duration && (
                    <Typography variant="body2" color="text.secondary">
                      Duration: {instruction.duration} minutes
                    </Typography>
                  )}
                  {instruction.temperature && (
                    <Typography variant="body2" color="text.secondary">
                      Temperature: {instruction.temperature}
                    </Typography>
                  )}
                  {index < recipe.instructions.length - 1 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Rating Section */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Rate This Recipe
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Rating: {recipe.userInteraction.averageRating?.toFixed(1) || '0.0'} 
                  ({recipe.userInteraction.totalRatings || 0} ratings)
                </Typography>
                <Rating
                  value={recipe.userInteraction.averageRating || 0}
                  readOnly
                  precision={0.1}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Your Rating
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                  size="large"
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Share your thoughts about this recipe..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleRatingSubmit}
                disabled={submittingRating || rating === 0}
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Nutritional Info */}
          {recipe.nutritionalInfo && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nutritional Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Calories:</strong> {recipe.nutritionalInfo.calories}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Protein:</strong> {recipe.nutritionalInfo.protein}g
                  </Typography>
                  <Typography variant="body2">
                    <strong>Carbs:</strong> {recipe.nutritionalInfo.carbohydrates}g
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fat:</strong> {recipe.nutritionalInfo.fat}g
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fiber:</strong> {recipe.nutritionalInfo.fiber}g
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sugar:</strong> {recipe.nutritionalInfo.sugar}g
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* AI Generation Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Generation Details
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Input Ingredients:</strong>
              </Typography>
              <Box sx={{ mb: 2 }}>
                {recipe.aiGeneration?.inputIngredients?.map((ingredient, index) => (
                  <Chip key={index} label={ingredient} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                )) || <Typography variant="body2">No ingredients data</Typography>}
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Generation ID:</strong> {recipe.aiGeneration?.generationId || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Constraints Satisfied:</strong> {recipe.constraints?.satisfiedConstraints?.length || 0}
              </Typography>
            </CardContent>
          </Card>

          {/* Actions */}
          <Paper sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/generate')}
              sx={{ mb: 1 }}
            >
              Generate Similar Recipe
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/my-recipes')}
            >
              Back to My Recipes
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecipeDetail;