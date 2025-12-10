import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Container, Box, 
  Button, IconButton, Menu, MenuItem
} from '@mui/material';
import { 
  Home, Search, Book, Logout, AccountCircle
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function MainLayout() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const navigationItems = [
    { label: 'Inicio', path: '/', icon: <Home />, roles: ['admin', 'editor'] },
    { label: 'Búsqueda', path: '/search', icon: <Search />, roles: ['admin', 'editor', 'visitor'] },
    { label: 'Diccionarios', path: '/dictionaries', icon: <Book />, roles: ['admin', 'editor'] },
  ];

  // Determinar qué items mostrar según el rol
  const visibleItems = navigationItems.filter(item => 
    isAuthenticated ? item.roles.includes(role) : item.roles.includes('visitor')
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tesoro Lexicográfico
          </Typography>
          
          {/* Navegación */}
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            {visibleItems.map(item => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Menú usuario */}
          {isAuthenticated ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography>Rol: {role}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              startIcon={<AccountCircle />}
            >
              Ingresar
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Container>
      
      <Box component="footer" sx={{ py: 2, backgroundColor: 'grey.100', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sistema de Gestión Lexicográfica - {isAuthenticated ? `Usuario: ${role}` : 'Modo visitante'}
        </Typography>
      </Box>
    </Box>
  );
}