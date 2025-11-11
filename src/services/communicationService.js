// src/services/communicationService.js
import httpService from './httpService';

const communicationService = {
  async getComunicacionByCotizacionId(cotizacionId) {
    // GET al endpoint comunicaciones/cotizacion/{cotizacionId}
    const response = await httpService.get(`/comunicaciones/cotizacion/${cotizacionId}`);
    return response;
  },
  async createCommunication(data) {
    // POST al endpoint comunicacion/crear (para oportunidades)
    const response = await httpService.post('/comunicacion/crear', data);
    return response;
  },

  async createCotizacionCommunication(data) {
    // POST al endpoint comunicacion/cotizacion/crear (para cotizaciones)
    const response = await httpService.post('/comunicacion/cotizacion/crear', data);
    return response;
  },

  async getComunicacionesByCliente(clienteId) {
    // GET al endpoint comunicaciones/cliente/{clienteId}
    const response = await httpService.get(`/comunicaciones/cliente/${clienteId}`);
    return response;
  },
};

export default communicationService;
