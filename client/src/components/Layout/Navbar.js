import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Badge,
  Chip,
  alpha,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Restaurant,
  BookmarkBorder,
  Person,
  AdminPanelSettings,
  Logout,
  Notifications,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Generate', icon: <Restaurant />, path: '/generate' },
    { text: 'My Recipes', icon: <BookmarkBorder />, path: '/my-recipes' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      text: 'Admin',
      icon: <AdminPanelSettings />,
      path: '/admin',
    });
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white'
      }}
    >
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            margin: '0 auto',
            bgcolor: 'white',
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: '1.5rem',
            mb: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {user?.username}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {user?.email}
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mt: 2,
            color: '#FFCDD2',
            '&:hover': {
              backgroundColor: 'rgba(255, 23, 68, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#FFCDD2' }}><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', // Safari support
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(user ? '/dashboard' : '/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                flexGrow: { xs: 1, md: 0 },
                mr: 4
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: '12px',
                  p: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <AutoAwesome sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                RecipeCreator
              </Typography>
            </MotionBox>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      backgroundColor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        color: 'primary.main',
                      },
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {!isMobile && (
                <IconButton
                  sx={{
                    color: 'text.secondary',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)', color: 'primary.main' }
                  }}
                >
                  <Badge badgeContent={2} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              )}

              <Box
                onClick={handleProfileMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  p: 0.5,
                  pr: 2,
                  borderRadius: '30px',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2}>
                      {user?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" lineHeight={1}>
                      {user?.role === 'admin' ? 'Admin' : 'Chef'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 3,
            minWidth: 220,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 24,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }} sx={{ py: 1.5, px: 2.5 }}>
          <ListItemIcon><Person fontSize="small" sx={{ color: 'primary.main' }} /></ListItemIcon>
          Profile
        </MenuItem>

        {user?.role === 'admin' && (
          <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }} sx={{ py: 1.5, px: 2.5 }}>
            <ListItemIcon><AdminPanelSettings fontSize="small" sx={{ color: 'secondary.main' }} /></ListItemIcon>
            Admin Panel
          </MenuItem>
        )}

        <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2.5, color: 'error.main' }}>
          <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;