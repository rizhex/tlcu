import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper, Typography, Box, Button, CircularProgress, Pagination,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Container, TextField, InputAdornment, IconButton, Alert, Divider,
  Breadcrumbs, Link
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowBack as BackIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

// Componentes placeholder (los crearemos después)
import EntryList from '../components/entry/EntryList';
import EntryForm from '../components/entry/EntryForm';
import EntryDetail from '../components/entry/EntryDetail';
import { useEntries } from '../hooks/useEntries';

export default function EntriesPage() {
  const { id } = useParams(); // dictionaryId
  const navigate = useNavigate();
  
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    entries,
    currentEntry,
    setCurrentEntry,
    selectedEntry,
    setSelectedEntry,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    loading,
    error,
    showForm,
    setShowForm,
    showDetail,
    setShowDetail,
    searchMode,
    fetchEntries,
    submitEntry,
    removeEntry,
    clearSearch
  } = useEntries(id);

  // Cargar datos al montar
  React.useEffect(() => {
    if (id) {
      fetchEntries(1, '');
    }
  }, [id, fetchEntries]);

  const handleSearch = () => {
    if (searchText.trim() !== '') {
      fetchEntries(1, searchText);
      setCurrentPage(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await removeEntry(entryToDelete.id);
      setConfirmOpen(false);
      setEntryToDelete(null);
    }
  };

  const handleBackToDictionaries = () => {
    navigate('/dictionaries');
  };

  // Función para parsear definición
  const parseDefinition = (defText) => {
    if (!defText) return { texto: '', fuente: '' };
    try {
      const parsed = JSON.parse(defText);
      return {
        texto: parsed._ || parsed.texto || defText,
        fuente: parsed.i || parsed.fuente || ''
      };
    } catch {
      return { texto: defText, fuente: '' };
    }
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
        <Link
          underline="hover"
          color="inherit"
          href="/dictionaries"
          onClick={(e) => {
            e.preventDefault();
            navigate('/dictionaries');
          }}
        >
          Diccionarios
        </Link>
        <Typography color="text.primary">
          Entradas {id ? `(Diccionario ID: ${id})` : ''}
        </Typography>
      </Breadcrumbs>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        {/* Botón volver */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={handleBackToDictionaries}
            variant="outlined"
            size="small"
          >
            Volver a Diccionarios
          </Button>
          
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Entradas del Diccionario
          </Typography>
        </Box>

        {showForm ? (
          <EntryForm
            entry={currentEntry}
            dictionaryId={id}
            onCancel={() => {
              setShowForm(false);
              setCurrentEntry(null);
            }}
            onSubmit={submitEntry}
            loading={loading}
          />
        ) : showDetail && selectedEntry ? (
          <EntryDetail
            entry={selectedEntry}
            onBack={() => {
              setShowDetail(false);
              setSelectedEntry(null);
            }}
            onEdit={() => {
              setCurrentEntry(selectedEntry);
              setShowDetail(false);
              setShowForm(true);
            }}
          />
        ) : (
          <>
            {/* Encabezado y botones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Total: {totalItems} entrada{totalItems !== 1 ? 's' : ''}
                  {searchMode && searchText && (
                    <Typography variant="body2" color="text.secondary" component="span">
                      {' '}(buscando: "{searchText}")
                    </Typography>
                  )}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setCurrentEntry(null);
                  setShowForm(true);
                }}
                disabled={loading}
              >
                Nueva Entrada
              </Button>
            </Box>

            {/* Barra de búsqueda */}
            <TextField
              fullWidth
              label="Buscar palabra..."
              variant="outlined"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchText && (
                      <IconButton onClick={clearSearch} size="small" disabled={loading}>
                        <ClearIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={handleSearch} size="small" disabled={loading}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Divider sx={{ mb: 3 }} />

            {/* Mensajes de error */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Contenido */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : entries.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {searchText
                  ? `No se encontraron entradas que coincidan con "${searchText}"`
                  : 'No hay entradas en este diccionario.'}
              </Alert>
            ) : (
              <>
                <EntryList
                  entries={entries.map(entry => ({
                    ...entry,
                    definitions: entry.definitions?.map(def => ({
                      ...def,
                      parsedDef: parseDefinition(def.defText)
                    })) || []
                  }))}
                  onEdit={(entry) => {
                    setCurrentEntry(entry);
                    setShowForm(true);
                  }}
                  onDetail={(entry) => {
                    setSelectedEntry(entry);
                    setShowDetail(true);
                  }}
                  onDelete={(entry) => {
                    setEntryToDelete(entry);
                    setConfirmOpen(true);
                  }}
                />
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => {
                        setCurrentPage(page);
                        fetchEntries(page, searchText);
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

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la entrada <strong>{entryToDelete?.name}</strong>?
            {entryToDelete?.definitions?.length > 0 && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Esta entrada tiene {entryToDelete.definitions.length} definición(es) que también serán eliminadas.
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}