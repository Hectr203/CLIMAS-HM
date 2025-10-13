import httpService from './httpService';

const personService = {
  async getPersons() {
    try {
      const response = await httpService.get('/empleados');
      return response;
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      throw error;
    }
  },

  async createPerson(payload) {
    try {
      const response = await httpService.post('/empleados/crear', payload);
      return response;
    } catch (error) {
      console.error(" Error al crear empleado:", error);
      throw error;
    }
  },
};

export default personService;
