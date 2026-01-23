import api from './api';

export const getDictionaries = async (page = 1, limit = 10, search = '') => {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    
    const response = await api.get('/dictionaries', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener diccionarios:', error);
    throw error;
  }
};

export const getDictionary = async (id) => {
  try {
    const response = await api.get(`/dictionaries/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener diccionario ${id}:`, error);
    throw error;
  }
};
export const createDictionary = async (dictionaryData) => {
  try {
    const dataToSend = {
      name: dictionaryData.name.trim(),
      title: dictionaryData.title?.trim() || '',
      fullTitle: dictionaryData.fullTitle?.trim() || '',
      author: dictionaryData.author?.trim() || '',
      originalDate: dictionaryData.originalDate?.trim() || '',
      century: dictionaryData.century?.trim() || '',
      publishingPlace: dictionaryData.publishingPlace?.trim() || '',
      publisher: dictionaryData.publisher?.trim() || '',
      publishingDate: dictionaryData.publishingDate?.trim() || '',
      edition: dictionaryData.edition?.trim() || '',
      sourceName: dictionaryData.sourceName?.trim() || '',
      remarks: dictionaryData.remarks?.trim() || '',
      projectName: dictionaryData.projectName?.trim() || '',
      transcriber: dictionaryData.transcriber?.trim() || '',
      transcriptionDate: dictionaryData.transcriptionDate?.trim() || '',
      revisorName: dictionaryData.revisorName?.trim() || '',
      revisionDate: dictionaryData.revisionDate?.trim() || '',
      prologueName: dictionaryData.prologueName?.trim() || ''
      // Eliminados: fileNameXML, sourceURL, prologueURL
    };

    console.log('📤 Enviando al backend:', JSON.stringify(dataToSend, null, 2));
    
    const response = await api.post('/dictionaries', dataToSend);
    console.log('✅ Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error completo:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message
    });
    
    if (error.response?.status === 409) {
      throw new Error(error.response?.data?.message || 'Ya existe un diccionario con ese nombre');
    }
    throw new Error(error.response?.data?.message || 'Error al crear diccionario');
  }
};

export const updateDictionary = async (id, dictionaryData) => {
  try {
    const dataToSend = {
      name: dictionaryData.name.trim(),
      title: dictionaryData.title?.trim() || '',
      fullTitle: dictionaryData.fullTitle?.trim() || '',
      author: dictionaryData.author?.trim() || '',
      originalDate: dictionaryData.originalDate?.trim() || '',
      century: dictionaryData.century?.trim() || '',
      publishingPlace: dictionaryData.publishingPlace?.trim() || '',
      publisher: dictionaryData.publisher?.trim() || '',
      publishingDate: dictionaryData.publishingDate?.trim() || '',
      edition: dictionaryData.edition?.trim() || '',
      sourceName: dictionaryData.sourceName?.trim() || '',
      remarks: dictionaryData.remarks?.trim() || '',
      projectName: dictionaryData.projectName?.trim() || '',
      transcriber: dictionaryData.transcriber?.trim() || '',
      transcriptionDate: dictionaryData.transcriptionDate?.trim() || '',
      revisorName: dictionaryData.revisorName?.trim() || '',
      revisionDate: dictionaryData.revisionDate?.trim() || '',
      prologueName: dictionaryData.prologueName?.trim() || ''
      // Eliminados: fileNameXML, sourceURL, prologueURL
    };

    console.log('📤 Actualizando diccionario:', dataToSend);
    const response = await api.put(`/dictionaries/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar diccionario ${id}:`, error);
    throw error;
  }
};

export const deleteDictionary = async (id) => {
  try {
    const response = await api.delete(`/dictionaries/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar diccionario ${id}:`, error);
    throw error;
  }
};

export const importDictionaryXML = async (file) => {
  try {
    console.log('📤 Importando archivo XML:', file.name, file.size, 'bytes');
    
    // Leer el contenido del archivo como texto
    const fileContent = await readFileAsText(file);
    
    // Enviar como JSON con el contenido del XML, no como FormData
    const dataToSend = {
      filename: file.name,
      content: fileContent
    };
    
    console.log('📝 Enviando XML como texto, tamaño:', fileContent.length, 'caracteres');
    
    const response = await api.post('/dictionaries/import', dataToSend, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 segundos para archivos grandes
    });
    
    console.log('✅ XML importado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al importar XML:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 400) {
      throw new Error('Formato de archivo inválido o estructura XML incorrecta');
    } else if (error.response?.status === 500) {
      throw new Error(error.response?.data?.message || 'Error al procesar el archivo XML. Todos los cambios fueron revertidos');
    }
    
    throw new Error(error.response?.data?.message || 'Error al importar archivo XML');
  }
};

// Función auxiliar para leer archivo como texto
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error('Error al leer el archivo: ' + error));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};
