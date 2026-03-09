import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, Visibility, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const MyRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecipes = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get('/api/recipes/my-recipes', {
        params: { page, limit: 12, search }
      });
      setRecipes(response.data.recipes);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handlePageChange = (event, page) => {
    fetchRecipes(page, searchTerm);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      fetchRecipes(1, searchTerm);
    }
  };

  if (loading && recipes.length === 0) {
    return <LoadingSpinner message="Loading your recipes..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        My Recipes 📚
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        All your AI-generated recipes in one place
      </Typography>

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search your recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {recipes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No recipes found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'Try a different search term' : 'Generate your first recipe with AI!'}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/generate')}
          >
            Generate Recipe
          </Button>
        </Box>
      ) : (
        <>
          {/* Recipe Grid */}
          <Grid container spacing={3}>
            {recipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {recipe.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {recipe.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={recipe.metadata.cuisine} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={recipe.metadata.difficulty} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${recipe.metadata.cookingTime}min`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star sx={{ color: 'gold', fontSize: 20 }} />
                      <Typography variant="body2">
                        {recipe.userInteraction.averageRating?.toFixed(1) || '0.0'} 
                        ({recipe.userInteraction.totalRatings || 0} ratings)
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Created: {new Date(recipe.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/recipe/${recipe._id}`)}
                      fullWidth
                    >
                      View Recipe
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.current}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* Summary */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {recipes.length} of {pagination.total} recipes
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
};

export default MyRecipes;