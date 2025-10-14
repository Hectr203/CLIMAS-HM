// src/hooks/useCommunication.js
import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import communicationService from '../services/communicationService';

const useCommunication = () => {
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

  return { createCommunication, loading, error, success };
};

export default useCommunication;
