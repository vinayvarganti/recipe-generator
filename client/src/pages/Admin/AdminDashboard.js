import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
} from '@mui/material';
import {
  People,
  Restaurant,
  Inventory,
  TrendingUp,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  const stats = dashboardData?.statistics || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettings /> Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, recipes, and system settings
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People color="primary" sx={{ mr: 1, fontSize: 30 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.users?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="success.main">
                {stats.users?.activeUsers || 0} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Restaurant color="secondary" sx={{ mr: 1, fontSize: 30 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.recipes?.totalRecipes || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Recipes
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="info.main">
                Avg rating: {stats.recipes?.averageRating?.toFixed(1) || '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Inventory color="success" sx={{ mr: 1, fontSize: 30 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.ingredients?.totalIngredients || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingredients
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="warning.main">
                {stats.ingredients?.verifiedIngredients || 0} verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="error" sx={{ mr: 1, fontSize: 30 }} />
                <Box>
                  <Typography variant="h4">
                    {stats.recipes?.totalRatings || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Ratings
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                User feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
            onClick={() => navigate('/admin/users')}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <People sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Manage Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View, activate, deactivate users and manage roles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
            onClick={() => navigate('/admin/recipes')}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Restaurant sx={{ fontSize: 50, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Manage Recipes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review, moderate and manage all generated recipes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
            onClick={() => navigate('/admin/ingredients')}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Inventory sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Manage Ingredients
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update ingredient database and nutritional information
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Users
              </Typography>
              {dashboardData?.recentActivity?.users?.map((user) => (
                <Box
                  key={user._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color={user.isActive ? 'success.main' : 'error.main'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              ))}
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate('/admin/users')}
              >
                View All Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Recipes
              </Typography>
              {dashboardData?.recentActivity?.recipes?.map((recipe) => (
                <Box
                  key={recipe._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      {recipe.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {recipe.userInteraction?.createdBy?.username}
                    </Typography>
                  </Box>
                  <Typography variant="caption">
                    {recipe.userInteraction?.averageRating?.toFixed(1) || '0.0'} ⭐
                  </Typography>
                </Box>
              ))}
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate('/admin/recipes')}
              >
                View All Recipes
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;