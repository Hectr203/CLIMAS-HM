import httpService from './httpService';

const personService = {
  // Crear empleado
  async createPerson(data) {
    const response = await httpService.post('/empleados/crear', data);
    return response;
  },

  // Obtener lista de empleados
  async getPeople() {
    const response = await httpService.get('/empleados');
    return response;
  },

  // Actualizar empleado por id
  async updatePerson(id, data) {
    const response = await httpService.put(`/empleados/${id}`, data);
    return response;
  }
};

export default personService;
