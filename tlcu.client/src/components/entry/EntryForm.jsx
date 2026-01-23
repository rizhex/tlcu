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
  Divider
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Save as SaveIcon,
  Add as AddIcon,
  Book as BookIcon
} from '@mui/icons-material';

import DefinitionForm from '../definition/DefinitionForm';
import OcrModal from '../ocr/OcrModal';

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
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [currentDefinitionIndex, setCurrentDefinitionIndex] = useState(null);

  // Inicializar con datos de la entrada
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
      setFormData({
        id: null,
        name: '',
        regName: '',
        definitions: []
      });
    }
    setSubmitError('');
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleDefinitionUpdate = (index, updatedDefinition) => {
    setFormData(prev => {
      const newDefinitions = [...prev.definitions];
      newDefinitions[index] = updatedDefinition;
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

  const openOcrModal = (index) => {
    setCurrentDefinitionIndex(index);
    setOcrModalOpen(true);
  };

 const applyOcrText = (text, definitionIndex) => {
    if (definitionIndex === null) return;
    
    console.log('✅ Aplicando texto OCR a definición', definitionIndex);
    console.log('Texto recibido:', text.substring(0, 100) + '...');
    
    setFormData(prev => {
      const newDefinitions = [...prev.definitions];
      const currentDef = newDefinitions[definitionIndex];
      const currentText = currentDef?.defText || '';
      const separator = currentText ? '\n\n' : '';
      
      newDefinitions[definitionIndex] = {
        ...currentDef,
        defText: currentText + separator + text
      };
      
      console.log('📝 Definición actualizada:', {
        anterior: currentText.length,
        nuevo: newDefinitions[definitionIndex].defText.length,
        diferencia: text.length
      });
      
      return { ...prev, definitions: newDefinitions };
    });
    
    setOcrModalOpen(false);
    
    alert(`✅ Texto aplicado a la Definición #${definitionIndex + 1} (${text.length} caracteres)`);
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
    <>
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

          {/* Sección 2: Definiciones */}
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
                  <DefinitionForm
                    key={def.id || `new-${index}`}
                    definition={def}
                    index={index}
                    onUpdate={handleDefinitionUpdate}
                    onRemove={removeDefinition}
                    onOpenOcr={openOcrModal}
                    loading={loading}
                  />
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

      {/* Modal de OCR */}
      <OcrModal
        open={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onApplyText={applyOcrText}
        currentDefinitionIndex={currentDefinitionIndex}
        loading={loading}
      />
    </>
  );
}