import httpService from "./httpService";

/**
 * Servicio para interactuar con el backend (empleados)
 * Usa httpService como wrapper de fetch/axios.
 */
const personService = {
  /** 🔹 Crear empleado */
  async createPerson(data) {
    try {
      const response = await httpService.post("/empleados/crear", data);
      return response; // Esperado: { success: true, data: {...} }
    } catch (error) {
      console.error("❌ Error en createPerson service:", error);
      throw new Error(error.message || "Error al crear empleado");
    }
  },

  /** 🔹 Obtener lista de empleados */
  async getPersons() {
    try {
      const response = await httpService.get("/empleados");
      return response; // Esperado: { success: true, data: [...] }
    } catch (error) {
      console.error("❌ Error en getPersons service:", error);
      throw new Error(error.message || "Error al obtener empleados");
    }
  },

  /** 🔹 Actualizar empleado */
  async updatePerson(id, data) {
    try {
      const response = await httpService.put(`/empleados/${id}`, data);
      return response; // Esperado: { success: true, data: {...} }
    } catch (error) {
      console.error("❌ Error en updatePerson service:", error);
      throw new Error(error.message || "Error al actualizar empleado");
    }
  },
};

export default personService;
