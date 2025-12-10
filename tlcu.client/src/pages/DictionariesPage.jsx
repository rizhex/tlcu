import React, { useState, useRef } from 'react';
import {
  Paper, Box, Stack, Typography, Button, TextField, InputAdornment,
  IconButton, CircularProgress, Alert, Pagination, Divider, Container,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Upload as UploadIcon,
  Check as CheckIcon,
  Error as ErrorIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import DictionaryForm from '../components/dictionary/DictionaryForm';
import DictionaryDetail from '../components/dictionary/DictionaryDetail';
import DictionaryTable from '../components/dictionary/DictionaryTable';
import { useDictionary } from '../hooks/useDictionary';

const DictionariesPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importDialog, setImportDialog] = useState({
    open: false,
    fileName: '',
    status: 'idle', // 'idle', 'uploading', 'success', 'error'
    message: ''
  });
  
  const {
    dictionaries,
    currentDictionary,
    setCurrentDictionary,
    selectedDictionary,
    setSelectedDictionary,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    loading,
    error,
    showEditForm,
    setShowEditForm,
    showDetails,
    setShowDetails,
    fetchData,
    submit,
    remove,
    importXmlFile
  } = useDictionary();

  // Navegar a las entradas del diccionario
  const navigateToEntries = (id) => {
    navigate(`/dictionaries/${id}/entries`);
  };

  const handleSearch = () => {
    fetchData(1, searchText);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchText('');
    fetchData(1, '');
  };

  const handleSubmit = (formData) => {
    submit(formData);
  };

  // Función para manejar la selección de archivo XML
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Resetear el input file
    event.target.value = '';
    
    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setImportDialog({
        open: true,
        fileName: file.name,
        status: 'error',
        message: 'El archivo debe tener extensión .xml'
      });
      return;
    }
    
    // Mostrar diálogo de importación
    setImportDialog({
      open: true,
      fileName: file.name,
      status: 'uploading',
      message: 'Procesando archivo XML...'
    });
    setImportProgress(10);
    
    try {
      // Simular progreso inicial
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Importar archivo
      const result = await importXmlFile(file);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      
      // Mostrar éxito
      setImportDialog(prev => ({
        ...prev,
        status: 'success',
        message: `Diccionario "${result.name}" importado exitosamente.\nSe crearon las entradas correspondientes.`
      }));
      
      // Cerrar automáticamente después de 3 segundos
      setTimeout(() => {
        handleCloseImportDialog();
      }, 3000);
      
    } catch (err) {
      setImportProgress(0);
      setImportDialog(prev => ({
        ...prev,
        status: 'error',
        message: err.message || 'Error al importar el archivo XML'
      }));
    }
  };

  // Función para cerrar el diálogo
  const handleCloseImportDialog = () => {
    setImportDialog({ open: false, fileName: '', status: 'idle', message: '' });
    setImportProgress(0);
    // Recargar lista si la importación fue exitosa
    if (importDialog.status === 'success') {
      fetchData(currentPage, searchText);
    }
  };

  // Cargar datos al montar
  React.useEffect(() => {
    fetchData(1, '');
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Input file oculto */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xml"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%' }}>
        {showEditForm ? (
          <DictionaryForm
            dictionary={currentDictionary}
            onCancel={() => {
              setShowEditForm(false);
              setCurrentDictionary(null);
            }}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : showDetails && selectedDictionary ? (
          <DictionaryDetail
            dictionary={selectedDictionary}
            onClose={() => {
              setShowDetails(false);
              setSelectedDictionary(null);
            }}
            onEdit={() => {
              setCurrentDictionary(selectedDictionary);
              setShowDetails(false);
              setShowEditForm(true);
            }}
            onNavigateToEntries={() => navigateToEntries(selectedDictionary.id)}
          />
        ) : (
          <>
            {/* Encabezado */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Diccionarios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {totalItems} diccionario{totalItems !== 1 ? 's' : ''}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                {/* Botón de importar XML */}
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  Importar XML
                </Button>
                
                {/* Botón nuevo diccionario */}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCurrentDictionary({});
                    setShowEditForm(true);
                  }}
                  disabled={loading}
                >
                  Nuevo Diccionario
                </Button>
              </Stack>
            </Stack>

            {/* Barra de búsqueda */}
            <TextField
              label="Buscar por nombre..."
              variant="outlined"
              fullWidth
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchText && (
                      <IconButton onClick={clearSearch} size="small">
                        <ClearIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={handleSearch} size="small">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 3 }} />

            {/* Mensajes de error general */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Contenido */}
            {loading ? (
              <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                <CircularProgress color="primary" />
                <Typography>Cargando diccionarios...</Typography>
              </Stack>
            ) : dictionaries.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {searchText
                  ? 'No se encontraron diccionarios que coincidan con la búsqueda.'
                  : 'No hay diccionarios registrados.'}
              </Alert>
            ) : (
              <>
                <DictionaryTable
                  dictionaries={dictionaries}
                  onEdit={(dictionary) => {
                    setCurrentDictionary(dictionary);
                    setShowEditForm(true);
                  }}
                  onDelete={remove}
                  onDetail={(dictionary) => {
                    setSelectedDictionary(dictionary);
                    setShowDetails(true);
                  }}
                  onNavigateToEntries={navigateToEntries}
                />
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => {
                        setCurrentPage(page);
                        fetchData(page, searchText);
                      }}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Paper>

      {/* Diálogo de importación */}
      <Dialog 
        open={importDialog.open} 
        onClose={importDialog.status === 'uploading' ? undefined : handleCloseImportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {importDialog.status === 'success' ? (
            <CheckIcon color="success" />
          ) : importDialog.status === 'error' ? (
            <ErrorIcon color="error" />
          ) : (
            <UploadIcon color="primary" />
          )}
          {importDialog.status === 'uploading' ? 'Importando XML' : 
           importDialog.status === 'success' ? 'Importación Exitosa' : 
           'Error en Importación'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Archivo:</strong> {importDialog.fileName}
            </Typography>
            
            {importDialog.status === 'uploading' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {importDialog.message}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={importProgress} 
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                  {importProgress}%
                </Typography>
              </Box>
            )}
            
            {(importDialog.status === 'success' || importDialog.status === 'error') && (
              <Alert 
                severity={importDialog.status === 'success' ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                {importDialog.message.split('\n').map((line, index) => (
                  <Typography key={index} variant="body2">
                    {line}
                  </Typography>
                ))}
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          {importDialog.status === 'uploading' ? (
            <Button disabled>Cargando...</Button>
          ) : (
            <Button 
              onClick={handleCloseImportDialog} 
              color="primary"
              variant="contained"
            >
              {importDialog.status === 'success' ? 'Continuar' : 'Cerrar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DictionariesPage;