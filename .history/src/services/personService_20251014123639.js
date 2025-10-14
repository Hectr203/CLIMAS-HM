import httpService from "./httpService";

const personService = {
  async getPersons() {
    try {
      const response = await httpService.get("/empleados");
      return response;
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      throw error;
    }
  },

  async createPerson(payload) {
    try {
      const response = await httpService.post("/empleados/crear", payload);
      return response;
    } catch (error) {
      console.error("Error al crear empleado:", error);
      throw error;
    }
  },

  async getPersonsByDepartment(department) {
    try {
      const response = await httpService.get(
        `/obtenerEmpleadosPorDepartamentos?departamentos=${encodeURIComponent(
          department
        )}`
      );
      return response;
    } catch (error) {
      console.error("Error al obtener empleados por departamento:", error);
      throw error;
    }
  },

  // ✅ Actualiza empleado usando su "id" real de Cosmos
  async updatePersonById(id, payload) {
    try {
      const response = await httpService.put(
        `/empleados/actualizar/${id}`,
        payload
      );
      return response;
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      throw error;
    }
  },
};

export default personService;
