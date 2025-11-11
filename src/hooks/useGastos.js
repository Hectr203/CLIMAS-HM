// hooks/useGastos.js
import { useCallback } from "react";
import { useNotifications } from "../context/NotificationContext";
import gastosService from "../services/gastosService";

const useGastos = () => {
  const { showSuccess, showError } = useNotifications(); 

  const getGastos = useCallback(async () => {
    try {
      return await gastosService.getGastos();
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
      showError("Error al obtener la lista de gastos.");
      throw error;
    }
  }, [showError]);

  const updateGasto = useCallback(async (id, payload) => {
    try {
      const response = await gastosService.updateGastos(id, payload);
      showSuccess("El gasto se actualizó correctamente");
      return response;
    } catch (error) {
      console.error(`Error al actualizar el gasto con ID ${id}:`, error);
      showError("Error al actualizar el gasto.");
      throw error;
    }
  }, [showSuccess, showError]);

  const approveGasto = useCallback(async (id, payload) => {
    try {
      const response = await gastosService.approveGasto(id, payload);
      showSuccess("Orden de compra autorizada correctamente");
      return response;
    } catch (error) {
      console.error(`Error al aprobar el gasto con ID ${id}:`, error);
      showError("Error al autorizar la orden de compra.");
      throw error;
    }
  }, [showSuccess, showError]);

  return { getGastos, updateGasto, approveGasto };
};

export default useGastos;
