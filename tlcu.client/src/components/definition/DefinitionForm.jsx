import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  ImageSearch as ImageSearchIcon
} from '@mui/icons-material';

import { CLASES_PALABRA, CLASIFICACIONES_ONTOLOGICAS } from '../../utils/entryConstants';

export default function DefinitionForm({
  definition,
  index,
  onUpdate,
  onRemove,
  onOpenOcr,
  loading = false
}) {
  const [formData, setFormData] = useState({
    id: definition?.id || null,
    defText: definition?.defText || '',
    senseNumber: definition?.senseNumber || (index + 1),
    etymology: definition?.etymology || '',
    remarks: definition?.remarks || '',
    ontologicalClassification: definition?.ontologicalClassification || '',
    wordClass: definition?.wordClass || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(index, updatedData);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Definición #{formData.senseNumber || index + 1}
          {formData.id && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              (ID: {formData.id})
            </Typography>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ImageSearchIcon />}
            onClick={() => onOpenOcr(index)}
            disabled={loading}
            title="Extraer texto de PDF (OCR)"
          >
            OCR
          </Button>
          
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemove(index)}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Texto de la definición"
            name="defText"
            value={formData.defText}
            onChange={handleChange}
            multiline
            rows={3}
            disabled={loading}
            placeholder="Ej: Planta herbácea de la familia..."
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Etimología"
            name="etymology"
            value={formData.etymology}
            onChange={handleChange}
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
              value={formData.wordClass}
              onChange={handleChange}
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
              value={formData.ontologicalClassification}
              onChange={handleChange}
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
            value={formData.senseNumber}
            onChange={handleChange}
            disabled={loading}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Observaciones"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            multiline
            rows={2}
            disabled={loading}
            placeholder="Notas adicionales sobre esta definición"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}