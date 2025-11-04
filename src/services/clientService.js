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
  },

  async getClientById(id, data) {
    // get para obtener cliente por id
    const response = await httpService.get(`/clientes/${id}`, data);
    return response;
  },

  async deleteClient(id) {
    // delete para eliminar cliente por id
    const response = await httpService.delete(`/clientes/${id}`);
    return response;
  }
};

export default clientService;
