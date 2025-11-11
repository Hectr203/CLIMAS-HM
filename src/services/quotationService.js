// quotationService.js
import httpService from "./httpService";

const quotationService = {
  async createQuotation(data) {
    try {
      const response = await httpService.post("cotizacion/crear", data);
      return response.data;
    } catch (error) {
      console.error("Error creating quotation:", error);
      throw error;
    }
  },

  async getCotizaciones() {
    try {
      const response = await httpService.get("cotizaciones");
      return response;
    } catch (error) {
      console.error("Error obteniendo cotizaciones:", error);
      throw error;
    }
  },

    async crearConstructor(data) {
      try {
        const response = await httpService.post('cotizaciones/constructor/crear', data);
        return response;
      } catch (error) {
        console.error('Error creando constructor:', error);
        throw error;
      }
    },
    async getCotizacionById(id) {
      try {
        const response = await httpService.get(`cotizacion/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error obteniendo cotización por ID:", error);
        throw error;
      }
    },

    async editCotizacion(id, data) {
      try {
        const response = await httpService.put(`cotizacion/${id}`, data);
        return response.data;
      } catch (error) {
        console.error("Error editando cotización:", error);
        throw error;
      }
    },

    async upsertRevision(revisionData) {
      try {
        // POST/PUT para crear o actualizar revisión
        const response = await httpService.post('cotizaciones/revision', revisionData);
        return response.data;
      } catch (error) {
        console.error('Error creando/actualizando revisión:', error);
        throw error;
      }
    },
    async getRevision({ id, idCotizacion }) {
      try {
        const params = [];
        if (id) params.push(`id=${id}`);
        if (idCotizacion) params.push(`idCotizacion=${idCotizacion}`);
        const query = params.length ? `?${params.join('&')}` : '';
        const response = await httpService.get(`cotizaciones/revision/obtener${query}`);
        return response.data;
      } catch (error) {
        console.error('Error obteniendo revisión:', error);
        throw error;
      }
    },
    async getConstructorByCotizacionId(id) {
      try {
        const response = await httpService.get(`cotizaciones/constructor/obtener?idCotizacion=${id}`);
        return response.data;
      } catch (error) {
        // Si el error es 404, significa que no existe constructor y es un caso válido
        if (error.status === 404) {
          return null;
        }
        // Para otros errores, los manejamos como antes
        console.error('Error obteniendo constructor:', error);
        throw error;
      }
    },
};

export default quotationService;
