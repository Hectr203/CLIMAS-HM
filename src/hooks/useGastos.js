import { useCallback } from "react";
import { useNotifications } from "../context/NotificationContext";
import gastosService from "../services/gastosService";

const useGastos = () => {
  const { showSuccess, showError } = useNotifications();

  // Obtener lista de gastos
  const getGastos = useCallback(async () => {
    try {
      return await gastosService.getGastos();
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
      showError("Error al obtener la lista de gastos.");
      throw error;
    }
  }, [showError]);

  // Actualizar un gasto
  const updateGasto = useCallback(async (id, payload) => {
    try {
      const response = await gastosService.updateGastos(id, payload);
      showSuccess("Orden de compra aprobada correctamente");
      return response;
    } catch (error) {
      console.error(`Error al actualizar el gasto con ID ${id}:`, error);
      showError("Error al actualizar el gasto.");
      throw error;
    }
  }, [showSuccess, showError]);

  // Autorizar o rechazar gasto
  const approveGasto = useCallback(async (id, payload) => {
    try {
      const response = await gastosService.approveGasto(id, payload);

      if (payload.decision === "rejected") {
        showSuccess("Orden de compra rechazada correctamente");
      } else {
        showSuccess("Orden de compra autorizada correctamente");
      }

      return response;
    } catch (error) {
      console.error(`Error al procesar el gasto con ID ${id}:`, error);
      showError("Error al procesar la orden de compra.");
      throw error;
    }
  }, [showSuccess, showError]);

  return { getGastos, updateGasto, approveGasto };
};

export default useGastos;
