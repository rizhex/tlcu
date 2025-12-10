import { useState, useCallback } from 'react';
import * as dictionaryService from '../services/dictionaryService';

export const useDictionary = () => {
  const [dictionaries, setDictionaries] = useState([]);
  const [currentDictionary, setCurrentDictionary] = useState(null);
  const [selectedDictionary, setSelectedDictionary] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const limit = 10; // Items por página

  const fetchData = useCallback(async (page = 1, search = searchText) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dictionaryService.getDictionaries(page, limit, search);
      setDictionaries(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar diccionarios');
      console.error('Error en fetchData:', err);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  const submit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (formData.id) {
        // Actualizar
        await dictionaryService.updateDictionary(formData.id, formData);
      } else {
        // Crear nuevo
        await dictionaryService.createDictionary(formData);
      }
      
      // Recargar la lista
      await fetchData(currentPage, searchText);
      setShowEditForm(false);
      setCurrentDictionary(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar diccionario');
      console.error('Error en submit:', err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este diccionario?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await dictionaryService.deleteDictionary(id);
      await fetchData(currentPage, searchText);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar diccionario');
      console.error('Error en remove:', err);
    } finally {
      setLoading(false);
    }
  };

  const importXmlFile = async (file) => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('📁 Procesando archivo para importación:', file.name);
    
    // Validar que sea archivo XML
    if (!file.name.toLowerCase().endsWith('.xml')) {
      throw new Error('El archivo debe tener extensión .xml');
    }
    
    if (file.size === 0) {
      throw new Error('El archivo está vacío');
    }
    
    // Importar archivo
    const result = await dictionaryService.importDictionaryXML(file);
    
    console.log('🎉 Importación completada:', result);
    
    // Mostrar mensaje de éxito
    alert(`Diccionario importado exitosamente!\nNombre: ${result.name}\nID: ${result.id}`);
    
    // Recargar la lista de diccionarios
    await fetchData(currentPage, searchText);
    
    return result;
  } catch (err) {
    console.error('🔥 Error en importXmlFile:', err);
    setError(err.message || 'Error al importar archivo XML');
    throw err;
  } finally {
    setLoading(false);
  }
};

  return {
    dictionaries,
    currentDictionary,
    setCurrentDictionary,
    selectedDictionary,
    setSelectedDictionary,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    loading,
    error,
    showEditForm,
    setShowEditForm,
    showDetails,
    setShowDetails,
    fetchData,
    submit,
    remove,
    importXmlFile
  };
};