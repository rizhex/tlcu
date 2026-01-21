import { useState, useCallback } from 'react';
import * as userService from '../services/userService'; // Ajusta la ruta según tu estructura

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const fetchData = useCallback(async (page = 1, query = '') => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (query) {
        response = await userService.searchUsers(query, page);
      } else {
        response = await userService.getUsers(page, 10);
      }
      
      console.log('📦 Respuesta de usuarios:', response);
      
      // Ajusta según la estructura de tu respuesta
      if (response.items) {
        setUsers(response.items);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalItems(response.meta?.totalItems || 0);
      } else if (Array.isArray(response)) {
        setUsers(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else {
        // Otra estructura posible
        setUsers(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.total || 0);
      }
      
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
      console.error('Error en fetchData:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (userData) => {
    try {
      setLoading(true);
      const response = await userService.createUser(userData);
      
      await fetchData(currentPage, searchText);
      setShowEditForm(false);
      setCurrentUser(null);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.message || 'Error al crear usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, userData) => {
    try {
      setLoading(true);
      // Si no hay password, eliminarlo del request
      if (!userData.password) {
        delete userData.password;
      }
      
      const response = await userService.updateUser(id, userData);
      
      await fetchData(currentPage, searchText);
      setShowEditForm(false);
      setCurrentUser(null);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      await userService.deleteUser(id);
      
      await fetchData(currentPage, searchText);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const submit = async (formData) => {
    if (currentUser?.id) {
      return await update(currentUser.id, formData);
    } else {
      return await create(formData);
    }
  };

  // Opcional: activar/desactivar si los tienes
  const activate = async (id) => {
    try {
      setLoading(true);
      await userService.activateUser(id);
      await fetchData(currentPage, searchText);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Error al activar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async (id) => {
    try {
      setLoading(true);
      await userService.deactivateUser(id);
      await fetchData(currentPage, searchText);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Error al desactivar usuario';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    currentUser,
    setCurrentUser,
    selectedUser,
    setSelectedUser,
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
    activate,
    deactivate
  };
};