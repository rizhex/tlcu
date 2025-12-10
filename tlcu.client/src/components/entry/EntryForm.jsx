
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Book as BookIcon
} from '@mui/icons-material';

import { CLASES_PALABRA, CLASIFICACIONES_ONTOLOGICAS } from '../../utils/entryConstants';

export default function EntryForm({ 
  entry = null,
  dictionaryId,
  onCancel, 
  onSubmit,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    regName: '',
    definitions: []
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Inicializar con datos de la entrada (si está en modo edición)
  useEffect(() => {
    if (entry && entry.id) {
      setFormData({
        id: entry.id,
        name: entry.name || '',
        regName: entry.regName || '',
        definitions: entry.definitions?.map(def => ({
          id: def.id,
          defText: def.defText || '',
          senseNumber: def.senseNumber || 1,
          etymology: def.etymology || '',
          remarks: def.remarks || '',
          ontologicalClassification: def.ontologicalClassification || '',
          wordClass: def.wordClass || ''
        })) || []
      });
    } else {
      // Resetear formulario para creación
      setFormData({
        id: null,
        name: '',
        regName: '',
        definitions: []
      });
    }
    setSubmitError(''); // Limpiar errores al cambiar entrada
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleDefinitionChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newDefinitions = [...prev.definitions];
      newDefinitions[index] = { ...newDefinitions[index], [name]: value };
      return { ...prev, definitions: newDefinitions };
    });
  };

  const addDefinition = () => {
    setFormData(prev => ({
      ...prev,
      definitions: [
        ...prev.definitions,
        {
          defText: '',
          senseNumber: prev.definitions.length + 1,
          etymology: '',
          remarks: '',
          ontologicalClassification: '',
          wordClass: ''
        }
      ]
    }));
  };

  const removeDefinition = (index) => {
    setFormData(prev => ({
      ...prev,
      definitions: prev.definitions.filter((_, i) => i !== index)
        .map((def, idx) => ({ ...def, senseNumber: idx + 1 }))
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la entrada es requerido';
    }
    
    if (formData.name.length > 200) {
      newErrors.name = 'El nombre no puede exceder 200 caracteres';
    }
    
    formData.definitions.forEach((def, index) => {
      if (def.defText && !def.defText.trim()) {
        newErrors[`defText_${index}`] = 'El texto de la definición no puede estar vacío si lo has empezado';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Preparar datos para enviar
    const dataToSend = {
      ...formData,
      dictionaryId: parseInt(dictionaryId),
      definitions: formData.definitions
        .filter(def => def.defText.trim() !== '')
        .map(def => ({
          ...def,
          senseNumber: parseInt(def.senseNumber) || 1
        }))
    };
    
    onSubmit(dataToSend);
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          {formData.id ? 'Editar Entrada' : 'Nueva Entrada'}
          <Typography variant="caption" display="block" color="text.secondary">
            Diccionario ID: {dictionaryId}
            {formData.id && ` | Entrada ID: ${formData.id}`}
          </Typography>
        </Typography>
        
        <Button
          startIcon={<BackIcon />}
          onClick={onCancel}
          variant="outlined"
          size="small"
          disabled={loading}
        >
          Cancelar
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Sección 1: Información básica de la entrada */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Información Básica de la Palabra
          </Typography>
          <Typography variant="body2">
            Los campos marcados con * son obligatorios. Las definiciones son opcionales.
          </Typography>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Palabra *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || 'Nombre principal de la palabra'}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Forma registrada"
              name="regName"
              value={formData.regName}
              onChange={handleChange}
              disabled={loading}
              helperText="Forma normalizada o registrada (opcional)"
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* Sección 2: Definiciones - Ahora opcional */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              <BookIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Definiciones (Opcional)
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addDefinition}
              disabled={loading}
              size="small"
            >
              Agregar Definición
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Puedes agregar una o más definiciones para esta palabra, o dejarla sin definiciones para añadirlas después.
          </Typography>

          {formData.definitions.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              Esta entrada no tiene definiciones. Puedes agregar una usando el botón arriba o guardar sin definiciones.
            </Alert>
          ) : (
            <>
              {formData.definitions.map((def, index) => (
                <Paper key={def.id || `new-${index}`} elevation={1} sx={{ p: 3, mb: 3, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Definición #{def.senseNumber || index + 1}
                      {def.id && <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>(ID: {def.id})</Typography>}
                    </Typography>
                    
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeDefinition(index)}
                      disabled={loading}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Texto de la definición"
                        name="defText"
                        value={def.defText}
                        onChange={(e) => handleDefinitionChange(index, e)}
                        multiline
                        rows={3}
                        error={!!errors[`defText_${index}`]}
                        helperText={errors[`defText_${index}`] || 'Texto de la definición (opcional)'}
                        disabled={loading}
                        placeholder="Ej: Planta herbácea de la familia..."
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Etimología"
                        name="etymology"
                        value={def.etymology}
                        onChange={(e) => handleDefinitionChange(index, e)}
                        disabled={loading}
                        placeholder="Ej: Del latín 'herba'"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id={`wordClass-label-${index}`}>Clase de palabra</InputLabel>
                        <Select
                          labelId={`wordClass-label-${index}`}
                          name="wordClass"
                          value={def.wordClass || ''}
                          onChange={(e) => handleDefinitionChange(index, e)}
                          label="Clase de palabra"
                          disabled={loading}
                        >
                          <MenuItem value="">
                            <em>Seleccionar clase...</em>
                          </MenuItem>
                          {CLASES_PALABRA.map((clase) => (
                            <MenuItem key={clase} value={clase}>
                              {clase}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id={`ontologicalClassification-label-${index}`}>
                          Clasificación ontológica
                        </InputLabel>
                        <Select
                          labelId={`ontologicalClassification-label-${index}`}
                          name="ontologicalClassification"
                          value={def.ontologicalClassification || ''}
                          onChange={(e) => handleDefinitionChange(index, e)}
                          label="Clasificación ontológica"
                          disabled={loading}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>Seleccionar clasificación...</em>
                          </MenuItem>
                          {CLASIFICACIONES_ONTOLOGICAS.map((clasificacion) => (
                            <MenuItem key={clasificacion} value={clasificacion}>
                              {clasificacion}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Número de acepción"
                        name="senseNumber"
                        type="number"
                        value={def.senseNumber}
                        onChange={(e) => handleDefinitionChange(index, e)}
                        disabled={loading}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Observaciones"
                        name="remarks"
                        value={def.remarks}
                        onChange={(e) => handleDefinitionChange(index, e)}
                        multiline
                        rows={2}
                        disabled={loading}
                        placeholder="Notas adicionales sobre esta definición"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDefinition}
                  disabled={loading}
                >
                  Agregar otra definición
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Botones de acción */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
            sx={{ minWidth: '120px' }}
          >
            {loading ? 'Guardando...' : (formData.id ? 'Actualizar' : 'Crear')}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}