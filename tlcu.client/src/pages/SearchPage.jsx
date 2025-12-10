import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Search as SearchIcon,
  Book as BookIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import backgroundImage from '../assets/background.png'; 

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchInfo, setSearchInfo] = useState({ total: 0, page: 1, totalPages: 1 });
  
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Cargar historial desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, []);

  // Guardar búsqueda en historial
  const saveToHistory = (query) => {
    if (!query.trim()) return;
    
    const updatedHistory = [
      query.trim(),
      ...searchHistory.filter(item => item.toLowerCase() !== query.trim().toLowerCase())
    ].slice(0, 10); // Mantener solo las últimas 10 búsquedas
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // Función para parsear el campo defText (que viene como JSON string)
  const parseDefText = (defText) => {
    if (!defText) return { texto: '', fuente: '' };
    
    try {
      if (typeof defText === 'string') {
        try {
          const parsed = JSON.parse(defText);
          return {
            texto: parsed._ || parsed.texto || defText,
            fuente: parsed.i || parsed.fuente || ''
          };
        } catch {
          return { texto: defText, fuente: '' };
        }
      }
      return {
        texto: defText._ || defText.texto || '',
        fuente: defText.i || defText.fuente || ''
      };
    } catch {
      return { texto: String(defText), fuente: '' };
    }
  };

  // Función de búsqueda
  const performSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      setSelected(null);
      setSearchInfo({ total: 0, page: 1, totalPages: 1 });
      return;
    }

    // Cancelar búsqueda anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/entries/search/all?query=${encodeURIComponent(query)}&page=1`, {
        signal: abortControllerRef.current.signal
      });

      const data = response.data;
      console.log('Resultados de búsqueda:', data);
      
      if (data && Array.isArray(data.data)) {
        // Procesar definiciones para parsear el JSON de defText
        const processedResults = data.data.map(entry => ({
          ...entry,
          definitions: entry.definitions?.map(def => ({
            ...def,
            parsedDef: parseDefText(def.defText)
          })) || []
        }));
        
        setResults(processedResults);
        setSearchInfo({
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.totalPages || 1
        });
      } else {
        setResults([]);
        setSearchInfo({ total: 0, page: 1, totalPages: 1 });
      }
      
      setSelected(null);
      saveToHistory(query);
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || 'Error al buscar. Intenta nuevamente.');
        console.error('Search error:', err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Búsqueda con debounce
  const handleSearch = (query) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setSearchTerm(query);

    timerRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  // Búsqueda manual (Enter o botón)
  const handleManualSearch = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    performSearch(searchTerm);
  };

  // Seleccionar resultado
  const handleSelectResult = (result) => {
    setSelected(result);
  };

  // Limpiar búsqueda
  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setSelected(null);
    setError('');
    setSearchInfo({ total: 0, page: 1, totalPages: 1 });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Limpiar historial
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Ir a página de diccionarios (solo admin/editor)
  const goToDictionary = () => {
    navigate('/dictionaries');
  };

  // Formatear la clase de palabra
  const formatWordClass = (wordClass) => {
    if (!wordClass) return '';
    return wordClass.charAt(0).toUpperCase() + wordClass.slice(1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Inicio
        </Link>
        <Typography color="text.primary">Búsqueda</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          color: 'white',
          p: { xs: 3, md: 4 },
          borderRadius: 2,
          mb: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          right: 20, 
          top: 20, 
          opacity: 0.1,
          display: { xs: 'none', md: 'block' }
        }}>
          <BookIcon sx={{ fontSize: 150 }} />
        </Box>
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Tesoro Lexicográfico Cubano
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Explora el patrimonio lingüístico de Cuba
        </Typography>

        {/* Barra de búsqueda */}
        <Paper
          component="form"
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            maxWidth: 700,
            mx: 'auto',
            backgroundColor: 'white'
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleManualSearch();
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar palabra..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClear} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { border: 'none', '& fieldset': { border: 'none' } }
            }}
            variant="outlined"
            size="medium"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ ml: 1, px: 3, minWidth: '100px' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Buscar'}
          </Button>
        </Paper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2, 
              maxWidth: 700, 
              mx: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Información de búsqueda */}
        {searchInfo.total > 0 && (
          <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
            Encontradas {searchInfo.total} palabra{searchInfo.total !== 1 ? 's' : ''}
          </Typography>
        )}
      </Paper>

      {/* Contenido principal */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Panel izquierdo - Resultados */}
        <Box sx={{ flex: { xs: '1', lg: '0 0 350px' } }}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Resultados {results.length > 0 && `(${results.length})`}
              </Typography>
              {results.length > 0 && (
                <Button size="small" onClick={handleClear}>
                  Limpiar
                </Button>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : results.length > 0 ? (
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {results.map((result) => (
                  <ListItem key={result.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={selected?.id === result.id}
                      onClick={() => handleSelectResult(result)}
                      sx={{
                        borderRadius: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                          }
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {result.name || 'Sin nombre'}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            {result.regName && result.regName !== result.name && (
                              <Typography variant="body2" color="text.secondary">
                                {result.regName}
                              </Typography>
                            )}
                            {result.definitions?.[0]?.wordClass && (
                              <Chip
                                label={formatWordClass(result.definitions[0].wordClass)}
                                size="small"
                                sx={{ mt: 0.5, fontSize: '0.7rem' }}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SearchIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography color="text.secondary">
                  {searchTerm ? 'No se encontraron resultados' : 'Ingresa una palabra para buscar'}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Historial de búsquedas */}
          {searchHistory.length > 0 && (
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Búsquedas recientes</Typography>
                <Button size="small" onClick={clearHistory}>
                  Limpiar
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchHistory.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onClick={() => {
                      setSearchTerm(item);
                      performSearch(item);
                    }}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Panel derecho - Detalles */}
        <Paper elevation={2} sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {selected ? (
            <Box>
              {/* Encabezado */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                  {selected.name}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                  {selected.regName && selected.regName !== selected.name && (
                    <Chip
                      label={`Forma registrada: ${selected.regName}`}
                      color="info"
                      variant="outlined"
                    />
                  )}
                  {selected.definitions?.[0]?.wordClass && (
                    <Chip
                      label={formatWordClass(selected.definitions[0].wordClass)}
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                  {selected.definitions?.[0]?.ontologicalClassification && (
                    <Chip
                      label={selected.definitions[0].ontologicalClassification}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>

                {selected.definitions?.[0]?.etymology && (
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Etimología
                    </Typography>
                    <Typography>{selected.definitions[0].etymology}</Typography>
                  </Paper>
                )}

                {selected.definitions?.[0]?.remarks && (
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'warning.light', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Observaciones
                    </Typography>
                    <Typography>{selected.definitions[0].remarks}</Typography>
                  </Paper>
                )}
              </Box>

              {/* Definiciones */}
              <Divider sx={{ mb: 3 }} />
              
              {selected.definitions && selected.definitions.length > 0 ? (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                    Definiciones
                  </Typography>
                  
                  <List>
                    {selected.definitions.map((def, index) => (
                      <Paper key={def.id || index} elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Chip
                            label={def.senseNumber || index + 1}
                            size="small"
                            sx={{ mr: 2, mt: 0.5, fontWeight: 'bold' }}
                            color="primary"
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" paragraph>
                              {def.parsedDef?.texto || def.defText}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                              {def.wordClass && (
                                <Chip
                                  label={formatWordClass(def.wordClass)}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {def.ontologicalClassification && (
                                <Chip
                                  label={def.ontologicalClassification}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              )}
                            </Box>

                            {def.parsedDef?.fuente && (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                <strong>Fuente:</strong> {def.parsedDef.fuente}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BookIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography color="text.secondary">
                    No hay definiciones disponibles para esta palabra
                  </Typography>
                </Box>
              )}

              {/* Botones de acción (solo para admin/editor) */}
              {isAuthenticated && (role === 'admin' || role === 'editor') && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate(`/dictionaries?edit=${selected.id}`)}
                    >
                      Editar palabra
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={goToDictionary}
                    >
                      Ver en diccionario
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {results.length > 0
                  ? 'Selecciona una palabra de la lista para ver sus detalles'
                  : 'Realiza una búsqueda para ver los resultados'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Puedes buscar por nombre de palabra, etimología o características específicas
              </Typography>
              {isAuthenticated && (role === 'admin' || role === 'editor') && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={goToDictionary}
                >
                  Ir a diccionarios
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}