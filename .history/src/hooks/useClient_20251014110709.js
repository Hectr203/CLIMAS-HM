import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import clientService from '../services/clientService';

const useClient = () => {
  const { showOperationSuccess, showHttpError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState([]);

  // ✅ Obtener clientes
  const getClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.getClients();
      const data = response?.data;

      if (Array.isArray(data)) {
        setClients(data);
      } else if (Array.isArray(data?.data)) {
        setClients(data.data);
      } else {
        setClients([]);
      }

      return data;
    } catch (err) {
      setError(err);
      setClients([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Crear cliente
  const createClient = async (clientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await clientService.createClient(clientData);
      const data = response?.data;

      // Aquí validamos correctamente el formato esperado
      if (data?.success && data?.data) {
        setClients((prev) => [...prev, data.data]); // Agrega nuevo cliente al estado
        setSuccess(true);
        showOperationSuccess('Cliente guardado exitosamente');
      } else {
        showHttpError('No se pudo crear el cliente correctamente');
      }

      return data;
    } catch (err) {
      console.error('Error al crear cliente:', err);
      setError(err);
      setSuccess(false);
      showHttpError('Error al guardar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Editar cliente
  const editClient = async (id, clientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await clientService.updateClient(id, clientData);
      const data = response?.data;

      if (data?.success) {
        const updatedClient = data?.data || clientData;

        setClients((prev) =>
          prev.map((c) =>
            c.id === id || c._id === id ? { ...c, ...updatedClient } : c
          )
        );

        setSuccess(true);
        showOperationSuccess('Cliente actualizado exitosamente');
      } else {
        showHttpError('No se pudo actualizar el cliente correctamente');
      }

      return data;
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
      setError(err);
      setSuccess(false);
      showHttpError('Error al actualizar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    getClients,
    createClient,
    editClient,
    loading,
    error,
    success,
    setClients,
  };
};

export default useClient;
