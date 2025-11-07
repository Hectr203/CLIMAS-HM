// hooks/useGastos.js
import { useCallback } from "react";
import { useNotifications } from "../context/NotificationContext";
import gastosService from "../services/gastosService";

const useGastos = () => {
  const getGastos = useCallback(async () => {
    try {
      const data = await gastosService.getGastos();
      return data;
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
      throw error;
    }
  }, []);

  const updateGasto = useCallback(async (id, payload) => {
    try {
      const data = await gastosService.updateGastos(id, payload);
      return data;
    } catch (error) {
      console.error(`Error al actualizar el gasto con ID ${id}:`, error);
      throw error;
    }
  }, []);

  return { getGastos, updateGasto };
};

export default useGastos;
