import httpService from "./httpService";

const requisiService = {
  // ✅ Obtener requisiciones con filtros dinámicos
  async getRequisitions(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString();
      const url = query ? `/requisiciones?${query}` : "/requisiciones";

      const response = await httpService.get(url);
      return response; // { success, data, message }
    } catch (error) {
      console.error("Error al obtener requisiciones:", error);
      throw error;
    }
  },

  async createRequisition(payload) {
    try {
      const response = await httpService.post("/requisiciones/crear", payload);
      return response;
    } catch (error) {
      console.error("Error al crear requisición:", error);
      throw error;
    }
  },

  async updateRequisition(id, payload) {
    try {
      const response = await httpService.put(`/requisiciones/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Error al actualizar requisición:", error);
      throw error;
    }
  },
};

export default requisiService;
