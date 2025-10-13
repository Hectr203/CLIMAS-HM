// services/proyectoService.js
import httpService from './httpService';

const BASE = 'http://localhost:7071/api/proyectos';

const proyectoService = {
  // Opcional si cuentas con listado general en tu API
  async obtenerProyectos() {
    const { data } = await httpService.get(`${BASE}`);
    return data;
  },

  async obtenerProyecto(id) {
    const { data } = await httpService.get(`${BASE}/${id}`);
    return data;
  },

  async crearProyecto(payload) {
    const { data } = await httpService.post(`${BASE}/crear`, payload);
    return data;
  },

  async actualizarProyecto(id, payload) {
    const { data } = await httpService.put(`${BASE}/${id}`, payload);
    return data;
  },

  async eliminarProyecto(id) {
    const { data } = await httpService.delete(`${BASE}/${id}`);
    return data;
  },
};

export default proyectoService;
