// src/services/personService.js
import httpService from "./httpService";

const personService = {
  async createPerson(data) {
    const response = await httpService.post("/empleados/crear", data);
    return response;
  },

  async getPersons() {
    const response = await httpService.get("/empleados");
    return response;
  },

  async updatePerson(id, data) {
    const response = await httpService.put(`/empleados/${id}`, data);
    return response;
  },
};

export default personService;
