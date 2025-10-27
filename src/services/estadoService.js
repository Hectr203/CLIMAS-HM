import httpService from './httpService';

const estadoService = {
  getEstados: async () => {
    // GET estadosMexico/codigos
    const response = await httpService.get('/estadosMexico/codigos');
    return response.data;
  },
  getMunicipios: async (estado) => {
    // GET estadosMexico/{estado}
    const response = await httpService.get(`/estadosMexico/${estado}`);
    return response.data;
  },
};

export default estadoService;
