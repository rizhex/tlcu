import api from './api';

// Entradas por diccionario
export const getEntriesByDictionary = async (dictionaryId, page = 1, limit = 50, search = '') => {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    
    const response = await api.get(`/entries/dictionary/${dictionaryId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener entradas del diccionario ${dictionaryId}:`, error);
    throw error;
  }
};

// Búsqueda en diccionario específico
export const searchEntriesInDictionary = async (dictionaryId, query, page = 1) => {
  try {
    const params = { page };
    const response = await api.get(`/entries/search/dictionary/${dictionaryId}?query=${encodeURIComponent(query)}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error al buscar entradas en diccionario ${dictionaryId}:`, error);
    throw error;
  }
};

// Obtener entrada específica
export const getEntry = async (id) => {
  try {
    const response = await api.get(`/entries/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener entrada ${id}:`, error);
    throw error;
  }
};

// Crear entrada
export const createEntry = async (entryData) => {
  try {
    // Asegurar que definitions sea un array
    const dataToSend = {
      ...entryData,
      definitions: entryData.definitions || []
    };
    
    console.log('📤 Creando entrada:', dataToSend);
    const response = await api.post('/entries', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error al crear entrada:', error);
    throw error;
  }
};

// Actualizar entrada
export const updateEntry = async (id, entryData) => {
  try {
    const dataToSend = {
      ...entryData,
      definitions: entryData.definitions || []
    };
    
    console.log('📤 Actualizando entrada:', dataToSend);
    const response = await api.put(`/entries/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar entrada ${id}:`, error);
    throw error;
  }
};

// Eliminar entrada
export const deleteEntry = async (id) => {
  try {
    const response = await api.delete(`/entries/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar entrada ${id}:`, error);
    throw error;
  }
};