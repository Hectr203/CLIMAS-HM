// src/services/personService.js
import httpService from './httpService';

const personService = {
  async createPerson(data) {
    try {
      const response = await httpService.post('/empleados/crear', data);
      return response?.data;
    } catch (error) {
      console.error("❌ Error al crear empleado:", error);
      throw error;
    }
  },

  async getPersons() {
    try {
      const response = await httpService.get('/empleados');
      return response?.data;
    } catch (error) {
      console.error("❌ Error al obtener empleados:", error);
      throw error;
    }
  },

  async updatePerson(id, data) {
    try {
      const response = await httpService.put(`/empleados/${id}`, data);
      return response?.data;
    } catch (error) {
      console.error("❌ Error al actualizar empleado:", error);
      throw error;
    }
  }
};

export default personService;
