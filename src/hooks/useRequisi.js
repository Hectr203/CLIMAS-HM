import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import requisiService from "../services/requisiService";

const useRequisi = () => {
  const { showHttpError, showOperationSuccess } = useNotifications();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRequisitions = async (filters = {}) => {
    if (loading) return []; // Evitar múltiples llamadas simultáneas
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await requisiService.getRequisitions(filters);
      
      // Siempre debería ser un objeto con {success, data, message}
      if (response?.success) {
        const requisitionData = Array.isArray(response.data) ? response.data : [];
        setRequisitions(requisitionData);
        return requisitionData;
      } else {
        console.warn('Respuesta inesperada de requisiciones:', response);
        setRequisitions([]);
        return [];
      }
    } catch (err) {
      console.error('Error en getRequisitions:', err);
      setError(err);
      
      // No mostrar error si la petición fue cancelada
      if (err.message !== 'canceled' && !err.isNetworkError) {
        showHttpError("Error al cargar requisiciones");
      }
      
      setRequisitions([]);
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
        showOperationSuccess(response.message || "Requisición creada");
        setRequisitions((prev) => [...prev, response.data]); // ← Agregamos sin recargar todo
        return response.data;
      } else {
        showHttpError(response.message || "Error desconocido al crear requisición");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo crear la requisición");
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
        showOperationSuccess(response.message || "Requisición actualizada");
        // ✅ Usar la data de la respuesta del backend, no el payload
        const updatedRequisition = response.data || { ...payload, id };
        setRequisitions(prev => prev.map(r => r.id === id ? updatedRequisition : r));
        return updatedRequisition;
      } else {
        showHttpError(response.message || "Error desconocido al actualizar requisición");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo actualizar la requisición");
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
      showOperationSuccess(response.message || "Requisición eliminada");
      setRequisitions(prev => prev.filter(r => r.id !== id));
      return true;
    } else {
      showHttpError(response.message || "No se pudo eliminar");
      return false;
    }
  } catch (err) {
    console.error(err);
    showHttpError("Error al eliminar la requisición");
    setError(err);
    return false;
  } finally {
    setLoading(false);
  }
};

  const getRequisitionById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await requisiService.getRequisitionById(id);
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error en getRequisitionById:', err);
      setError(err);
      showHttpError("Error al cargar la requisición");
      setLoading(false);
      return null;
    }
  };



  return { requisitions, loading, error, getRequisitions, createRequisition, updateRequisition, deleteRequisition, getRequisitionById };
};

export default useRequisi;
