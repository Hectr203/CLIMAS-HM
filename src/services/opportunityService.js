import httpService from './httpService';

const API_BASE = '/oportunidades';

const opportunityService = {
  crearOportunidad: async (data) => {
    return httpService.post(`${API_BASE}/crear`, data);
  },
  obtenerTodasLasOportunidades: async () => {
    return httpService.get(`${API_BASE}/obtenerTodasLasOportunidades`);
  }
};

export default opportunityService;
