import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

const AdminRecipes = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recipe Management
      </Typography>
      <Alert severity="info">
        Recipe management interface - Implementation in progress
      </Alert>
    </Container>
  );
};

export default AdminRecipes;