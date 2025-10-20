import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import operacService from "../services/operacService";

const useOperac = () => {
  const { showHttpError, showOperationSuccess } = useNotifications();
  const [oportunities, setOportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getOportunities = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operacService.getWorkOrders(filters);
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
  };

  const createWorkOrder = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operacService.createWorkOrder(payload);
      if (response.success) {
        showOperationSuccess(response.message || "Orden creada ✅");
        const newOrders = await getOportunities(); // Actualiza estado global
        const savedOrder = newOrders.find(o => o.id === response.data.id) || response.data;
        return savedOrder;
      } else {
        showHttpError(response.message || "Error desconocido al crear orden");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo crear la orden ❌");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkOrder = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operacService.updateWorkOrder(id, payload);
      if (response.success) {
        showOperationSuccess(response.message || "Orden actualizada ✅");
        // Actualiza localmente sin recargar
        setOportunities(prev => prev.map(o => o.id === id ? { ...o, ...payload } : o));
        return { ...payload, id };
      } else {
        showHttpError(response.message || "Error desconocido al actualizar orden");
        return null;
      }
    } catch (err) {
      console.error(err);
      showHttpError("No se pudo actualizar la orden ❌");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { oportunities, loading, error, getOportunities, createWorkOrder, updateWorkOrder };
};

export default useOperac;
