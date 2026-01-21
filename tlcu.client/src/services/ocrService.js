// services/ocrService.js
import api from './api';

/**
 * Procesa una imagen mediante OCR para extraer texto
 * @param {Object} requestBody - Cuerpo de la solicitud
 * @param {string} requestBody.imageBuffer - Imagen en formato base64 (sin el prefijo data:image/...)
 * @param {string} requestBody.language - Idioma para OCR (default: 'spa')
 * @returns {Promise<Object>} - Resultado del OCR con el texto extraído
 */
export const processOcr = async (requestBody) => {
  try {
    // Validar datos de entrada
    if (!requestBody || !requestBody.imageBuffer) {
      throw new Error('El campo imageBuffer es requerido');
    }

    console.log('📤 Enviando imagen para procesamiento OCR...', {
      language: requestBody.language || 'spa (default)',
      bufferLength: requestBody.imageBuffer.length,
      bufferPreview: requestBody.imageBuffer.substring(0, 50) + '...'
    });

      const response = await api.post('/ocr/process-buffer', requestBody);
      console.log('✅ OCR procesado exitosamente:', {
        textLength: response.data.text?.length || 0,
        preview: response.data.text + '...'
      });
      return response.data;
    
  } catch (error) {
    console.error('❌ Error en servicio OCR:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.response) {
      // El servidor respondió con un error
      console.error('Detalles del error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 404) {
        throw new Error('Endpoint OCR no encontrado. Verifica que el backend esté corriendo.');
      } else if (error.response.status === 400) {
        throw new Error('Datos inválidos para OCR: ' + JSON.stringify(error.response.data));
      } else if (error.response.status === 413) {
        throw new Error('La imagen es demasiado grande. Intenta con una selección más pequeña.');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      throw new Error('No se pudo conectar con el servidor OCR. Verifica que el backend esté corriendo en el puerto correcto.');
    }
    
    // Otro tipo de error
    throw new Error(`Error procesando OCR: ${error.message}`);
  }
};

/**
 * Procesa múltiples imágenes mediante OCR (opcional)
 * @param {Array} images - Array de objetos con imageBuffer
 * @param {string} language - Idioma para OCR
 * @returns {Promise<Array>} - Array de resultados de OCR
 */
export const processBatchOcr = async (images, language = 'spa') => {
  try {
    console.log(`📦 Procesando lote de ${images.length} imágenes...`);
    
    const promises = images.map((image, index) => {
      console.log(`🔄 Procesando imagen ${index + 1}/${images.length}`);
      return processOcr({
        imageBuffer: image.imageBuffer,
        language: image.language || language
      });
    });
    
    const results = await Promise.all(promises);
    console.log(`✅ Lote procesado: ${results.length} resultados`);
    
    return results;
  } catch (error) {
    console.error('❌ Error en procesamiento por lote:', error);
    throw error;
  }
};



/**
 * Versión simplificada para imágenes base64 completas (con prefijo data:image/...)
 * @param {string} base64Image - Imagen en base64 con prefijo
 * @param {string} language - Idioma para OCR
 * @returns {Promise<Object>} - Resultado del OCR
 */
export const processOcrFromBase64 = async (base64Image, language = 'spa') => {
  try {
    console.log('🔄 Procesando imagen base64 completa...');
    
    // Extraer solo la parte base64 (sin el prefijo data:image/...)
    let imageBuffer = base64Image;
    if (base64Image.includes(',')) {
      imageBuffer = base64Image.split(',')[1];
      console.log('Base64 limpiado:', imageBuffer.substring(0, 50) + '...');
    }
    
    return await processOcr({
      imageBuffer,
      language
    });
  } catch (error) {
    console.error('❌ Error procesando imagen base64:', error);
    throw error;
  }
};

/**
 * Procesa OCR desde un objeto File/Blob
 * @param {File|Blob} file - Archivo de imagen
 * @param {string} language - Idioma para OCR
 * @returns {Promise<Object>} - Resultado del OCR
 */
export const processOcrFromFile = async (file, language = 'spa') => {
  try {
    console.log('🔄 Procesando archivo:', file.name, file.type);
    
    // Convertir archivo a base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    return await processOcrFromBase64(base64, language);
  } catch (error) {
    console.error('❌ Error procesando archivo:', error);
    throw error;
  }
};

export default {
  processOcr,
  processBatchOcr,
  checkOcrHealth,
  processOcrFromBase64,
  processOcrFromFile
};