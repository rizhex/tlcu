import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import DictionariesPage from './pages/DictionariesPage';
import EntriesPage from './pages/EntriesPage'; 
import UsersPage from './pages/UsersPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rutas con layout principal */}
            <Route path="/" element={<MainLayout />}>
              {/* Home - Accesible para todos, pero mostrará contenido según rol */}
              <Route index element={<HomePage />} />
              
              {/* Búsqueda - Todos pueden ver */}
              <Route path="/search" element={<SearchPage />} />
              
              {/* Diccionarios - Solo admin/editor */}
              <Route path="/dictionaries" element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <DictionariesPage />
                </ProtectedRoute>
              } />
              {/* Gestion de usuarios - Solo admin */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
              {/* Entradas de diccionario - Solo admin/editor */}
              <Route path="/dictionaries/:id/entries" element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <EntriesPage />
                </ProtectedRoute>
              } />
              
              {/* Redirección por defecto para visitantes */}
              <Route path="*" element={<Navigate to="/search" />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;