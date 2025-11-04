import { useState, useCallback, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import clientService from '../services/clientService';

const useClient = () => {
  const { showOperationSuccess, showHttpError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState([]);
  const loadingRef = useRef(false); // Ref para evitar llamadas concurrentes
  const hasLoadedRef = useRef(false); // Ref para rastrear si ya se cargaron los clientes
  const clientsRef = useRef([]); // Ref para acceder a los clientes sin dependencias

  const getClients = useCallback(async (force = false) => {
    // Si ya hay clientes cargados y no se fuerza, no hacer la petición
    if (!force && hasLoadedRef.current && !loadingRef.current) {
      return clientsRef.current;
    }

    // Si ya hay una petición en curso, no hacer otra
    if (loadingRef.current) {
      return clientsRef.current;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.getClients();
      const clientsData = Array.isArray(response) ? response : response?.data || [];
      setClients(clientsData);
      clientsRef.current = clientsData; // Actualizar el ref
      hasLoadedRef.current = true; // Marcar como cargado
      console.log('Clientes cargados:', clientsData);
      return response;
    } catch (err) {
      setError(err);
      setClients([]);
      clientsRef.current = []; // Resetear el ref
      hasLoadedRef.current = false; // Resetear el flag en caso de error
      // No mostrar notificación, solo actualizar el estado de error
      return null;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // Sin dependencias para que la función sea estable

  const createClient = useCallback(async (clientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await clientService.createClient(clientData);
      setSuccess(true);
      if (response && response.success && response.data) {
        setClients(prevClients => {
          const newClients = [...prevClients, response.data];
          clientsRef.current = newClients; // Actualizar el ref
          return newClients;
        });
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
  }, [showOperationSuccess, showHttpError]);

  const editClient = useCallback(async (id, clientData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await clientService.updateClient(id, clientData);
      setSuccess(true);
      if (response && response.success && response.data) {
        setClients(prevClients => {
          const newClients = prevClients.map(c =>
            (c.id === id || c._id === id)
              ? { ...c, ...response.data, id: c.id || c._id }
              : c
          );
          clientsRef.current = newClients; // Actualizar el ref
          return newClients;
        });
        showOperationSuccess('Cliente actualizado exitosamente');
      } else if (response && response.success) {
        setClients(prevClients => {
          const newClients = prevClients.map(c =>
            (c.id === id || c._id === id)
              ? { ...c, ...clientData, id: c.id || c._id }
              : c
          );
          clientsRef.current = newClients; // Actualizar el ref
          return newClients;
        });
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
  }, [showOperationSuccess, showHttpError]);

  return { clients, getClients, createClient, editClient, loading, error, success, setClients };
};

export default useClient;
