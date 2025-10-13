// src/hooks/useCommunication.js
import { useState } from 'react';
import communicationService from '../services/communicationService';

const useCommunication = () => {
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
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCommunication, loading, error, success };
};

export default useCommunication;
