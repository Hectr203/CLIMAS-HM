import httpService from './httpService';

const API_BASE = '/oportunidades';

const opportunityService = {
  crearOportunidad: async (data) => {
    return httpService.post(`${API_BASE}/crear`, data);
  },
  obtenerTodasLasOportunidades: async () => {
    return httpService.get(`${API_BASE}/obtenerTodasLasOportunidades`);
  },
  obtenerOportunidadPorId: async (id) => {
    return httpService.get(`${API_BASE}/obtenerOportunidades/${id}`);
  },
  actualizarOportunidad: async (id, data) => {
    return httpService.put(`${API_BASE}/actualizar/${id}`, data);
  }
};

export default opportunityService;
