// hooks/useProyecto.js
import { useState, useCallback, useRef } from 'react';
import proyectoService from '../services/proyectoService';

const extractList = (resp) => {
  if (Array.isArray(resp)) return resp;
  if (resp?.success && Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.data?.items)) return resp.data.items;
  if (Array.isArray(resp?.result)) return resp.result;
  return [];
};

const unwrap = (resp) =>
  (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp);

const useProyecto = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchedOnceRef = useRef(false);

  // ========= PROYECTOS (tu backend) =========
  const getProyectos = useCallback(
    async ({ force = false, signal } = {}) => {
      // si ya cargaste y no fuerzas, devuelve cache
      if (!force && fetchedOnceRef.current && proyectos.length > 0) {
        return proyectos;
      }

      setLoading(true);
      setError(null);
      try {
        const resp = await proyectoService.getProyectos({ signal });
        const list = extractList(resp);
        setProyectos(list);
        fetchedOnceRef.current = true;
        return list;
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Error en useProyecto.getProyectos:', err);
          setError(err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [proyectos]
  );

  const getProyectoById = useCallback(async (id, { signal } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.getProyectoById(id, { signal });
      return unwrap(resp);
    } catch (err) {
      console.error('Error en useProyecto.getProyectoById:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProyecto = useCallback(async (payload, { signal } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.createProyecto(payload, { signal });
      const created = unwrap(resp);
      if (created) {
        setProyectos((prev) => [...prev, created]);
      }
      return created;
    } catch (err) {
      console.error('Error en useProyecto.createProyecto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProyecto = useCallback(async (id, payload, { signal } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.updateProyecto(id, payload, { signal });
      const updated = unwrap(resp);
      setProyectos((prev) =>
        prev.map((p) =>
          String(p.id ?? p._id) === String(id) ? { ...p, ...updated } : p
        )
      );
      return updated;
    } catch (err) {
      console.error('Error en useProyecto.updateProyecto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProyecto = useCallback(async (id, { signal } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.deleteProyecto(id, { signal });
      setProyectos((prev) =>
        prev.filter((p) => String(p.id ?? p._id) !== String(id))
      );
      return unwrap(resp) ?? true;
    } catch (err) {
      console.error('Error en useProyecto.deleteProyecto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========= STATS CACHED (dashboard rápido) =========
  // GET /proyectos/stats/get
  const getCachedStats = useCallback(
    async ({ signal } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await proyectoService.getCachedStats({ signal });
        // aquí NO tocamos proyectos, esto es data de métricas.
        // Puede venir como { data: {...} } o directo {...}
        return unwrap(resp);
      } catch (err) {
        console.error('Error en useProyecto.getCachedStats:', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ========= (currencyapi.com) =========
  /**
   * Trae el JSON crudo de currencyapi (data:{ MXN:{value}, ... })
   * Ej: await getCurrencyRates({ base: 'USD', currencies: ['MXN','EUR'] })
   */
  const getCurrencyRates = useCallback(
    async ({ base = 'USD', currencies = [] } = {}, { signal } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await proyectoService.getCurrencyRates(
          { base, currencies },
          { signal }
        );
        return resp; // estructura completa de la API externa
      } catch (err) {
        console.error('Error en useProyecto.getCurrencyRates:', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Devuelve { MXN: 18.2, EUR: 0.92, ... }
   */
  const getCurrencyRatesMap = useCallback(
    async ({ base = 'USD', currencies = [] } = {}, { signal } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const map = await proyectoService.getCurrencyRatesMap(
          { base, currencies },
          { signal }
        );
        return map;
      } catch (err) {
        console.error('Error en useProyecto.getCurrencyRatesMap:', err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    proyectos,
    loading,
    error,

    // acciones backend propio
    getProyectos,
    getProyectoById,
    createProyecto,
    updateProyecto,
    deleteProyecto,

    // dashboard / KPIs cacheados
    getCachedStats,

    // acciones API externa (currencyapi)
    getCurrencyRates,
    getCurrencyRatesMap,
  };
};

export default useProyecto;
