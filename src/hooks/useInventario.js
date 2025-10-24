import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import inventarioService from '../services/inventarioService';

const useInventario = () => {
  const { showHttpError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventario, setInventario] = useState([]);

  const getInventario = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventarioService.getInventario();
      setInventario(
  Array.isArray(response?.data?.datos)
    ? response.data.datos
    : Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : []
);

      return response;
    } catch (err) {
      setError(err);
      setInventario([]);
      showHttpError('Error al obtener el inventario');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    inventario,
    getInventario,
    loading,
    error,
    setInventario,
  };
};

export default useInventario;
