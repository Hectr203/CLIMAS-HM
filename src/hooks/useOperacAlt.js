import { useState, useCallback } from "react";
import { useNotifications } from "../context/NotificationContext";
import tallerService from "../services/tallerService";

const useOperacAlt = () => {
  const { showHttpError, showOperationSuccess } = useNotifications();
  const [oportunities, setOportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getOportunities = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
  const response = await tallerService.getWorkOrders(filters);
      const data = response.success && Array.isArray(response.data) ? response.data : [];
      setOportunities(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err);
      showHttpError("Error al cargar órdenes");
      return [];
    } finally {
      setLoading(false);
    }
  }, [showHttpError]);

  const createWorkOrder = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
  const response = await tallerService.createWorkOrder(payload);
      if (response.success) {
        showOperationSuccess(response.message || "Orden creada");
        const newOrders = await getOportunities();  
        const savedOrder = newOrders.find(o => o.id === response.data.id) || response.data;
        return savedOrder;
      } else {
        showHttpError(response.message || "Error desconocido al crear orden");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo crear la orden");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showOperationSuccess, showHttpError, getOportunities]);

  const updateWorkOrder = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
  const response = await tallerService.updateWorkOrder(id, payload);
      if (response.success) {
        showOperationSuccess(response.message || "Orden actualizada");
        // Actualiza localmente sin recargar
        setOportunities(prev => prev.map(o => o.id === id ? { ...o, ...payload } : o));
        return { ...payload, id };
      } else {
        showHttpError(response.message || "Error desconocido al actualizar orden");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo actualizar la orden");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showOperationSuccess, showHttpError]);

  const deleteWorkOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
  const response = await tallerService.deleteWorkOrder(id);
      if (response.success) {
        showOperationSuccess(response.message || "Orden eliminada");
        setOportunities(prev => prev.filter(o => o.id !== id));
        return true;
      } else {
        showHttpError(response.message || "Error al eliminar la orden");
        return false;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo eliminar la orden");
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [showOperationSuccess, showHttpError]);

  return { oportunities, loading, error, getOportunities, createWorkOrder, updateWorkOrder, deleteWorkOrder };
};

export default useOperacAlt;
