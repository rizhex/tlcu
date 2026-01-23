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
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  List as ListIcon
} from '@mui/icons-material';

export default function EntryList({
  entries = [],
  onEdit,
  onDetail,
  onDelete
}) {
  // Función para contar definiciones
  const countDefinitions = (entry) => {
    if (!entry.definitions || !Array.isArray(entry.definitions)) return 0;
    return entry.definitions.length;
  };

  // Función para obtener primera definición
  const getFirstDefinition = (entry) => {
    if (!entry.definitions || entry.definitions.length === 0) return 'Sin definición';
    
    const firstDef = entry.definitions[0];
    if (firstDef.parsedDef?.texto) {
      return firstDef.parsedDef.texto.length > 100 
        ? firstDef.parsedDef.texto.substring(0, 100) + '...'
        : firstDef.parsedDef.texto;
    }
    
    if (firstDef.defText) {
      const text = typeof firstDef.defText === 'string' 
        ? firstDef.defText 
        : JSON.stringify(firstDef.defText);
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    return 'Definición disponible';
  };

  if (entries.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No hay entradas para mostrar
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '25%' }}>Palabra</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '25%' }}>Forma registrada</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '35%' }}>Definición</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }} align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.id}
              hover
              sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
            >
              {/* Palabra */}
              <TableCell>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {entry.name || 'Sin nombre'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {entry.definitions?.[0]?.wordClass && (
                      <Chip
                        label={entry.definitions[0].wordClass}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {entry.isParent && (
                      <Chip
                        label="Padre"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {entry.isChild && (
                      <Chip
                        label="Hija"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </TableCell>

              {/* Forma registrada */}
              <TableCell>
                <Typography variant="body2" color={entry.regName !== entry.name ? 'text.primary' : 'text.secondary'}>
                  {entry.regName || 'Sin forma registrada'}
                </Typography>
              </TableCell>

              {/* Definición */}
              <TableCell>
                <Box>
                  <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                    {getFirstDefinition(entry)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Tooltip title={`${countDefinitions(entry)} definición(es)`}>
                      <Chip
                        icon={<ListIcon />}
                        label={countDefinitions(entry)}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    </Tooltip>
                    {entry.definitions?.[0]?.etymology && (
                      <Tooltip title="Etimología disponible">
                        <Chip
                          label="Etim."
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </TableCell>

              {/* Acciones */}
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onDetail(entry)}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(entry)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(entry)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}