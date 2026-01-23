import {
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Book as BookIcon,
  List as ListIcon,
  Language as LanguageIcon
} from '@mui/icons-material';

export default function EntryDetail({ 
  entry, 
  onBack,
  onEdit
}) {
  // Función para parsear definición
  const parseDefinition = (def) => {
    if (!def.defText) return { texto: '', fuente: '' };
    
    try {
      const parsed = JSON.parse(def.defText);
      return {
        texto: parsed._ || parsed.texto || def.defText,
        fuente: parsed.i || parsed.fuente || ''
      };
    } catch {
      return { texto: def.defText, fuente: '' };
    }
  };

  // Contar definiciones
  const definitionCount = entry.definitions?.length || 0;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          variant="outlined"
          size="small"
        >
          Volver a la lista
        </Button>
        
        <Button
          startIcon={<EditIcon />}
          onClick={onEdit}
          variant="contained"
          color="primary"
          size="small"
        >
          Editar
        </Button>
      </Box>

      {/* Información principal */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {entry.name || 'Sin nombre'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            icon={<ListIcon />}
            label={`${definitionCount} definición(es)`}
            color="primary"
            variant="outlined"
          />
          
          {entry.regName && entry.regName !== entry.name && (
            <Chip
              label={`Forma: ${entry.regName}`}
              color="info"
              variant="outlined"
            />
          )}
          
          {entry.isParent && (
            <Chip
              label="Entrada padre"
              color="success"
            />
          )}
          
          {entry.isChild && (
            <Chip
              label="Entrada hija"
              color="warning"
            />
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Sección de definiciones */}
      <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        <BookIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Definiciones
      </Typography>

      {definitionCount === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta entrada no tiene definiciones registradas.
        </Alert>
      ) : (
        <List sx={{ mb: 4 }}>
          {entry.definitions.map((def, index) => {
            const parsedDef = parseDefinition(def);
            
            return (
              <Paper key={def.id || index} elevation={1} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label={`Acepción ${def.senseNumber || index + 1}`}
                    color="primary"
                    size="small"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {def.wordClass && (
                      <Chip
                        label={def.wordClass}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    
                    {def.ontologicalClassification && (
                      <Chip
                        label={def.ontologicalClassification}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                {/* Texto de la definición */}
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  {parsedDef.texto || 'Sin texto de definición'}
                </Typography>

                {/* Información adicional */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {def.etymology && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        <LanguageIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1rem' }} />
                        Etimología
                      </Typography>
                      <Typography variant="body2">
                        {def.etymology}
                      </Typography>
                    </Grid>
                  )}
                  
                  {parsedDef.fuente && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Fuente
                      </Typography>
                      <Typography variant="body2" fontStyle="italic">
                        {parsedDef.fuente}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {/* Observaciones */}
                {def.remarks && (
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'warning.light' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Observaciones
                    </Typography>
                    <Typography variant="body2">
                      {def.remarks}
                    </Typography>
                  </Paper>
                )}
              </Paper>
            );
          })}
        </List>
      )}

      {/* Información técnica */}
      <Divider sx={{ my: 3 }} />
      
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Información Técnica
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">
              <strong>ID:</strong> {entry.id}
            </Typography>
            <Typography variant="body2">
              <strong>Palabra principal:</strong> {entry.name || 'No especificada'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2">
              <strong>Forma registrada:</strong> {entry.regName || 'No especificada'}
            </Typography>
            <Typography variant="body2">
              <strong>Definiciones:</strong> {definitionCount}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  );
}