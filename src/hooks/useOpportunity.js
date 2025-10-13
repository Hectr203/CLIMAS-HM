import { useState, useEffect } from 'react';
import opportunityService from '../services/opportunityService';

export function useOpportunity() {
  const [oportunidades, setOportunidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOportunidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunityService.obtenerTodasLasOportunidades();
  setOportunidades(response.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const crearOportunidad = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunityService.crearOportunidad(data);
      await fetchOportunidades(); // Actualiza la lista después de crear
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOportunidades();
  }, []);

  return {
    oportunidades,
    loading,
    error,
    fetchOportunidades,
    crearOportunidad,
  };
}
