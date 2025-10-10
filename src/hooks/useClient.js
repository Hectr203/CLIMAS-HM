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
      // Opcional: recargar clientes después de crear uno nuevo
      await getClients();
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
      await getClients();
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
