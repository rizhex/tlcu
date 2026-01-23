import {
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Alert,
  Grid
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Book as BookIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Place as PlaceIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DictionaryDetail({ 
  dictionary, 
  onClose, 
  onEdit,
  onNavigateToEntries 
}) {
  const navigate = useNavigate();

  // Función para parsear autor JSON
  const parseAuthor = (authorStr) => {
    if (!authorStr) return 'No especificado';
    try {
      const parsed = JSON.parse(authorStr);
      return parsed.author || authorStr;
    } catch {
      return authorStr;
    }
  };

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No especificada';
    return dateStr;
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={onClose}
          variant="outlined"
          size="small"
        >
          Volver a la lista
        </Button>
        
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<BookIcon />}
            onClick={() => onNavigateToEntries(dictionary.id)}
            variant="contained"
            color="primary"
            size="small"
          >
            Ver Entradas
          </Button>
          <Button
            startIcon={<EditIcon />}
            onClick={onEdit}
            variant="outlined"
            color="primary"
            size="small"
          >
            Editar
          </Button>
        </Stack>
      </Box>

      {/* Información principal */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {dictionary.name || 'Sin nombre'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={dictionary.projectName || 'Sin proyecto'}
            color="primary"
            variant="outlined"
          />
          {dictionary.century && (
            <Chip
              label={`Siglo ${dictionary.century}`}
              color="secondary"
              variant="outlined"
            />
          )}
          {dictionary.edition && (
            <Chip
              label={dictionary.edition}
              color="info"
              variant="outlined"
            />
          )}
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 3, color: 'text.secondary' }}>
          {dictionary.title || 'Sin título'}
        </Typography>
        
        {dictionary.fullTitle && (
          <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50', mb: 2 }}>
            <Typography variant="body1" dangerouslySetInnerHTML={{ __html: dictionary.fullTitle }} />
          </Paper>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Información detallada en grid - ACTUALIZADO para usar size en lugar de item xs/md */}
      <Grid container spacing={3}>
        {/* Columna 1: Información básica */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Información Básica
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <PersonIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1rem' }} />
                Autor
              </Typography>
              <Typography variant="body1">
                {parseAuthor(dictionary.author)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <DateIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1rem' }} />
                Fecha de publicación
              </Typography>
              <Typography variant="body1">
                {formatDate(dictionary.publishingDate)}
                {dictionary.originalDate && ` (Original: ${dictionary.originalDate})`}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <PlaceIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1rem' }} />
                Lugar de publicación
              </Typography>
              <Typography variant="body1">
                {dictionary.publishingPlace || 'No especificado'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <BookmarkIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1rem' }} />
                Editorial
              </Typography>
              <Typography variant="body1">
                {dictionary.publisher || 'No especificada'}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Columna 2: Información del proyecto */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Información del Proyecto
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Nombre del proyecto
              </Typography>
              <Typography variant="body1">
                {dictionary.projectName || 'No especificado'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Transcriptor
              </Typography>
              <Typography variant="body1">
                {dictionary.transcriber || 'No especificado'}
                {dictionary.transcriptionDate && ` (${dictionary.transcriptionDate})`}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Revisor
              </Typography>
              <Typography variant="body1">
                {dictionary.revisorName || 'No especificado'}
                {dictionary.revisionDate && ` (${dictionary.revisionDate})`}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Fuente
              </Typography>
              <Typography variant="body1">
                {dictionary.sourceName || 'No especificada'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Prólogo
              </Typography>
              <Typography variant="body1">
                {dictionary.prologueName || 'No especificado'}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Observaciones */}
      {dictionary.remarks && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Observaciones
            </Typography>
            <Paper elevation={0} sx={{ p: 2, backgroundColor: 'warning.light' }}>
              <Typography variant="body1">
                {dictionary.remarks}
              </Typography>
            </Paper>
          </Box>
        </>
      )}

      {/* Alerta informativa actualizada */}
      <Alert severity="info" sx={{ mt: 3 }}>
        Información del diccionario {dictionary.name || ''} - ID: {dictionary.id}
      </Alert>
    </Paper>
  );
}