import httpService from "./httpService"; // Asumiendo que tienes este wrapper; si no, ver nota abajo

const personService = {
  async createPerson(data) {
    try {
      const response = await httpService.post("/empleados/crear", data);
      return response; // Asumiendo { success: true, data: { ... } }
    } catch (error) {
      console.error("Error en createPerson service:", error);
      throw new Error(error.message || "Error al crear empleado");
    }
  },

  async getPersons() {
    try {
      const response = await httpService.get("/empleados");
      return response; // Asumiendo { success: true, data: [...] }
    } catch (error) {
      console.error("Error en getPersons service:", error);
      throw new Error(error.message || "Error al obtener empleados");
    }
  },

  async updatePerson(id, data) {
    try {
      const response = await httpService.put(`/empleados/${id}`, data);
      return response; // Asumiendo { success: true, data: { ... } }
    } catch (error) {
      console.error("Error en updatePerson service:", error);
      throw new Error(error.message || "Error al actualizar empleado");
    }
  },
};

export default personService;