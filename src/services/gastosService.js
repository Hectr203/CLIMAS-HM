// services/gastosService.js
import httpService from "./httpService";

const gastosService = {
  async getGastos() {
    try {
      const response = await httpService.get("/ordenCompra/todas");
      // Devuelve directamente el array de órdenes si viene en data.items
      if (response?.data?.items) {
        return response.data.items;
      }
      // Si la respuesta ya es un array o tiene otro formato
      return response.data || response;
    } catch (error) {
      console.error("Error al obtener órdenes de compra:", error);
      throw error;
    }
  },
  async updateGastos(id, payload) {
          try {
              const data = await httpService.put(`/ordenCompra/editar/${id}`, payload);
              return data;
          } catch (error) {
              console.error(`Error al actualizar la orden de compra con ID ${id}:`, error);
              throw error;
          }
      },
  
};

export default gastosService;
