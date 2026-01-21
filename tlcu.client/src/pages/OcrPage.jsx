import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  Slider,
  Tooltip,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Upload as UploadIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Close as CloseIcon,
  ScreenSearchDesktop as ScreenSearchDesktopIcon,
  ContentCopy as ContentCopyIcon,
  CropFree as CropFreeIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Rectangle as RectangleIcon,
  Preview as PreviewIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon2,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { useOcr } from '../hooks/useOcr';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function OcrPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entryId, definitionId, dictionaryId } = location.state || {};
  
  const [textFieldValue, setTextFieldValue] = useState('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Usar el hook OCR
  const {
    file,
    fileUrl,
    numPages,
    pageNumber,
    zoom,
    isSelecting,
    selection,
    startPoint,
    currentMousePos,
    captureMode,
    capturedImage,
    ocrResults,
    imageProcessing,
    containerWidth,
    canvasRef,
    pdfContainerRef,
    setNumPages,
    setIsSelecting,
    setSelection,
    setStartPoint,
    setCurrentMousePos,
    setCapturedImage,
    setOcrResults,
    handleFileUpload,
    goToPreviousPage,
    goToNextPage,
    clearSelection,
    startSelection,
    updateSelection,
    endSelection,
    captureImage,
    processOcrText,
    addOcrResult,
    removeOcrResult,
    updateContainerWidth
  } = useOcr();

  // Inicializar desde el state de navegación
  useEffect(() => {
    if (location.state?.initialText) {
      setTextFieldValue(location.state.initialText);
    }
  }, [location.state]);

  // Actualizar ancho del contenedor
  useEffect(() => {
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [updateContainerWidth]);

  // Manejar subida de archivo
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    handleFileUpload(uploadedFile);
  };

  // Previsualizar imagen capturada
  const handlePreviewImage = () => {
    const captured = captureImage();
    if (captured) {
      setCapturedImage(captured);
      setPreviewImage(captured.base64);
      setShowImagePreview(true);
    }
  };

  // Procesar OCR directamente
  const handleProcessOcr = async () => {
    const captured = captureImage();
    if (!captured) return;
    
    try {
      const result = await processOcrText(captured);
      if (result && result.text) {
        // Agregar al campo de texto
        setTextFieldValue(prev => prev + (prev ? '\n\n' : '') + result.text);
        
        // Agregar a resultados
        addOcrResult(result.text, captured);
        
        // Limpiar selección si es modo single
        if (captureMode === 'single') {
          clearSelection();
          setIsSelecting(false);
        }
        
        alert('✅ Texto extraído correctamente');
      }
    } catch (error) {
      alert('❌ Error procesando OCR: ' + error.message);
    }
  };

  // Procesar OCR desde previsualización
  const handleProcessFromPreview = async () => {
    if (!capturedImage) return;
    
    try {
      const result = await processOcrText(capturedImage);
      if (result && result.text) {
        // Agregar al campo de texto
        setTextFieldValue(prev => prev + (prev ? '\n\n' : '') + result.text);
        
        // Agregar a resultados
        addOcrResult(result.text, capturedImage);
        
        // Cerrar previsualización
        setShowImagePreview(false);
        setCapturedImage(null);
        setPreviewImage(null);
        clearSelection();
        setIsSelecting(false);
        
        alert('✅ Texto extraído correctamente');
      }
    } catch (error) {
      alert('❌ Error procesando OCR: ' + error.message);
    }
  };

  // Agregar resultado OCR al texto
  const addResultToText = (text) => {
    setTextFieldValue(prev => prev + (prev ? '\n\n' : '') + text);
  };

  // Agregar todos los resultados al texto
  const addAllResultsToText = () => {
    const allText = ocrResults.map(r => r.text).join('\n\n');
    setTextFieldValue(prev => prev + (prev ? '\n\n' : '') + allText);
    setOcrResults([]);
  };

  // Guardar y volver
  const handleSave = () => {
    setIsSaving(true);
    // Simular guardado
    setTimeout(() => {
      if (location.state?.onSave) {
        location.state.onSave(textFieldValue);
      }
      navigate(-1); // Volver a la página anterior
    }, 500);
  };

  // Cancelar
  const handleCancel = () => {
    navigate(-1);
  };

  // Obtener coordenadas del overlay
  const getOverlayCoordinates = () => {
    if (!selection || !canvasRef.current || !pdfContainerRef.current) return null;
    
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = pdfContainerRef.current.getBoundingClientRect();
    
    const scaleX = canvasRect.width / canvas.width;
    const scaleY = canvasRect.height / canvas.height;
    
    const canvasOffsetX = (canvasRect.left - containerRect.left) + pdfContainerRef.current.scrollLeft;
    const canvasOffsetY = (canvasRect.top - containerRect.top) + pdfContainerRef.current.scrollTop;
    
    return {
      x: canvasOffsetX + (selection.x * scaleX),
      y: canvasOffsetY + (selection.y * scaleY),
      width: selection.width * scaleX,
      height: selection.height * scaleY
    };
  };

  const overlayCoords = getOverlayCoordinates();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon2 fontSize="small" />} sx={{ mb: 3 }}>
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
          href={`/dictionaries/${dictionaryId}/entries`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/dictionaries/${dictionaryId}/entries`);
          }}
        >
          Diccionario {dictionaryId}
        </Link>
        <Typography color="text.primary">
          OCR - Extraer texto de PDF
        </Typography>
      </Breadcrumbs>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        {/* Encabezado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={handleCancel}
            variant="outlined"
            size="small"
          >
            Volver
          </Button>
          
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Extraer Texto de PDF (OCR)
          </Typography>
          
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSave}
            variant="contained"
            color="primary"
            size="small"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Usar Texto'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Panel izquierdo: Controles y resultados */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddPhotoAlternateIcon /> Controles OCR
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Subida de archivo */}
                  <Box>
                    <Button
                      component="label"
                      variant="contained"
                      fullWidth
                      startIcon={<UploadIcon />}
                    >
                      Seleccionar PDF
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        hidden
                      />
                    </Button>
                    
                    {file && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Archivo: {file.name}
                      </Typography>
                    )}
                  </Box>

                  {/* Abrir visor */}
                  {file && (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ScreenSearchDesktopIcon />}
                      onClick={() => setShowPdfViewer(true)}
                    >
                      Abrir Visor PDF
                    </Button>
                  )}

                  {/* Texto extraído */}
                  {ocrResults.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Textos extraídos ({ocrResults.length}):
                      </Typography>
                      <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {ocrResults.map((result) => (
                          <Card key={result.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="caption" color="text.secondary">
                                Página {result.page} - {result.timestamp}
                              </Typography>
                              <IconButton size="small" onClick={() => removeOcrResult(result.id)}>
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
                              {result.text.length > 100 ? result.text.substring(0, 100) + '...' : result.text}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<ContentCopyIcon />}
                              onClick={() => addResultToText(result.text)}
                              sx={{ mt: 0.5 }}
                            >
                              Agregar
                            </Button>
                          </Card>
                        ))}
                      </Box>
                      
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={addAllResultsToText}
                        sx={{ mt: 1 }}
                      >
                        Agregar todos los textos
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Campo de texto para la definición */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Texto de la Definición
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  value={textFieldValue}
                  onChange={(e) => setTextFieldValue(e.target.value)}
                  placeholder="El texto extraído aparecerá aquí..."
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Puedes editar el texto extraído o combinarlo con texto manual.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Panel derecho: Instrucciones */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Instrucciones de Uso
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    Esta herramienta te permite extraer texto de archivos PDF usando tecnología OCR (Reconocimiento Óptico de Caracteres).
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Pasos:
                  </Typography>
                  <ol>
                    <li><strong>Selecciona un PDF</strong> usando el botón "Seleccionar PDF"</li>
                    <li><strong>Abre el visor PDF</strong> para navegar por el documento</li>
                    <li><strong>Activa el modo selección</strong> en el visor</li>
                    <li><strong>Selecciona un área</strong> de texto arrastrando el cursor</li>
                    <li><strong>Procesa el OCR</strong> para extraer el texto</li>
                    <li><strong>Revisa y edita</strong> el texto extraído</li>
                    <li><strong>Guarda</strong> para usar el texto en la definición</li>
                  </ol>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Consejos para mejores resultados:
                </Typography>
                <ul>
                  <li>Usa PDFs con texto claro y buena resolución</li>
                  <li>Selecciona áreas con suficiente contraste</li>
                  <li>Para texto en columnas, selecciona cada columna por separado</li>
                  <li>Revisa el texto extraído por posibles errores de reconocimiento</li>
                  <li>Usa el modo "Múltiples capturas" para extraer varias áreas sin cerrar el visor</li>
                </ul>

                {!file && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    Selecciona un archivo PDF para comenzar a extraer texto.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog del visor PDF */}
      <Dialog
        open={showPdfViewer}
        onClose={() => setShowPdfViewer(false)}
        maxWidth="xl"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <DialogContent sx={{ p: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Controles superiores */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            flexWrap: 'wrap'
          }}>
            {/* Navegación */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={goToPreviousPage} disabled={pageNumber <= 1}>
                <NavigateBeforeIcon />
              </IconButton>
              
              <Typography variant="body2" sx={{ minWidth: 100 }}>
                Página {pageNumber} de {numPages || '?'}
              </Typography>
              
              <IconButton onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)}>
                <NavigateNextIcon />
              </IconButton>

              <Slider
                value={pageNumber}
                min={1}
                max={numPages || 1}
                onChange={(_, value) => setPageNumber(value)}
                sx={{ width: 120 }}
              />
            </Box>

            {/* Zoom */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Alejar">
                <IconButton onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>

              <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </Typography>

              <Tooltip title="Acercar">
                <IconButton onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Modo de captura */}
            <ToggleButtonGroup
              value={captureMode}
              exclusive
              onChange={(_, mode) => mode && setCaptureMode(mode)}
              size="small"
            >
              <ToggleButton value="single">
                <CropFreeIcon fontSize="small" /> Una
              </ToggleButton>
              <ToggleButton value="multiple">
                <RectangleIcon fontSize="small" /> Múltiples
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Botón de selección */}
            <Button
              startIcon={isSelecting ? <CheckIcon /> : <CropFreeIcon />}
              variant={isSelecting ? "contained" : "outlined"}
              color={isSelecting ? "success" : "primary"}
              onClick={() => {
                setIsSelecting(!isSelecting);
                if (isSelecting) {
                  clearSelection();
                }
              }}
              size="small"
            >
              {isSelecting ? 'Seleccionando' : 'Seleccionar'}
            </Button>

            {/* Botón previsualizar */}
            <Button
              startIcon={<PreviewIcon />}
              variant="outlined"
              color="secondary"
              onClick={handlePreviewImage}
              disabled={(!selection && !startPoint) || imageProcessing}
              size="small"
            >
              Previsualizar
            </Button>

            {/* Botón procesar OCR */}
            <Button
              startIcon={<ContentCopyIcon />}
              variant="contained"
              color="primary"
              onClick={handleProcessOcr}
              disabled={(!selection && !startPoint) || imageProcessing}
              size="small"
            >
              {imageProcessing ? <CircularProgress size={20} /> : 'Procesar OCR'}
            </Button>

            <IconButton onClick={() => setShowPdfViewer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Área del PDF */}
          <Box
            ref={pdfContainerRef}
            sx={{
              flex: 1,
              position: 'relative',
              overflow: 'auto',
              bgcolor: 'grey.200',
              cursor: isSelecting ? 'crosshair' : 'default'
            }}
            onMouseDown={startSelection}
            onMouseMove={updateSelection}
            onMouseUp={endSelection}
            onMouseLeave={endSelection}
          >
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              p: 2,
              minHeight: '100%'
            }}>
              {fileUrl ? (
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                      <CircularProgress />
                      <Typography sx={{ ml: 2 }}>Cargando PDF...</Typography>
                    </Box>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={zoom}
                    loading={
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Cargando página...</Typography>
                      </Box>
                    }
                    canvasRef={canvasRef}
                    width={containerWidth}
                  />
                </Document>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <Typography>Selecciona un archivo PDF primero</Typography>
                </Box>
              )}
            </Box>

            {/* Overlay de selección */}
            {overlayCoords && (
              <div
                style={{
                  position: 'absolute',
                  left: `${overlayCoords.x}px`,
                  top: `${overlayCoords.y}px`,
                  width: `${overlayCoords.width}px`,
                  height: `${overlayCoords.height}px`,
                  border: '2px dashed #2196f3',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              />
            )}
          </Box>

          {/* Indicadores de estado */}
          <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'grey.100', flexWrap: 'wrap' }}>
            <Chip
              icon={isSelecting ? <CheckIcon /> : <CropFreeIcon />}
              label={isSelecting ? 'Modo selección activo' : 'Selección desactivada'}
              color={isSelecting ? "success" : "default"}
              variant={isSelecting ? "filled" : "outlined"}
              size="small"
            />
            
            <Chip
              icon={<RectangleIcon />}
              label={`Modo: ${captureMode === 'single' ? 'Una captura' : 'Múltiples capturas'}`}
              color="primary"
              variant="outlined"
              size="small"
            />

            {overlayCoords && (
              <Chip
                icon={<PreviewIcon />}
                label={`Área: ${Math.round(overlayCoords.width)}×${Math.round(overlayCoords.height)}px`}
                color="info"
                size="small"
              />
            )}

            <Typography variant="body2" sx={{ ml: 'auto', fontStyle: 'italic', color: 'text.secondary' }}>
              {isSelecting
                ? 'Haz clic y arrastra para seleccionar un área, luego haz clic en "Procesar OCR"'
                : 'Activa el modo selección para capturar áreas de texto'}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de previsualización de imagen */}
      <Dialog
        open={showImagePreview}
        onClose={() => !imageProcessing && setShowImagePreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PreviewIcon /> Previsualización de la Imagen
          </Typography>
          
          {previewImage && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img
                src={previewImage}
                alt="Área seleccionada para OCR"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  border: '2px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              
              {capturedImage && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Información de la captura:</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Página: {capturedImage.page}
                  </Typography>
                  <Typography variant="body2">
                    • Resolución: {capturedImage.dimensions.width} × {capturedImage.dimensions.height} px
                  </Typography>
                  <Typography variant="body2">
                    • Hora: {capturedImage.timestamp}
                  </Typography>
                </Box>
              )}
              
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                Verifica que el texto sea legible antes de procesar el OCR
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setShowImagePreview(false)}
            disabled={imageProcessing}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<ContentCopyIcon />}
            onClick={handleProcessFromPreview}
            disabled={imageProcessing}
          >
            {imageProcessing ? 'Procesando...' : 'Procesar OCR'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}