import httpService from "./httpService";

const personService = {
  async createPerson(data) {
    return await httpService.post("/empleados/crear", data);
  },

  async getPersons() {
    return await httpService.get("/empleados");
  },

  async updatePerson(id, data) {
    return await httpService.put(`/empleados/${id}`, data);
  },
};

export default personService;
