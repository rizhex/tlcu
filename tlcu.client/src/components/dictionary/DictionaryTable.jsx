import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Book as BookIcon
} from '@mui/icons-material';

export default function DictionaryTable({
  dictionaries = [],
  onEdit,
  onDelete,
  onDetail,
  onNavigateToEntries
}) {
  // Función para parsear autor JSON
  const parseAuthor = (authorStr) => {
    if (!authorStr) return 'Sin autor';
    try {
      const parsed = JSON.parse(authorStr);
      return parsed.author || authorStr;
    } catch {
      return authorStr;
    }
  };

  if (dictionaries.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No hay diccionarios para mostrar
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Título</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Autor</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Proyecto</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dictionaries.map((dictionary) => (
            <TableRow
              key={dictionary.id}
              hover
              sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <TableCell>
                <Typography variant="body1" fontWeight="medium">
                  {dictionary.name || 'Sin nombre'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {dictionary.title || 'Sin título'}
                </Typography>
                {dictionary.edition && (
                  <Chip
                    label={dictionary.edition}
                    size="small"
                    sx={{ mt: 0.5 }}
                    color="info"
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {parseAuthor(dictionary.author)}
                </Typography>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {dictionary.publishingDate || 'Sin fecha'}
                  </Typography>
                  {dictionary.century && (
                    <Chip
                      label={`Siglo ${dictionary.century}`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {dictionary.projectName || 'Sin proyecto'}
                </Typography>
                {dictionary.transcriber && (
                  <Typography variant="caption" color="text.secondary">
                    Transcripción: {dictionary.transcriber}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() => onDetail(dictionary)}
                    title="Ver detalles"
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(dictionary)}
                    title="Editar"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => onNavigateToEntries(dictionary.id)}
                    title="Ver entradas"
                  >
                    <BookIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(dictionary.id)}
                    title="Eliminar"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}