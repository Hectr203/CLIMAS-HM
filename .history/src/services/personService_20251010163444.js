import httpService from "./httpService";

const personService = {

  async createPerson(data) {
    return await httpService.post("/api/empleados/crear", data);
  },

  async getPersons() {
    return await httpService.get("/api/empleados");
  },

  async updatePerson(id, data) {
    return await httpService.put(`/api/empleados/${id}`, data);
  },
};
;

export default personService;
