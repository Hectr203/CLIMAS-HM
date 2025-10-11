import httpService from './httpService';

const personService = {
  // Crear nuevo empleado
  async createPerson(data) {
    const response = await httpService.post('/empleados/crear', data);
    return response;
  },

  // Obtener todos los empleados
  async getPersons() {
    const response = await httpService.get('/empleados');
    return response;
  },

  // Editar empleado existente
  async updatePerson(id, data) {
    const response = await httpService.put(`/empleados/${id}`, data);
    return response;
  },

  // (Opcional) Eliminar empleado
  async deletePerson(id) {
    const response = await httpService.delete(`/empleados/${id}`);
    return response;
  }
};

export default personService;
