import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

const AdminUsers = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Alert severity="info">
        User management interface - Implementation in progress
      </Alert>
    </Container>
  );
};

export default AdminUsers;