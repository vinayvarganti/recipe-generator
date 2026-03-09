import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

const AdminIngredients = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ingredient Management
      </Typography>
      <Alert severity="info">
        Ingredient management interface - Implementation in progress
      </Alert>
    </Container>
  );
};

export default AdminIngredients;