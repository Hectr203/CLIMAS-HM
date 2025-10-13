import httpService from './httpService';

const personService = {
  async getPersons() {
    try {
      const response = await httpService.get('/empleados');
      // Devuelve el JSON completo (con success y data)
      return response;
    } catch (error) {
      console.error("❌ Error al obtener empleados:", error);
      throw error;
    }
  },
};

export default personService;
