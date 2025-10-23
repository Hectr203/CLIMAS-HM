import httpService from './httpService';

const inventarioService = {
  async getInventario() {
    // GET para obtener la lista completa del inventario
    const response = await httpService.get('/articulo/todos');
    return response;
  },
};

export default inventarioService;
