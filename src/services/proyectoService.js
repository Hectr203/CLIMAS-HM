// services/proyectoService.js
import httpService from './httpService';

const proyectoService = {
  async getProyectos() {
    try {
      const data = await httpService.get('/proyectos');
      return data;
    } catch (error) {
      console.error("Error al obtener proyectos:", error);
      throw error;
    }
  },

  async getProyectoById(id) {
    try {
      const data = await httpService.get(`/proyectos/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener el proyecto con ID ${id}:`, error);
      throw error;
    }
  },

  async createProyecto(payload) {
    try {
      const data = await httpService.post('/proyectos/crear', payload);
      return data;
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      throw error;
    }
  },

  async updateProyecto(id, payload) {
    try {
      const data = await httpService.put(`/proyectos/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Error al actualizar el proyecto con ID ${id}:`, error);
      throw error;
    }
  },

  async deleteProyecto(id) {
    try {
      const data = await httpService.delete(`/proyectos/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al eliminar el proyecto con ID ${id}:`, error);
      throw error;
    }
  },
};

export default proyectoService;
