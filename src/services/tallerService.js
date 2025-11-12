import httpService from "./httpService";

const tallerService = {
  // list talleres with optional filters
  async getWorkOrders(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString();
      const url = query ? `/talleres?${query}` : "/talleres";

      const response = await httpService.get(url);
      return response; // { success, data, message }
    } catch (error) {
      console.error("Error al obtener talleres:", error);
      throw error;
    }
  },

  async getWorkOrderById(id) {
    try {
      const response = await httpService.get(`/taller/${id}`);
      return response;
    } catch (error) {
      console.error("Error al obtener taller por id:", error);
      throw error;
    }
  },

  async createWorkOrder(payload) {
    try {
      const response = await httpService.post("/taller/crear", payload);
      return response;
    } catch (error) {
      console.error("Error al crear taller:", error);
      throw error;
    }
  },

  async updateWorkOrder(id, payload) {
    try {
      // support PUT (or PATCH) via the same endpoint - prefer PUT
      const response = await httpService.put(`/taller/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Error al actualizar taller:", error);
      throw error;
    }
  },

  async deleteWorkOrder(id) {
    try {
      const response = await httpService.delete(`/taller/${id}`);
      return response; // { success, data, message }
    } catch (error) {
      console.error("Error al eliminar taller:", error);
      throw error;
    }
  },
};

export default tallerService;
