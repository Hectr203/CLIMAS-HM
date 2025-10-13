import httpService from "./httpService";

const personService = {
  async createPerson(data) {
    // Solo usamos ruta relativa
    const response = await httpService.post("/api/empleados/crear", data);
    return response;
  },

  async getPersons() {
    const response = await httpService.get("/api/empleados");
    return response;
  },

  async updatePerson(id, data) {
    const response = await httpService.put(`/api/empleados/${id}`, data);
    return response;
  },
};

export default personService;
