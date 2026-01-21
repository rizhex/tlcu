import React from 'react';
import {
  Paper, Box, Stack, Typography, Button, Chip, Divider, Grid,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

const UserDetail = ({ user, onClose, onEdit }) => {
  const getRoleColor = (role) => role === 'ADMIN' ? 'error' : 'warning';

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {user.username}
          </Typography>
          <Chip 
            label={user.role} 
            color={getRoleColor(user.role)}
            size="medium"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose}>
            Volver
          </Button>
          <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={onEdit}>
            Editar
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Información del Usuario
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <PersonIcon />
                <Typography variant="subtitle2" color="text.secondary">
                  Usuario
                </Typography>
              </Stack>
              <Typography variant="body1">{user.username}</Typography>
            </Box>
            
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <EmailIcon />
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
              </Stack>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <BadgeIcon />
                <Typography variant="subtitle2" color="text.secondary">
                  Rol
                </Typography>
              </Stack>
              <Chip 
                label={user.role} 
                color={getRoleColor(user.role)}
                size="medium"
                sx={{ fontWeight: 'medium' }}
              />
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Información del Sistema
          </Typography>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              ID de usuario
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'monospace', 
                bgcolor: 'grey.100', 
                p: 1, 
                borderRadius: 1,
                display: 'block',
                wordBreak: 'break-all'
              }}
            >
              {user.id}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {user.role === 'ADMIN' && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Usuario Administrador:</strong> Acceso completo al sistema.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default UserDetail;