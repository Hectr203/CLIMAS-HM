// src/hooks/useCommunication.js
import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import communicationService from '../services/communicationService';

const useCommunication = () => {
  const getComunicacionByCotizacionId = async (cotizacionId) => {
  // console.log eliminado
    setLoading(true);
    setError(null);
    try {
      const response = await communicationService.getComunicacionByCotizacionId(cotizacionId);
      return response;
    } catch (err) {
      setError(err);
      showHttpError('Error al obtener comunicación por cotización');
      return null;
    } finally {
      setLoading(false);
    }
  };
  const { showOperationSuccess, showHttpError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createCommunication = async (commData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await communicationService.createCommunication(commData);
      setSuccess(true);
      showOperationSuccess('Comunicación enviada exitosamente');
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      showHttpError('Error al enviar comunicación');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCotizacionCommunication = async (commData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await communicationService.createCotizacionCommunication(commData);
      setSuccess(true);
      showOperationSuccess('Comunicación de cotización enviada exitosamente');
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      showHttpError('Error al enviar comunicación de cotización');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getComunicacionesByCliente = async (clienteId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await communicationService.getComunicacionesByCliente(clienteId);
      return response;
    } catch (err) {
      setError(err);
      showHttpError('Error al obtener historial de comunicaciones');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCommunication,
    createCotizacionCommunication,
    getComunicacionesByCliente,
    getComunicacionByCotizacionId,
    loading,
    error,
    success
  };
};

export default useCommunication;
