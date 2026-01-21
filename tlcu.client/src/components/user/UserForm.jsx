import React, { useState, useEffect } from 'react';
import {
  Paper, Box, Stack, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, Alert, CircularProgress,
  FormControlLabel, Divider
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const UserForm = ({ user, onCancel, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Editor'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'Editor'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Usuario requerido';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    
    if (!user?.id && !formData.password) newErrors.password = 'Contraseña requerida';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        username: formData.username,
        email: formData.email,
        role: formData.role
      };
      
      if (formData.password) submitData.password = formData.password;
      onSubmit(submitData);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {user?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Usuario *"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
          </Stack>
          
          <FormControl fullWidth>
            <InputLabel>Rol *</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Rol *"
              error={!!errors.role}
              disabled={loading}
            >
              <MenuItem value="Admin">Administrador</MenuItem>
              <MenuItem value="Editor">Editor</MenuItem>
            </Select>
          </FormControl>
          
          <Divider />
          
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.id ? 'Cambiar contraseña' : 'Contraseña *'}
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || (user?.id ? 'Dejar vacío para no cambiar' : '')}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Confirmar contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
            />
          </Stack>
          
          {Object.keys(errors).length > 0 && (
            <Alert severity="error">Corrige los errores en el formulario.</Alert>
          )}
          
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};

export default UserForm;