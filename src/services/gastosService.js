// services/gastosService.js
import httpService from "./httpService";

const gastosService = {
  async getGastos() {
    try {
      const response = await httpService.get("/ordenCompra/todas");
      if (response?.data?.items) {
        return response.data.items;
      }
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
      console.error(`Error al actualizar la orden con ID ${id}:`, error);
      throw error;
    }
  },

  async approveGasto(id, payload) {
    try {
      const data = await httpService.put(`/ordenCompra/aprobar/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Error al aprobar la orden con ID ${id}:`, error);
      throw error;
    }
  },
};

export default gastosService;
