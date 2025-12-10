import { Typography, Button, Box, Paper } from '@mui/material';
import { Book, Search, LibraryBooks } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido al Tesoro Lexicográfico Cubano
      </Typography>
      
      <Typography variant="body1" paragraph>
        Sistema de gestión de diccionarios y entradas lexicográficas del patrimonio lingüístico cubano.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mt: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Tarjeta de Búsqueda (siempre visible) */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Search sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Búsqueda</Typography>
          <Typography variant="body2" paragraph>
            Busca palabras en todos los diccionarios disponibles
          </Typography>
          <Button 
            variant="contained"
            onClick={() => navigate('/search')}
          >
            Ir a Búsqueda
          </Button>
        </Paper>
        
        {/* Tarjeta de Diccionarios (solo admin/editor) */}
        {isAuthenticated && (role === 'admin' || role === 'editor') && (
          <Paper sx={{ p: 3, flex: 1 }}>
            <Book sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Diccionarios</Typography>
            <Typography variant="body2" paragraph>
              Gestiona y administra tus diccionarios
            </Typography>
            <Button 
              variant="contained"
              onClick={() => navigate('/dictionaries')}
            >
              Ver Diccionarios
            </Button>
          </Paper>
        )}
        
        {/* Tarjeta de Entradas (solo admin/editor) */}
        {isAuthenticated && (role === 'admin' || role === 'editor') && (
          <Paper sx={{ p: 3, flex: 1 }}>
            <LibraryBooks sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Entradas</Typography>
            <Typography variant="body2" paragraph>
              Administra las entradas lexicográficas de los diccionarios
            </Typography>
            <Button 
              variant="contained"
              onClick={() => navigate('/dictionaries')} // Por ahora va a diccionarios
            >
              Ver Entradas
            </Button>
          </Paper>
        )}
      </Box>

      {/* Mensaje para visitantes */}
      {!isAuthenticated && (
        <Paper sx={{ p: 3, mt: 4, backgroundColor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Nota:</strong> Como visitante solo puedes acceder a la búsqueda de palabras. 
            Para gestionar diccionarios y entradas, necesitas iniciar sesión como administrador o editor.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}