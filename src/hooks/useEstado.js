import { useState, useEffect } from 'react';
import estadoService from '../services/estadoService';

export function useEstados() {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    estadoService.getEstados()
      .then(setEstados)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { estados, loading, error };
}

export function useMunicipios(estado) {
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!estado) return;
    setLoading(true);
    estadoService.getMunicipios(estado)
      .then(setMunicipios)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [estado]);

  return { municipios, loading, error };
}
