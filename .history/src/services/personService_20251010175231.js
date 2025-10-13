// src/services/personService.js
import httpService from './httpService';

const personService = {
  async createPerson(data) {
    // POST para crear empleado
    const response = await httpService.post('/empleados/crear', data);
    return response;
  },

  async getPersons() {
    // GET para listar empleados
    const response = await httpService.get('/empleados');
    return response;
  },

  async updatePerson(id, data) {
    // PUT para editar empleado por id
    const response = await httpService.put(`/empleados/${id}`, data);
    return response;
  }
};

export default personService;
