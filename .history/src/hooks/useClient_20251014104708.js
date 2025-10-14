import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import clientService from '../services/clientService';

const useClient = () => {
  const { showOperationSuccess, showHttpError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
      // No mostrar notificación, solo actualizar el estado de error
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await clientService.createClient(clientData);
      setSuccess(true);
      if (response && response.success && response.data) {
        setClients(prevClients => [...prevClients, response.data]);
        showOperationSuccess('Cliente guardado exitosamente');
      }
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      showHttpError('Error al guardar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editClient = async (id, clientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await clientService.updateClient(id, clientData);
      setSuccess(true);
      if (response && response.success && response.data) {
        setClients(prevClients => prevClients.map(c =>
          (c.id === id || c._id === id)
            ? { ...c, ...response.data, id: c.id || c._id }
            : c
        ));
        showOperationSuccess('Cliente actualizado exitosamente');
      } else if (response && response.success) {
        setClients(prevClients => prevClients.map(c =>
          (c.id === id || c._id === id)
            ? { ...c, ...clientData, id: c.id || c._id }
            : c
        ));
        showOperationSuccess('Cliente actualizado exitosamente');
      }
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      showHttpError('Error al actualizar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { clients, getClients, createClient, editClient, loading, error, success, setClients };
};

export default useClient;
