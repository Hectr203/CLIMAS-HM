// hooks/useProyecto.js
import { useState, useCallback, useRef } from 'react';
import proyectoService from '../services/proyectoService';

// Helper: intenta extraer arreglo sin importar el formato del backend
const extractList = (resp) => {
  if (Array.isArray(resp)) return resp;
  if (resp?.success && Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.data?.items)) return resp.data.items;
  if (Array.isArray(resp?.result)) return resp.result;
  return [];
};

const unwrap = (resp) => (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp);

const useProyecto = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchedOnceRef = useRef(false);

  /**
   * Obtener todos los proyectos con:
   * - memoización (useCallback)
   * - caché (no vuelve a pegarle a la red salvo force=true)
   * - cancelación (AbortController -> { signal })
   */
  const getProyectos = useCallback(async ({ force = false, signal } = {}) => {
    if (!force && fetchedOnceRef.current && proyectos.length > 0) {
      // Devolver caché sin tocar loading para evitar “parpadeos”
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
  }, [proyectos]);

  // Obtener un proyecto por ID (memoizado)
  const getProyectoById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.getProyectoById(id);
      return unwrap(resp);
    } catch (err) {
      console.error('Error en useProyecto.getProyectoById:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear (memoizado) — añade al estado local para que el UI refleje de inmediato
  const createProyecto = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.createProyecto(payload);
      const created = unwrap(resp);
      if (created) setProyectos((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error('Error en useProyecto.createProyecto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar (memoizado)
  const updateProyecto = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.updateProyecto(id, payload);
      const updated = unwrap(resp);
      setProyectos((prev) =>
        prev.map((p) => (String(p.id ?? p._id) === String(id) ? { ...p, ...updated } : p))
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

  // Eliminar (memoizado)
  const deleteProyecto = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await proyectoService.deleteProyecto(id);
      setProyectos((prev) => prev.filter((p) => String(p.id ?? p._id) !== String(id)));
      return unwrap(resp) ?? true;
    } catch (err) {
      console.error('Error en useProyecto.deleteProyecto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    proyectos,
    loading,
    error,
    getProyectos,      
    getProyectoById,
    createProyecto,
    updateProyecto,
    deleteProyecto,
  };
};

export default useProyecto;
