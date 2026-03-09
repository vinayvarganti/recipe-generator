import React from 'react';
import { Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

const MotionButton = motion.create(Button);

const GradientButton = ({
  children,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  sx = {},
  ...props
}) => {
  const gradientStyles = {
    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
    color: 'white',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      background: 'linear-gradient(135deg, #E64A19 0%, #FF6B35 100%)',
    },
    '&:disabled': {
      background: 'linear-gradient(135deg, #BDBDBD 0%, #9E9E9E 100%)',
      color: 'white',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'left 0.5s',
    },
    '&:hover::before': {
      left: '100%',
    },
  };

  const outlinedStyles = {
    background: 'transparent',
    border: '2px solid #FF6B35',
    color: '#FF6B35',
    '&:hover': {
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
      color: 'white',
      border: '2px solid #FF6B35',
    },
  };

  return (
    <MotionButton
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      sx={{
        ...(variant === 'contained' ? gradientStyles : outlinedStyles),
        borderRadius: 3,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: variant === 'contained' ? '0px 4px 15px rgba(255, 107, 53, 0.3)' : 'none',
        transition: 'all 0.3s ease',
        ...sx,
      }}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export default GradientButton;