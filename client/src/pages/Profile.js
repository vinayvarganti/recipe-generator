import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Slider,
  Divider,
  Alert,
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const DIETARY_PREFERENCES = [
  'vegetarian',
  'vegan', 
  'non-vegetarian',
  'pescatarian',
  'keto',
  'paleo'
];

const COMMON_ALLERGIES = [
  'nuts',
  'dairy',
  'gluten',
  'eggs',
  'soy',
  'shellfish',
  'fish',
  'sesame'
];

const CUISINES = [
  'italian',
  'asian',
  'mexican',
  'american',
  'mediterranean',
  'indian',
  'french',
  'thai',
  'japanese',
  'chinese'
];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profile: {
      firstName: '',
      lastName: '',
      dietaryPreferences: [],
      allergies: [],
      favoriteIngredients: [],
      favoriteCuisines: []
    },
    preferences: {
      defaultCalorieLimit: 2000,
      defaultCookingTime: 60,
      preferredDifficulty: 'medium'
    }
  });
  const [newIngredient, setNewIngredient] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          dietaryPreferences: user.profile?.dietaryPreferences || [],
          allergies: user.profile?.allergies || [],
          favoriteIngredients: user.profile?.favoriteIngredients || [],
          favoriteCuisines: user.profile?.favoriteCuisines || []
        },
        preferences: {
          defaultCalorieLimit: user.preferences?.defaultCalorieLimit || 2000,
          defaultCookingTime: user.preferences?.defaultCookingTime || 60,
          preferredDifficulty: user.preferences?.preferredDifficulty || 'medium'
        }
      });
    }
  }, [user]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setSuccess(false);
  };

  const handleArrayAdd = (section, field, value) => {
    if (value && !formData[section][field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...prev[section][field], value]
        }
      }));
    }
  };

  const handleArrayRemove = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter(item => item !== value)
      }
    }));
  };

  const addFavoriteIngredient = () => {
    if (newIngredient.trim()) {
      handleArrayAdd('profile', 'favoriteIngredients', newIngredient.trim().toLowerCase());
      setNewIngredient('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (!user) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your preferences to get better recipe recommendations
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Personal Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.profile.firstName}
                      onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.profile.lastName}
                      onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={user.username}
                      disabled
                      helperText="Username cannot be changed"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Dietary Preferences */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Dietary Preferences
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Dietary Preferences</InputLabel>
                  <Select
                    multiple
                    value={formData.profile.dietaryPreferences}
                    onChange={(e) => handleInputChange('profile', 'dietaryPreferences', e.target.value)}
                    input={<OutlinedInput label="Dietary Preferences" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {DIETARY_PREFERENCES.map((pref) => (
                      <MenuItem key={pref} value={pref}>
                        {pref}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="h6" gutterBottom>
                  Allergies & Restrictions
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Allergies</InputLabel>
                  <Select
                    multiple
                    value={formData.profile.allergies}
                    onChange={(e) => handleInputChange('profile', 'allergies', e.target.value)}
                    input={<OutlinedInput label="Allergies" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" color="error" />
                        ))}
                      </Box>
                    )}
                  >
                    {COMMON_ALLERGIES.map((allergy) => (
                      <MenuItem key={allergy} value={allergy}>
                        {allergy}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Favorite Ingredients */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Favorite Ingredients
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add favorite ingredient"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFavoriteIngredient()}
                  />
                  <Button variant="outlined" onClick={addFavoriteIngredient}>
                    Add
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.profile.favoriteIngredients.map((ingredient) => (
                    <Chip
                      key={ingredient}
                      label={ingredient}
                      onDelete={() => handleArrayRemove('profile', 'favoriteIngredients', ingredient)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Favorite Cuisines */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Favorite Cuisines
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Favorite Cuisines</InputLabel>
                  <Select
                    multiple
                    value={formData.profile.favoriteCuisines}
                    onChange={(e) => handleInputChange('profile', 'favoriteCuisines', e.target.value)}
                    input={<OutlinedInput label="Favorite Cuisines" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" color="secondary" />
                        ))}
                      </Box>
                    )}
                  >
                    {CUISINES.map((cuisine) => (
                      <MenuItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Recipe Preferences */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Recipe Generation Preferences
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Preferred Difficulty</InputLabel>
                      <Select
                        value={formData.preferences.preferredDifficulty}
                        label="Preferred Difficulty"
                        onChange={(e) => handleInputChange('preferences', 'preferredDifficulty', e.target.value)}
                      >
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    Default Calorie Limit: {formData.preferences.defaultCalorieLimit} calories
                  </Typography>
                  <Slider
                    value={formData.preferences.defaultCalorieLimit}
                    onChange={(e, value) => handleInputChange('preferences', 'defaultCalorieLimit', value)}
                    min={500}
                    max={3000}
                    step={100}
                    marks={[
                      { value: 500, label: '500' },
                      { value: 1500, label: '1500' },
                      { value: 3000, label: '3000' },
                    ]}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    Default Cooking Time: {formData.preferences.defaultCookingTime} minutes
                  </Typography>
                  <Slider
                    value={formData.preferences.defaultCookingTime}
                    onChange={(e, value) => handleInputChange('preferences', 'defaultCookingTime', value)}
                    min={15}
                    max={240}
                    step={15}
                    marks={[
                      { value: 15, label: '15m' },
                      { value: 60, label: '1h' },
                      { value: 240, label: '4h' },
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Save />}
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default Profile;