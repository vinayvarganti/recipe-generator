import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
  alpha,
  Avatar,
} from '@mui/material';
import {
  Restaurant,
  Psychology,
  TrendingUp,
  Security,
  AutoAwesome,
  Speed,
  Favorite,
  Star,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCard from '../components/Common/AnimatedCard';

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);
const MotionGrid = motion.create(Grid);

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40 }} />,
      title: 'AI Chef',
      description: 'Generates unique recipes understanding flavor profiles.',
      color: theme.palette.primary.main,
    },
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'Smart Learning',
      description: 'Adapts to your taste preferences over time.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Dietary Safe',
      description: 'Strict adherence to allergies and restrictions.',
      color: theme.palette.info.main,
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Trend Analysis',
      description: 'Incorporates latest culinary trends.',
      color: theme.palette.accent.main,
    },
  ];

  const stats = [
    { number: '10K+', label: 'Recipes', icon: <Restaurant /> },
    { number: '4.9', label: 'Rating', icon: <Star /> },
    { number: '2M+', label: 'Users', icon: <Favorite /> },
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.default} 90%)`,
          overflow: 'hidden',
          pt: { xs: 8, md: 0 },
        }}
      >
        {/* Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <MotionBox
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <MotionTypography
                  variants={heroVariants}
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    fontSize: { xs: '3rem', md: '5rem' },
                    lineHeight: 1.1,
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Cook Smarter, <br />
                  Eat Better.
                </MotionTypography>

                <MotionTypography
                  variants={heroVariants}
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: '600px', fontWeight: 400 }}
                >
                  Experience the future of cooking with our AI-powered recipe generator.
                  Turn any ingredients into culinary masterpieces instantly.
                </MotionTypography>

                <MotionBox variants={heroVariants} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    startIcon={<AutoAwesome />}
                    sx={{
                      fontSize: '1.1rem',
                      px: 4,
                      py: 1.5,
                      borderRadius: '50px',
                      background: theme.palette.primary.main,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                      boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }}
                  >
                    Start Generating
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    startIcon={<PlayArrow />}
                    sx={{
                      fontSize: '1.1rem',
                      px: 4,
                      py: 1.5,
                      borderRadius: '50px',
                      borderWidth: 2,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: alpha(theme.palette.text.primary, 0.05),
                      }
                    }}
                  >
                    How it Works
                  </Button>
                </MotionBox>

                <MotionBox variants={heroVariants} sx={{ mt: 6, display: 'flex', gap: 4 }}>
                  {stats.map((stat, index) => (
                    <Box key={index}>
                      <Typography variant="h4" fontWeight="800" color="text.primary">
                        {stat.number}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        {React.cloneElement(stat.icon, { fontSize: 'small' })}
                        <Typography variant="body2" fontWeight="500">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </MotionBox>
              </MotionBox>
            </Grid>

            {/* Hero Image / Visual */}
            <Grid item xs={12} md={5}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring" }}
                sx={{ position: 'relative' }}
              >
                <Box
                  className="glass-card"
                  sx={{
                    p: 4,
                    borderRadius: '30px',
                    background: alpha('#fff', 0.6),
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    transform: 'rotate(6deg)',
                    zIndex: 2,
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                      <AutoAwesome />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">Morning Delight</Typography>
                      <Typography variant="caption" color="text.secondary">Generated in 2.3s</Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      height: 200,
                      borderRadius: '20px',
                      background: `linear-gradient(45deg, ${theme.palette.primary.light}, #FFAB91)`,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    <Restaurant sx={{ fontSize: 80, opacity: 0.5 }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label="Healthy" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} />
                    <Chip label="Quick" size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} />
                    <Chip label="Breakfast" size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }} />
                  </Box>
                </Box>

                {/* Decorative floating elements */}
                <MotionBox
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  sx={{
                    position: 'absolute',
                    top: -40,
                    right: -20,
                    zIndex: 1,
                  }}
                >
                  <Card sx={{ p: 2, borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star sx={{ color: theme.palette.accent.main }} />
                      <Typography fontWeight="bold">4.9 Rating</Typography>
                    </Box>
                  </Card>
                </MotionBox>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="800"
          sx={{ mb: 2 }}
        >
          Why Choose Us?
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
        >
          Technology meets taste. Discover the power of AI in your kitchen.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <AnimatedCard
                delay={index * 0.1}
                sx={{
                  height: '100%',
                  p: 3,
                  background: alpha('#fff', 0.8),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: `0 20px 40px ${alpha(feature.color, 0.15)}`,
                    borderColor: feature.color,
                  }
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    background: alpha(feature.color, 0.1),
                    color: feature.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                  {feature.description}
                </Typography>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;