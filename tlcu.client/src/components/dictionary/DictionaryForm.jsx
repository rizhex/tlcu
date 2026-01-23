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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Save as SaveIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as DateIcon,
  Place as PlaceIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Assignment as ProjectIcon,
  Create as CreateIcon,
  RateReview as ReviewIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import { CENTURY_OPTIONS } from '../../utils/dictionaryConstants';

export default function DictionaryForm({ 
  dictionary = {}, 
  onCancel, 
  onSubmit,
  loading = false 
}) {
  const [formData, setFormData] = useState({
  name: '',
  title: '',
  fullTitle: '',
  author: '',
  originalDate: '',
  century: '',
  publishingPlace: '',
  publisher: '',
  publishingDate: '',
  edition: '',
  sourceName: '',
  remarks: '',
  projectName: '',
  transcriber: '',
  transcriptionDate: '',
  revisorName: '',
  revisionDate: '',
  prologueName: ''
  // Eliminados: fileNameXML, sourceURL, prologueURL del estado
});

  const [errors, setErrors] = useState({});

  // Inicializar con datos del diccionario (si está en modo edición)
  useEffect(() => {
  if (dictionary.id) {
    setFormData({
      name: dictionary.name || '',
      title: dictionary.title || '',
      fullTitle: dictionary.fullTitle || '',
      author: dictionary.author ? parseAuthor(dictionary.author) : '',
      originalDate: dictionary.originalDate || '',
      century: dictionary.century || '',
      publishingPlace: dictionary.publishingPlace || '',
      publisher: dictionary.publisher || '',
      publishingDate: dictionary.publishingDate || '',
      edition: dictionary.edition || '',
      sourceName: dictionary.sourceName || '',
      remarks: dictionary.remarks || '',
      projectName: dictionary.projectName || '',
      transcriber: dictionary.transcriber || '',
      transcriptionDate: dictionary.transcriptionDate || '',
      revisorName: dictionary.revisorName || '',
      revisionDate: dictionary.revisionDate || '',
      prologueName: dictionary.prologueName || ''
      // Eliminados: fileNameXML, sourceURL, prologueURL
    });
  }
}, [dictionary]);
  // Función para parsear el autor del JSON
  const parseAuthor = (authorStr) => {
    if (!authorStr) return '';
    try {
      const parsed = JSON.parse(authorStr);
      return parsed.author || authorStr;
    } catch {
      return authorStr;
    }
  };

  // Función para convertir autor a formato JSON
  const formatAuthor = (authorText) => {
    if (!authorText.trim()) return '';
    return JSON.stringify({ author: authorText.trim() });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo si se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del diccionario es requerido';
    }
    
    if (formData.name.length > 200) {
      newErrors.name = 'El nombre no puede exceder 200 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  // Preparar datos para enviar (más simple ahora)
  const dataToSend = {
    ...formData
    // No necesitamos eliminar campos porque ya no los tenemos en el estado
  };
  
  // Si estamos editando, agregar el ID
  if (dictionary.id) {
    dataToSend.id = dictionary.id;
  }
  
  onSubmit(dataToSend);
};

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookIcon color="primary" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            {dictionary.id ? 'Editar Diccionario' : 'Nuevo Diccionario'}
          </Typography>
        </Box>
        
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

      <Box component="form" onSubmit={handleSubmit}>
        {/* Sección 1: Información básica */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookIcon />
            Información Básica (Requerida)
          </Typography>
          <Typography variant="body2">
            Los campos marcados con * son obligatorios
          </Typography>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nombre del diccionario *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || 'Nombre corto para identificar el diccionario'}
              disabled={loading}
              InputProps={{
                startAdornment: <BookIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              helperText="Título breve de la obra"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Título completo"
              name="fullTitle"
              value={formData.fullTitle}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={loading}
              helperText="Título completo, puede incluir formato HTML"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Autor"
              name="author"
              value={formData.author}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              helperText="Ej: PARRA y CALLADO, Antonio (1739-s.XIX)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={loading}>
                <InputLabel shrink={!!formData.century}>Siglo</InputLabel>
                <Select
                    name="century"
                    value={formData.century}
                    onChange={handleChange}
                    label="Siglo"
                    displayEmpty
                >
                    <MenuItem value="">
                    <em>No especificado</em>
                    </MenuItem>
                    {CENTURY_OPTIONS.filter(opt => opt.value).map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                    ))}
                </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* Sección 2: Publicación */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <BusinessIcon color="primary" />
          Información de Publicación
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha de publicación"
              name="publishingDate"
              value={formData.publishingDate}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <DateIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              helperText="Ej: 1799"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Lugar de publicación"
              name="publishingPlace"
              value={formData.publishingPlace}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <PlaceIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              helperText="Ej: Madrid"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Editorial"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              disabled={loading}
              helperText="Ej: Imprenta de la Viuda de Ibarra"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha original"
              name="originalDate"
              value={formData.originalDate}
              onChange={handleChange}
              disabled={loading}
              helperText="Fecha de la obra original si es diferente"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
                fullWidth
                label="Edición"
                name="edition"
                value={formData.edition}
                onChange={handleChange}
                disabled={loading}
                helperText="Ej: 1.a ed., 2.a ed., Edición crítica, etc."
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* Sección 3: Proyecto y transcripción */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ProjectIcon color="primary" />
          Información del Proyecto
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre del proyecto"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              disabled={loading}
              helperText="Ej: TLEAM-Cuba"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fuente"
              name="sourceName"
              value={formData.sourceName}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Transcriptor"
              name="transcriber"
              value={formData.transcriber}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <CreateIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha de transcripción"
              name="transcriptionDate"
              value={formData.transcriptionDate}
              onChange={handleChange}
              disabled={loading}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Revisor"
              name="revisorName"
              value={formData.revisorName}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: <ReviewIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha de revisión"
              name="revisionDate"
              value={formData.revisionDate}
              onChange={handleChange}
              disabled={loading}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre del prólogo"
              name="prologueName"
              value={formData.prologueName}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4 }} />

        {/* Sección 4: Observaciones */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <NoteIcon color="primary" />
          Observaciones
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              multiline
              rows={4}
              disabled={loading}
              helperText="Notas adicionales sobre el diccionario"
            />
          </Grid>
        </Grid>

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
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}