// services/finanzasService.js
import httpService from './httpService';

const finanzasService = {
  async getGastos() {
    try {
      const data = await httpService.get('/gastos');
      return data;
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      throw error;
    }
  },

  async getGastoById(id) {
    try {
      const data = await httpService.get(`/gastos/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener el gasto con ID ${id}:`, error);
      throw error;
    }
  },

  async createGasto(payload) {
    try {
      const data = await httpService.post('/gastos/crear', payload);
      return data;
    } catch (error) {
      console.error('Error al crear gasto:', error);
      throw error;
    }
  },

  async updateGasto(id, payload) {
    try {
      const data = await httpService.put(`/gastos/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Error al actualizar el gasto con ID ${id}:`, error);
      throw error;
    }
  },

  async deleteGasto(id) {
    try {
      const data = await httpService.delete(`/gastos/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al eliminar el gasto con ID ${id}:`, error);
      throw error;
    }
  },
};

export default finanzasService;
