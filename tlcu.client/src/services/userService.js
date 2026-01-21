import api from './api';

export const getUsers = async (page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const searchUsers = async (query, page = 1) => {
  try {
    const params = { query, page };
    const response = await api.get('/users/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener usuario ${id}:`, error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    console.log('📤 Enviando al backend:', JSON.stringify(userData, null, 2));
    
    const response = await api.post('/users', userData);
    console.log('✅ Usuario creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error completo:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message
    });
    
    if (error.response?.status === 409) {
      throw new Error(error.response?.data?.message || 'Ya existe un usuario con ese nombre o email');
    }
    throw new Error(error.response?.data?.message || 'Error al crear usuario');
  }
};

export const updateUser = async (id, userData) => {
  try {
    console.log('📤 Actualizando usuario:', userData);
    
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar usuario ${id}:`, error);
    
    if (error.response?.status === 409) {
      throw new Error(error.response?.data?.message || 'Ya existe un usuario con ese nombre o email');
    }
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar usuario ${id}:`, error);
    throw error;
  }
};

export const activateUser = async (id) => {
  try {
    const response = await api.put(`/users/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error(`Error al activar usuario ${id}:`, error);
    throw error;
  }
};

export const deactivateUser = async (id) => {
  try {
    const response = await api.put(`/users/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar usuario ${id}:`, error);
    throw error;
  }
};