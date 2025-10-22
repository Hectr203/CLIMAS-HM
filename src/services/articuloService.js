// services/articuloService.js
import httpService from "./httpService";

const articuloService = {
  async getArticulos() {
    try {
      const data = await httpService.get("/articulo/todos");
      return data;
    } catch (error) {
      console.error("Error al obtener artículos:", error);
      throw error;
    }
  },

  async getArticuloById(id) {
    try {
      const data = await httpService.get(`/articulo/buscar/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener el artículo con ID ${id}:`, error);
      throw error;
    }
  },

  async createArticulo(payload) {
    try {
      const data = await httpService.post("/articulo/crear", payload);
      return data;
    } catch (error) {
      console.error("Error al crear artículo:", error);
      throw error;
    }
  },

  async updateArticulo(id, payload) {
    try {
      const data = await httpService.put(
        `/articulo/editar/${id}`,
        payload
      );
      return data;
    } catch (error) {
      console.error(`Error al actualizar el artículo con ID ${id}:`, error);
      throw error;
    }
  },

  async deleteArticulo(id) {
    try {
      const data = await httpService.delete(`/articulo/eliminar/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al eliminar el artículo con ID ${id}:`, error);
      throw error;
    }
  },
};

export default articuloService;
