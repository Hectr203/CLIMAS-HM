// hooks/useFinanzas.js
import { useState } from 'react';
import finanzasService from '../services/finanzasService';

// Util: toma data de {success, data} o del objeto plano
const unwrap = (resp) => (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp);
// Util: id seguro (id o _id)
const getId = (o) => (o && (o.id ?? o._id));

const useFinanzas = () => {
  const [finanzas, setFinanzas] = useState([]); // Puedes renombrar a "gastos" si gustas; mantengo "finanzas" por compatibilidad
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los gastos
  const getGastos = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await finanzasService.getGastos();
      const list = unwrap(resp);
      if (Array.isArray(list)) {
        setFinanzas(list);
      } else {
        setFinanzas([]);
      }
      return list ?? [];
    } catch (err) {
      console.error('Error en useFinanzas.getGastos:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un gasto por ID
  const getGastoById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await finanzasService.getGastoById(id);
      const item = unwrap(resp);
      return item;
    } catch (err) {
      console.error('Error en useFinanzas.getGastoById:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo gasto
  const createGasto = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await finanzasService.createGasto(payload);
      const created = unwrap(resp);
      if (created) {
        setFinanzas((prev) => [...prev, created]);
      }
      return created;
    } catch (err) {
      console.error('Error en useFinanzas.createGasto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un gasto existente
  const updateGasto = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await finanzasService.updateGasto(id, payload);
      const updated = unwrap(resp);
      const targetId = id ?? getId(updated);

      if (targetId !== undefined) {
        setFinanzas((prev) =>
          prev.map((f) => (getId(f) === targetId ? { ...f, ...updated } : f))
        );
      }
      return updated;
    } catch (err) {
      console.error('Error en useFinanzas.updateGasto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un gasto
  const deleteGasto = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await finanzasService.deleteGasto(id);
      // Si tu API devuelve { success: true } o el item borrado, igual filtramos localmente
      setFinanzas((prev) => prev.filter((f) => getId(f) !== id));
      return unwrap(resp) ?? true;
    } catch (err) {
      console.error('Error en useFinanzas.deleteGasto:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    finanzas,  // lista local (gastos)
    loading,
    error,
    // Métodos alineados al service:
    getGastos,
    getGastoById,
    createGasto,
    updateGasto,
    deleteGasto,
  };
};

export default useFinanzas;
