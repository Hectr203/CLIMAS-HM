import httpService from "./httpService";

const requisiService = {
  async getRequisitions(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString();
      const url = query ? `/requisiciones?${query}` : "/requisiciones";

      const response = await httpService.get(url);
      return response;
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

  async deleteRequisition(id) {
    try {
      const response = await httpService.delete(`/requisiciones/${id}`);
      return response;
    } catch (error) {
      console.error("Error al eliminar requisición:", error);
      throw error;
    }
  }
};

export default requisiService;
