import httpService from './httpService';

const personService = {
  async createPerson(data) {
    try {
      return await httpService.post('/empleados/crear', data);
    } catch (error) {
      console.error("❌ Error al crear empleado:", error);
      throw error;
    }
  },

  async getPersons() {
    try {
      return await httpService.get('/empleados');
    } catch (error) {
      console.error("❌ Error al obtener empleados:", error);
      throw error;
    }
  },

  async updatePerson(id, data) {
    try {
      return await httpService.put(`/empleados/${id}`, data);
    } catch (error) {
      console.error("❌ Error al actualizar empleado:", error);
      throw error;
    }
  }
};

export default personService;
