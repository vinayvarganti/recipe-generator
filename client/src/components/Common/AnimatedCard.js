import React from 'react';
import { Card, CardContent, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion.create(Card);

const AnimatedCard = ({
  children,
  delay = 0,
  hover = true,
  gradient = false,
  ...props
}) => {
  const theme = useTheme();

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? {
        y: -8,
        boxShadow: '0px 20px 40px rgba(0,0,0,0.15)'
      } : {}}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        background: gradient
          ? 'linear-gradient(135deg, rgba(255,107,53,0.05) 0%, rgba(76,175,80,0.05) 100%)'
          : 'white',
        border: gradient
          ? `1px solid ${theme.palette.primary.light}20`
          : 'none',
        ...props.sx
      }}
      {...props}
    >
      {gradient && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: theme.palette.background.gradient,
          }}
        />
      )}
      {children}
    </MotionCard>
  );
};

export default AnimatedCard;