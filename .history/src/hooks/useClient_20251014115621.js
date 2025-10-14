import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import clientService from '../services/clientService';

const useClient = () => {
  const { showOperationSuccess, showHttpError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);

  const getClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.getClients();
      setClients(Array.isArray(response) ? response : response?.data || []);
      return response;
    } catch (err) {
      setError(err);
      setClients([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.createClient(clientData);
      if (response?.success && response?.data) {
        setClients(prev => [...prev, response.data]);
        showOperationSuccess('Cliente guardado exitosamente');
      }
      return response;
    } catch (err) {
      setError(err);
      showHttpError('Error al guardar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editClient = async (id, clientData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.updateClient(id, clientData);
      if (response?.success && response?.data) {
        setClients(prev => prev.map(c =>
          (c.id === id || c._id === id)
            ? { ...c, ...response.data, id: c.id || c._id }
            : c
        ));
        showOperationSuccess('Cliente actualizado exitosamente');
      } else if (response?.success) {
        // En caso de que no venga data, usamos clientData directamente
        setClients(prev => prev.map(c =>
          (c.id === id || c._id === id)
            ? { ...c, ...clientData, id: c.id || c._id }
            : c
        ));
        showOperationSuccess('Cliente actualizado exitosamente');
      }
      return response;
    } catch (err) {
      setError(err);
      showHttpError('Error al actualizar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { clients, getClients, createClient, editClient, loading, error, setClients };
};

export default useClient;
