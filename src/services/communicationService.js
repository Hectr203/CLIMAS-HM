// src/services/communicationService.js
import httpService from "./httpService";

const communicationService = {
  async getComunicacionByCotizacionId(cotizacionId) {
    // GET al endpoint comunicaciones/cotizacion/{cotizacionId}
    const response = await httpService.get(
      `/comunicaciones/cotizacion/${cotizacionId}`
    );
    return response;
  },
  async createCommunication(data) {
    // POST al endpoint comunicacion/crear (para oportunidades)
    const response = await httpService.post("/comunicacion/crear", data);
    return response;
  },

  async createCotizacionCommunication(data) {
    // POST al endpoint comunicacion/cotizacion/crear (para cotizaciones)
    const response = await httpService.post(
      "/comunicacion/cotizacion/crear",
      data
    );
    return response;
  },

  async getComunicacionesByCliente(clienteId) {
    // GET al endpoint comunicaciones/cliente/{clienteId}
    // Suprimir errores 404 (es normal que no haya comunicaciones al inicio)
    try {
      const response = await httpService.get(
        `/comunicaciones/cliente/${clienteId}`,
        {
          validateStatus: (status) => status === 200 || status === 404,
        }
      );
      return response;
    } catch (error) {
      // Si falla por cualquier razón, retornar vacío
      return { data: { comunicaciones: [] } };
    }
  },

  async getComunicacionesByOportunidad(oportunidadId) {
    // GET al endpoint comunicaciones/oportunidad/{oportunidadId}
    try {
      const response = await httpService.get(
        `/comunicaciones/oportunidad/${oportunidadId}`,
        {
          validateStatus: (status) => status === 200 || status === 404,
        }
      );
      return response;
    } catch (error) {
      // Si falla por cualquier razón, retornar vacío
      return { data: { comunicaciones: [] } };
    }
  },
};

export default communicationService;
