import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Restaurant,
  Favorite,
  TrendingUp,
  Add,
  AutoAwesome,
  Timer,
  LocalDining,
  Psychology,
  Speed,
  Star,
  ArrowForward,
  BookmarkBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import AnimatedCard from '../components/Common/AnimatedCard';
import GradientButton from '../components/Common/GradientButton';

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/users/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your culinary dashboard..." />;
  }

  const stats = dashboardData?.statistics || {};
  const recentRecipes = dashboardData?.recentRecipes || [];
  const favoriteRecipes = dashboardData?.favoriteRecipes || [];

  const quickActions = [
    {
      title: 'Generate New Recipe',
      description: 'Create a recipe with AI using your ingredients',
      icon: <AutoAwesome />,
      color: 'primary',
      path: '/generate',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
    },
    {
      title: 'My Recipe Collection',
      description: 'Browse and manage your generated recipes',
      icon: <BookmarkBorder />,
      color: 'secondary',
      path: '/my-recipes',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
    },
    {
      title: 'Favorite Recipes',
      description: 'Quick access to your most loved recipes',
      icon: <Favorite />,
      color: 'error',
      path: '/profile',
      gradient: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)',
    },
  ];

  const statCards = [
    {
      title: 'Recipes Generated',
      value: stats.totalRecipes || 0,
      icon: <Restaurant />,
      color: 'primary',
      description: 'Total AI-generated recipes',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}★` : '0.0★',
      icon: <Star />,
      color: 'warning',
      description: 'Your recipe quality score',
    },
    {
      title: 'Favorite Count',
      value: stats.favoriteRecipesCount || 0,
      icon: <Favorite />,
      color: 'error',
      description: 'Recipes you loved',
    },
    {
      title: 'Total Ratings',
      value: stats.totalRatings || 0,
      icon: <TrendingUp />,
      color: 'success',
      description: 'Community feedback received',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{ mb: 6 }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(76,175,80,0.1) 100%)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(76,175,80,0.1) 100%)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
            }}
          />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #FF6B35 0%, #4CAF50 100%)',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {user?.profile?.firstName?.charAt(0) || user?.username?.charAt(0)}
            </Avatar>
            <Box>
              <MotionTypography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Welcome back, {user?.profile?.firstName || user?.username}! 👋
              </MotionTypography>
              <MotionTypography
                variant="h6"
                color="text.secondary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Ready to create some amazing recipes with AI? Let's cook up something special!
              </MotionTypography>
            </Box>
          </Stack>
        </Box>
      </MotionBox>

      {/* Quick Actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          🚀 Quick Actions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div variants={itemVariants}>
                <AnimatedCard
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    background: `${action.gradient}08`,
                    border: `1px solid ${action.gradient.match(/#[A-Fa-f0-9]{6}/)[0]}20`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      background: action.gradient,
                      borderRadius: '50%',
                      opacity: 0.1,
                    }}
                  />
                  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          background: action.gradient,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        sx={{
                          background: action.gradient,
                          color: 'white',
                          '&:hover': {
                            background: action.gradient,
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Box>
                  </CardContent>
                </AnimatedCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Statistics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          📊 Your Cooking Stats
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div variants={itemVariants}>
                <AnimatedCard gradient>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        mx: 'auto',
                        mb: 2,
                        width: 56,
                        height: 56,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Recent & Favorite Recipes */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <AnimatedCard gradient sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Psychology color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Recent AI Creations
                  </Typography>
                </Stack>

                {recentRecipes.length > 0 ? (
                  <Stack spacing={2}>
                    {recentRecipes.slice(0, 4).map((recipe, index) => (
                      <motion.div
                        key={recipe._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(255,107,53,0.05) 0%, rgba(76,175,80,0.05) 100%)',
                            border: '1px solid rgba(255,107,53,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0px 8px 25px rgba(0,0,0,0.1)',
                            },
                          }}
                          onClick={() => navigate(`/recipe/${recipe._id}`)}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {recipe.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={recipe.metadata?.cuisine || 'Unknown'}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(recipe.createdAt).toLocaleDateString()}
                                </Typography>
                              </Stack>
                            </Box>
                            <Stack alignItems="center" spacing={0.5}>
                              <Chip
                                label={`${recipe.userInteraction?.averageRating?.toFixed(1) || '0.0'} ⭐`}
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 600 }}
                              />
                              <IconButton size="small" color="primary">
                                <ArrowForward fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Box>
                      </motion.div>
                    ))}

                    <GradientButton
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate('/my-recipes')}
                      endIcon={<ArrowForward />}
                      sx={{ mt: 2 }}
                    >
                      View All {stats.totalRecipes || 0} Recipes
                    </GradientButton>
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        mx: 'auto',
                        mb: 2,
                        width: 80,
                        height: 80,
                      }}
                    >
                      <Restaurant sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      No recipes yet!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Generate your first AI-powered recipe and start your culinary journey
                    </Typography>
                    <GradientButton
                      onClick={() => navigate('/generate')}
                      startIcon={<AutoAwesome />}
                    >
                      Generate First Recipe
                    </GradientButton>
                  </Box>
                )}
              </CardContent>
            </AnimatedCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <AnimatedCard gradient sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Favorite color="error" />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Favorite Recipes
                  </Typography>
                </Stack>

                {favoriteRecipes.length > 0 ? (
                  <Stack spacing={2}>
                    {favoriteRecipes.slice(0, 4).map((recipe, index) => (
                      <motion.div
                        key={recipe._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(233,30,99,0.05) 0%, rgba(244,143,177,0.05) 100%)',
                            border: '1px solid rgba(233,30,99,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0px 8px 25px rgba(0,0,0,0.1)',
                            },
                          }}
                          onClick={() => navigate(`/recipe/${recipe._id}`)}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {recipe.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={recipe.metadata?.cuisine || 'Unknown'}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(recipe.createdAt).toLocaleDateString()}
                                </Typography>
                              </Stack>
                            </Box>
                            <Stack alignItems="center" spacing={0.5}>
                              <Favorite color="error" />
                              <IconButton size="small" color="error">
                                <ArrowForward fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'error.light',
                        mx: 'auto',
                        mb: 2,
                        width: 80,
                        height: 80,
                      }}
                    >
                      <Favorite sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      No favorites yet!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start exploring recipes and mark your favorites for quick access
                    </Typography>
                    <GradientButton
                      onClick={() => navigate('/my-recipes')}
                      startIcon={<BookmarkBorder />}
                      variant="outlined"
                    >
                      Browse Recipes
                    </GradientButton>
                  </Box>
                )}
              </CardContent>
            </AnimatedCard>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;