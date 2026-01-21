
import { useState, useCallback, useRef } from 'react';
import * as ocrService from '../services/ocrService';

export const useOcr = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.5);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [captureMode, setCaptureMode] = useState('single');
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrResults, setOcrResults] = useState([]);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pdfContainerRef = useRef(null);

  // Subida de archivo PDF
  const handleFileUpload = useCallback((uploadedFile) => {
    setFile(uploadedFile);
    setFileUrl(URL.createObjectURL(uploadedFile));
    setPageNumber(1);
    setOcrResults([]);
    setSelection(null);
    setIsSelecting(false);
    setCapturedImage(null);
    setStartPoint(null);
    setCurrentMousePos(null);
  }, []);

  // Navegación de páginas
  const goToPreviousPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
    clearSelection();
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
    clearSelection();
  }, [numPages]);

  // Manejo de selección
  const clearSelection = useCallback(() => {
    setSelection(null);
    setStartPoint(null);
    setIsSelecting(false);
    setCapturedImage(null);
    setCurrentMousePos(null);
  }, []);

  const startSelection = useCallback((e) => {
    if (!isSelecting || !canvasRef.current || !pdfContainerRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    const x = (e.clientX - canvasRect.left) * scaleX;
    const y = (e.clientY - canvasRect.top) * scaleY;
    
    const safeX = Math.max(0, Math.min(x, canvas.width));
    const safeY = Math.max(0, Math.min(y, canvas.height));
    
    setStartPoint({ x: safeX, y: safeY });
    setSelection({ x: safeX, y: safeY, width: 0, height: 0 });
    setCurrentMousePos({ x: safeX, y: safeY });
    setCapturedImage(null);
  }, [isSelecting]);

  const updateSelection = useCallback((e) => {
    if (!isSelecting || !startPoint || !canvasRef.current || !pdfContainerRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    const x = (e.clientX - canvasRect.left) * scaleX;
    const y = (e.clientY - canvasRect.top) * scaleY;
    
    const safeX = Math.max(0, Math.min(x, canvas.width));
    const safeY = Math.max(0, Math.min(y, canvas.height));
    
    setCurrentMousePos({ x: safeX, y: safeY });
    
    const newSelection = {
      x: Math.min(startPoint.x, safeX),
      y: Math.min(startPoint.y, safeY),
      width: Math.abs(safeX - startPoint.x),
      height: Math.abs(safeY - startPoint.y)
    };
    
    setSelection(newSelection);
  }, [isSelecting, startPoint]);

  const endSelection = useCallback(() => {
    if (selection && selection.width > 10 && selection.height > 10) {
      setStartPoint(null);
    } else {
      setSelection(null);
      setStartPoint(null);
    }
    setCurrentMousePos(null);
  }, [selection]);

  // Capturar imagen del área seleccionada
  const captureImage = useCallback(() => {
    if (!selection || !canvasRef.current) return null;

    const { x, y, width, height } = selection;
    
    // Verificar tamaño mínimo
    if (width < 50 || height < 20) {
      alert("La selección es demasiado pequeña para procesar texto. Selecciona un área más grande.");
      return null;
    }
    
    const canvas = canvasRef.current;
    
    // Asegurar que la selección esté dentro de los límites
    const safeX = Math.max(0, Math.min(x, canvas.width - 1));
    const safeY = Math.max(0, Math.min(y, canvas.height - 1));
    const safeWidth = Math.min(width, canvas.width - safeX);
    const safeHeight = Math.min(height, canvas.height - safeY);
    
    // Crear canvas temporal
    const scale = 2;
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = safeWidth * scale;
    tmpCanvas.height = safeHeight * scale;
    const tmpCtx = tmpCanvas.getContext("2d");
    
    // Configurar alta calidad
    tmpCtx.imageSmoothingEnabled = false;
    tmpCtx.scale(scale, scale);
    
    // Dibujar el área seleccionada
    tmpCtx.drawImage(
      canvas, 
      safeX, safeY, safeWidth, safeHeight, 
      0, 0, safeWidth, safeHeight
    );
    
    // Convertir a PNG
    const base64 = tmpCanvas.toDataURL("image/png", 1.0);
    
    return {
      base64: base64,
      dimensions: { width: safeWidth * scale, height: safeHeight * scale },
      originalArea: { x: safeX, y: safeY, width: safeWidth, height: safeHeight },
      page: pageNumber,
      timestamp: new Date().toLocaleTimeString()
    };
  }, [selection, pageNumber]);

  // Procesar OCR
  const processOcrText = useCallback(async (imageData) => {
    if (!imageData) return null;
    
    setImageProcessing(true);
    try {
      const result = await ocrService.processOcr(imageData.base64, "spa");
      return result;
    } catch (error) {
      console.error('Error en OCR:', error);
      throw error;
    } finally {
      setImageProcessing(false);
    }
  }, []);

  // Agregar resultado OCR
  const addOcrResult = useCallback((text, imageData) => {
    const newResult = {
      id: Date.now(),
      text: text,
      page: imageData.page,
      timestamp: imageData.timestamp,
      area: imageData.originalArea,
      image: imageData.base64
    };
    
    setOcrResults(prev => [...prev, newResult]);
    return newResult;
  }, []);

  // Eliminar resultado OCR
  const removeOcrResult = useCallback((id) => {
    setOcrResults(prev => prev.filter(result => result.id !== id));
  }, []);

  // Limpiar todos los resultados
  const clearOcrResults = useCallback(() => {
    setOcrResults([]);
  }, []);

  // Actualizar ancho del contenedor
  const updateContainerWidth = useCallback(() => {
    if (pdfContainerRef.current) {
      const width = pdfContainerRef.current.getBoundingClientRect().width;
      setContainerWidth(Math.max(width - 40, 300));
    }
  }, []);

  return {
    // Estados
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
    
    // Refs
    canvasRef,
    containerRef,
    pdfContainerRef,
    
    // Setters
    setFile,
    setFileUrl,
    setNumPages,
    setPageNumber,
    setZoom,
    setIsSelecting,
    setSelection,
    setStartPoint,
    setCurrentMousePos,
    setCaptureMode,
    setCapturedImage,
    setOcrResults,
    setImageProcessing,
    setContainerWidth,
    
    // Funciones
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
    clearOcrResults,
    updateContainerWidth
  };
};