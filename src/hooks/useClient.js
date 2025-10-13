import { useState } from 'react';
import clientService from '../services/clientService';

const useClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState([]);

  const getClients = async () => {
    setLoading(true);
    setError(null);
    try {
  const response = await clientService.getClients();
  console.log('Respuesta del backend (clientes):', response);
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
    setSuccess(false);
    try {
      const response = await clientService.createClient(clientData);
      setSuccess(true);
      // Agrega el nuevo cliente al estado local sin refrescar toda la lista
      if (response && response.success && response.data) {
        setClients(prevClients => [...prevClients, response.data]);
      }
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
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
      // Si el backend devuelve el cliente actualizado, úsalo para actualizar el estado local
      if (response && response.success && response.data) {
        setClients(prevClients => prevClients.map(c =>
          (c.id === id || c._id === id)
            ? { ...c, ...response.data, id: c.id || c._id }
            : c
        ));
      } else if (response && response.success) {
        setClients(prevClients => prevClients.map(c =>
          (c.id === id || c._id === id)
            ? { ...c, ...clientData, id: c.id || c._id }
            : c
        ));
      }
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { clients, getClients, createClient, editClient, loading, error, success, setClients };
};

export default useClient;
