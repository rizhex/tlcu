import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from "react-pdf";

// Para Vite, usa estas importaciones de CSS
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ContentCopy as ContentCopyIcon,
  CropFree as CropFreeIcon,
  Check as CheckIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import { processOcr } from '../../services/ocrService';

export default function OcrModal({
  open,
  onClose,
  onApplyText,
  currentDefinitionIndex
}) {
  // Estados principales
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  
  // Estados para selección
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  
  // Estados para OCR
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState([]);
  const [pdfError, setPdfError] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const pdfContainerRef = useRef(null);

  // Resetear estado cuando se cierra
  useEffect(() => {
    if (!open) {
      resetOcrState();
    }
  }, [open]);

  const resetOcrState = useCallback(() => {
    setPdfFile(null);
    setPdfData(null);
    setNumPages(0);
    setPageNumber(1);
    setZoom(1.0);
    setIsSelecting(false);
    setSelection(null);
    setIsDragging(false);
    setStartPoint(null);
    setOcrProcessing(false);
    setOcrResults([]);
    setPdfError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    const isValidPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isValidPDF) {
      setPdfError('Por favor, selecciona un archivo PDF válido');
      return;
    }
    
    resetOcrState();
    setPdfFile(file);
    setPdfError(null);
    
    try {
      // Leer el archivo como ArrayBuffer
      console.log('Leyendo archivo PDF...', file.name);
      const arrayBuffer = await file.arrayBuffer();
      console.log('Archivo leído, tamaño:', arrayBuffer.byteLength);
      setPdfData(arrayBuffer);
    } catch (error) {
      console.error('Error al leer el archivo PDF:', error);
      setPdfError('Error al procesar el archivo PDF');
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    console.log('✅ PDF cargado exitosamente. Páginas:', numPages);
    setNumPages(numPages);
    setPdfError(null);
  };

  const handleDocumentLoadError = (error) => {
    console.error('❌ Error al cargar el PDF:', error);
    console.log('Versión de pdfjs:', pdfjs.version);
    console.log('Worker configurado:', pdfjs.GlobalWorkerOptions.workerSrc);
    setPdfError(`Error al cargar el documento PDF: ${error.message || 'Verifica que el archivo no esté dañado.'}`);
  };

  const clearSelection = () => {
    setSelection(null);
    setStartPoint(null);
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
      clearSelection();
    }
  };

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(prev => prev + 1);
      clearSelection();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  // Manejo de selección de área
  const getMousePosition = (event) => {
    if (!pdfContainerRef.current) return { x: 0, y: 0 };
    
    const container = pdfContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handleMouseDown = (event) => {
    if (!isSelecting || !pdfData) return;
    
    const pos = getMousePosition(event);
    setStartPoint(pos);
    setSelection({ ...pos, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !startPoint) return;
    
    const pos = getMousePosition(event);
    
    setSelection({
      x: Math.min(startPoint.x, pos.x),
      y: Math.min(startPoint.y, pos.y),
      width: Math.abs(pos.x - startPoint.x),
      height: Math.abs(pos.y - startPoint.y)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Validar tamaño mínimo de selección
    if (selection && selection.width < 10 && selection.height < 10) {
      setSelection(null);
    }
  };

  const captureSelectedArea = () => {
    if (!selection) {
      alert('Por favor, selecciona un área primero');
      return null;
    }

    const canvas = pdfContainerRef.current?.querySelector('canvas');
    if (!canvas) {
      alert('No se encontró el contenido del PDF');
      return null;
    }

    const { x, y, width, height } = selection;
    
    // Calcular escala del canvas
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    const canvasWidth = width * scaleX;
    const canvasHeight = height * scaleY;

    // Validar tamaño
    if (canvasWidth < 20 || canvasHeight < 20) {
      alert('La selección es demasiado pequeña');
      return null;
    }

    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const ctx = tempCanvas.getContext('2d');
      
      ctx.drawImage(
        canvas,
        canvasX, canvasY, canvasWidth, canvasHeight,
        0, 0, canvasWidth, canvasHeight
      );
      
      return {
        base64: tempCanvas.toDataURL('image/png'),
        dimensions: { width: canvasWidth, height: canvasHeight },
        page: pageNumber,
        timestamp: new Date().toLocaleTimeString()
      };
    } catch (error) {
      console.error('Error capturando imagen:', error);
      alert('Error capturando la imagen');
      return null;
    }
  };

  const handleProcessOcr = async () => {
  const capturedImage = captureSelectedArea();
  if (!capturedImage) return;
  
  setOcrProcessing(true);
  
  try {
    const base64Data = capturedImage.base64.split(',')[1];
    
    const result = await processOcr({
      imageBuffer: base64Data,
      language: 'spa'
    });
    
    if (result?.text) {
      const newResult = {
        id: Date.now(),
        text: result.text,
        page: capturedImage.page,
        timestamp: capturedImage.timestamp,
        confidence: result.confidence
      };
      
      setOcrResults(prev => [...prev, newResult]);
      clearSelection();
      
      // Mensaje más informativo
      alert(`✅ Texto extraído (${result.text.length} caracteres)`);
    } else {
      alert('❌ No se pudo extraer texto del área seleccionada');
    }
  } catch (error) {
    console.error('Error en OCR:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    setOcrProcessing(false);
  }
};

  const removeOcrResult = (id) => {
    setOcrResults(prev => prev.filter(result => result.id !== id));
  };

  
  const applyResults = () => {
    if (ocrResults.length === 0) return;
    
    // Verifica qué datos tienes
    console.log('📤 Aplicando resultados:', {
      cantidad: ocrResults.length,
      textos: ocrResults.map(r => ({
        id: r.id,
        textoPreview: r.text.substring(0, 50) + '...',
        longitud: r.text.length,
        pagina: r.page
      })),
      currentDefinitionIndex: currentDefinitionIndex
    });
    
    // Concatenar todos los textos
    const allText = ocrResults.map(r => r.text).join('\n\n');
    console.log('📄 Texto completo a enviar:', allText.substring(0, 200) + '...');
    
    // Llamar al callback
    if (onApplyText) {
      console.log('🔄 Ejecutando onApplyText...');
      onApplyText(allText, currentDefinitionIndex);
    } else {
      console.error('❌ onApplyText no está definido!');
    }
    
    // Limpiar y cerrar
    setOcrResults([]);
    onClose();
  };
  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open || !pdfData) return;
      
      switch(event.key) {
        case 'ArrowLeft':
          if (pageNumber > 1) handlePreviousPage();
          break;
        case 'ArrowRight':
          if (pageNumber < numPages) handleNextPage();
          break;
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleZoomOut();
          }
          break;
        case 'Escape':
          setIsSelecting(false);
          clearSelection();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, pdfData, pageNumber, numPages]);

  // Componente de carga
  const renderLoader = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      flexDirection: 'column',
      gap: 2
    }}>
      <CircularProgress />
      <Typography>Cargando PDF...</Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{ 
        '& .MuiDialog-paper': { 
          height: '90vh',
          maxHeight: '90vh'
        } 
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pr: 2,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddPhotoAlternateIcon />
          <Typography variant="h6">
            Extraer Texto de PDF (OCR)
          </Typography>
          {currentDefinitionIndex !== null && (
            <Chip 
              label={`Definición #${currentDefinitionIndex + 1}`}
              size="small"
              variant="outlined"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Controles principales */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            component="label"
            variant="contained"
            startIcon={<UploadIcon />}
            size="small"
          >
            Seleccionar PDF
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              hidden
            />
          </Button>

          {pdfFile && (
            <Chip
              label={pdfFile.name}
              size="small"
              onDelete={resetOcrState}
            />
          )}

          {pdfData && (
            <>
              {/* Navegación */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                <Tooltip title="Página anterior (←)">
                  <span>
                    <IconButton 
                      onClick={handlePreviousPage} 
                      disabled={pageNumber <= 1}
                      size="small"
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                
                <Typography variant="body2" sx={{ minWidth: 100, textAlign: 'center' }}>
                  Página {pageNumber} de {numPages || '?'}
                </Typography>
                
                <Tooltip title="Página siguiente (→)">
                  <span>
                    <IconButton 
                      onClick={handleNextPage} 
                      disabled={pageNumber >= (numPages || 1)}
                      size="small"
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {/* Zoom */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Alejar (Ctrl -)">
                  <IconButton onClick={handleZoomOut} size="small">
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                
                <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                  {Math.round(zoom * 100)}%
                </Typography>
                
                <Tooltip title="Acercar (Ctrl +)">
                  <IconButton onClick={handleZoomIn} size="small">
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Selección */}
              <Button
                startIcon={isSelecting ? <CheckIcon /> : <CropFreeIcon />}
                variant={isSelecting ? "contained" : "outlined"}
                color={isSelecting ? "success" : "primary"}
                onClick={() => {
                  setIsSelecting(!isSelecting);
                  if (isSelecting) clearSelection();
                }}
                size="small"
              >
                {isSelecting ? 'Seleccionando...' : 'Seleccionar área'}
              </Button>

              {/* Procesar OCR */}
              <Button
                startIcon={ocrProcessing ? <CircularProgress size={20} /> : <ContentCopyIcon />}
                variant="contained"
                color="primary"
                onClick={handleProcessOcr}
                disabled={!selection || ocrProcessing}
                size="small"
              >
                {ocrProcessing ? 'Procesando...' : 'Extraer texto'}
              </Button>
            </>
          )}
        </Box>

        {/* Área principal */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* Visor de PDF */}
          <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {pdfError && (
              <Alert severity="error" sx={{ m: 2 }}>
                {pdfError}
                <Button 
                  size="small" 
                  onClick={resetOcrState}
                  sx={{ ml: 2 }}
                >
                  Intentar de nuevo
                </Button>
              </Alert>
            )}

            {!pdfData ? (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: 'grey.50',
                p: 4
              }}>
                <AddPhotoAlternateIcon sx={{ fontSize: 80, color: 'grey.300', mb: 3 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Selecciona un archivo PDF
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
                  Carga un documento PDF para extraer texto usando OCR
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<UploadIcon />}
                  size="large"
                >
                  Seleccionar PDF
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    hidden
                  />
                </Button>
              </Box>
            ) : (
              <Box
                ref={pdfContainerRef}
                sx={{
                  flex: 1,
                  position: 'relative',
                  overflow: 'auto',
                  bgcolor: 'grey.200',
                  cursor: isSelecting ? 'crosshair' : 'default'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  p: 2,
                  minHeight: '100%'
                }}>
                  <Document
                    file={pdfData}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    onLoadError={handleDocumentLoadError}
                    loading={renderLoader()}
                    noData={
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '400px',
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        <Typography color="error">No se pudo cargar el PDF</Typography>
                        <Button 
                          variant="outlined" 
                          onClick={resetOcrState}
                        >
                          Seleccionar otro archivo
                        </Button>
                      </Box>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={zoom}
                      width={800}
                      loading={renderLoader()}
                      renderTextLayer={true}
                      renderAnnotationLayer={false}
                      error={
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '400px'
                        }}>
                          <Typography color="error">Error cargando página</Typography>
                        </Box>
                      }
                    />
                  </Document>

                  {/* Overlay de selección */}
                  {selection && selection.width > 0 && selection.height > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${selection.x}px`,
                        top: `${selection.y}px`,
                        width: `${selection.width}px`,
                        height: `${selection.height}px`,
                        border: '2px dashed #2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>

          {/* Resultados del OCR */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 300,
            maxWidth: 400,
            borderLeft: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Textos extraídos ({ocrResults.length})
                </Typography>
                {ocrResults.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setOcrResults([])}
                    startIcon={<CloseIcon />}
                  >
                    Limpiar
                  </Button>
                )}
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {ocrResults.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%',
                  color: 'text.secondary',
                  p: 3,
                  textAlign: 'center'
                }}>
                  <ContentCopyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                  <Typography variant="body1" gutterBottom>
                    No hay textos extraídos
                  </Typography>
                  <Typography variant="caption">
                    Selecciona un área en el PDF y haz clic en "Extraer texto"
                  </Typography>
                </Box>
              ) : (
                ocrResults.map((result) => (
                  <Card key={result.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Chip
                            label={`Página ${result.page}`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {result.timestamp}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => removeOcrResult(result.id)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'grey.50',
                          maxHeight: 150,
                          overflow: 'auto',
                          fontSize: '0.875rem'
                        }}
                      >
                        {result.text}
                      </Paper>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        
        <Button
          variant="contained"
          onClick={applyResults}
          disabled={ocrResults.length === 0}
          startIcon={<DownloadIcon />}
        >
          Aplicar {ocrResults.length > 0 ? `(${ocrResults.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}