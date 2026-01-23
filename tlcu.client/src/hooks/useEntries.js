import { useState, useCallback } from 'react';
import * as entryService from '../services/entryService';

export const useEntries = (dictionaryId) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [searchMode, setSearchMode] = useState(false); // true = búsqueda, false = lista normal

  const limit = 50; // Por defecto del backend

  const fetchEntries = useCallback(async (page = 1, search = searchText) => {
    if (!dictionaryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (search && search.trim()) {
        // Modo búsqueda
        response = await entryService.searchEntriesInDictionary(dictionaryId, search, page);
        setSearchMode(true);
      } else {
        // Modo lista normal
        response = await entryService.getEntriesByDictionary(dictionaryId, page, limit);
        setSearchMode(false);
      }
      
      setEntries(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar entradas');
      console.error('Error en fetchEntries:', err);
    } finally {
      setLoading(false);
    }
  }, [dictionaryId, searchText]);

  const submitEntry = async (entryData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (entryData.id) {
        await entryService.updateEntry(entryData.id, entryData);
      } else {
        await entryService.createEntry({
          ...entryData,
          dictionaryId: parseInt(dictionaryId)
        });
      }
      
      await fetchEntries(currentPage, searchText);
      setShowForm(false);
      setCurrentEntry(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar entrada');
      console.error('Error en submitEntry:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeEntry = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta entrada?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await entryService.deleteEntry(id);
      await fetchEntries(currentPage, searchText);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar entrada');
      console.error('Error en removeEntry:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    fetchEntries(1, '');
  };

  return {
    entries,
    currentEntry,
    setCurrentEntry,
    selectedEntry,
    setSelectedEntry,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    loading,
    error,
    showForm,
    setShowForm,
    showDetail,
    setShowDetail,
    searchMode,
    fetchEntries,
    submitEntry,
    removeEntry,
    clearSearch
  };
};