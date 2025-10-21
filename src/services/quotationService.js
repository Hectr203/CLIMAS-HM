// quotationService.js
import httpService from "./httpService";

const quotationService = {
  async createQuotation(data) {
    try {
      const response = await httpService.post("cotizacion/crear", data);
      return response.data;
    } catch (error) {
      console.error("Error creating quotation:", error);
      throw error;
    }
  },

  async getCotizaciones() {
    try {
      const response = await httpService.get("cotizaciones");
      return response;
    } catch (error) {
      console.error("Error obteniendo cotizaciones:", error);
      throw error;
    }
  },

    async getCotizacionById(id) {
      try {
        const response = await httpService.get(`cotizacion/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error obteniendo cotización por ID:", error);
        throw error;
      }
    },

    async editCotizacion(id, data) {
      try {
        const response = await httpService.put(`cotizacion/${id}`, data);
        return response.data;
      } catch (error) {
        console.error("Error editando cotización:", error);
        throw error;
      }
    },
};

export default quotationService;
