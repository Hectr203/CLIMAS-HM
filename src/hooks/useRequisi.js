import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import requisiService from "../services/requisiService";

const useRequisi = () => {
  const { showHttpError, showOperationSuccess } = useNotifications();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRequisitions = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await requisiService.getRequisitions(filters);
      const data = response.success && Array.isArray(response.data) ? response.data : [];
      setRequisitions(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err);
      showHttpError("Error al cargar requisiciones");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createRequisition = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await requisiService.createRequisition(payload);
      if (response.success) {
        showOperationSuccess(response.message || "Requisición creada ✅");
        setRequisitions((prev) => [...prev, response.data]); // ← Agregamos sin recargar todo
        return response.data;
      } else {
        showHttpError(response.message || "Error desconocido al crear requisición");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo crear la requisición ❌");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRequisition = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await requisiService.updateRequisition(id, payload);
      if (response.success) {
        showOperationSuccess(response.message || "Requisición actualizada ✅");
        setRequisitions(prev => prev.map(r => r.id === id ? { ...r, ...payload } : r));
        return { ...payload, id };
      } else {
        showHttpError(response.message || "Error desconocido al actualizar requisición");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo actualizar la requisición ❌");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

const deleteRequisition = async (id) => {
  setLoading(true);
  setError(null);
  try {
    const response = await requisiService.deleteRequisition(id);
    if (response.success) {
      showOperationSuccess(response.message || "Requisición eliminada ✅");
      setRequisitions(prev => prev.filter(r => r.id !== id));
      return true;
    } else {
      showHttpError(response.message || "No se pudo eliminar ❌");
      return false;
    }
  } catch (err) {
    console.error(err);
    showHttpError("Error al eliminar la requisición ❌");
    setError(err);
    return false;
  } finally {
    setLoading(false);
  }
};



  return { requisitions, loading, error, getRequisitions, createRequisition, updateRequisition, deleteRequisition };
};

export default useRequisi;
