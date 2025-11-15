import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import userService from '../services/userService';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      addNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createUser = async (userData) => {
    try {
      setLoading(true);
      const response = await userService.createUser(userData);
      setUsers(prev => [...prev, response.data]);
      addNotification('Usuario creado exitosamente', 'success');
      return response.data;
    } catch (err) {
      setError(err.message);
      addNotification('Error al crear usuario', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      setLoading(true);
      const response = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...response.data } : user
      ));
      addNotification('Usuario actualizado exitosamente', 'success');
      return response.data;
    } catch (err) {
      setError(err.message);
      addNotification('Error al actualizar usuario', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser
  };
};

export default useUsers;