import httpService from './httpService';


const clientService = {
  async createClient(data) {
    // POST a la ruta relativa para crear cliente
    const response = await httpService.post('/clientes/crear', data);
    return response;
  },

  async getClients() {
    // GET para obtener la lista de clientes
    const response = await httpService.get('/clientes');
    return response;
  },

  async updateClient(id, data) {
    // PUT para editar cliente por id
    const response = await httpService.put(`/clientes/${id}`, data);
    return response;
  }
};

export default clientService;
