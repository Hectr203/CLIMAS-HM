import httpService from "./httpService";

const TIMEOUT = 10000; // 10 segundos

const requisiService = {
  async getRequisitions(filters = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const query = new URLSearchParams(filters).toString();
      const url = query ? `/requisiciones?${query}` : "/requisiciones";

      const response = await httpService.get(url, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      // Si la respuesta tiene una estructura similar a getOrdenes
      // Loguear la respuesta para depuración
      console.log('Respuesta del servidor (requisiciones):', response);

      if (response?.data?.items && Array.isArray(response.data.items)) {
        return {
          success: true,
          data: response.data.items.map(item => ({
            id: item.id,
            numeroOrdenTrabajo: item.numeroOrdenTrabajo || item.orderNumber,
            nombreProyecto: item.nombreProyecto || item.projectName,
            solicitadoPor: item.solicitadoPor || item.requestedBy,
            fechaSolicitud: item.fechaSolicitud || item.requestDate,
            estado: item.estado || item.status,
            prioridad: item.prioridad || item.priority,
            descripcionSolicitud: item.descripcionSolicitud || item.description,
            materiales: item.materiales || item.items || [],
            materialesManuales: item.materialesManuales || item.manualItems || [], // ✅ AGREGAR ESTO
            justificacionSolicitud: item.justificacionSolicitud || item.justification,
            notasAdicionales: item.notasAdicionales || item.notes
          })),
          message: `Se encontraron ${response.data.items.length} requisición(es)`
        };
      }

      // Si la respuesta es un array directo
      if (Array.isArray(response?.data)) {
        return {
          success: true,
          data: response.data.map(item => ({
            id: item.id,
            numeroOrdenTrabajo: item.numeroOrdenTrabajo || item.orderNumber,
            nombreProyecto: item.nombreProyecto || item.projectName,
            solicitadoPor: item.solicitadoPor || item.requestedBy,
            fechaSolicitud: item.fechaSolicitud || item.requestDate,
            estado: item.estado || item.status,
            prioridad: item.prioridad || item.priority,
            descripcionSolicitud: item.descripcionSolicitud || item.description,
            materiales: item.materiales || item.items || [],
            materialesManuales: item.materialesManuales || item.manualItems || [], // ✅ AGREGAR ESTO
            justificacionSolicitud: item.justificacionSolicitud || item.justification,
            notasAdicionales: item.notasAdicionales || item.notes
          })),
          message: `Se encontraron ${response.data.length} requisición(es)`
        };
      }

      // Si no hay datos válidos
      return {
        success: true,
        data: [],
        message: 'No se encontraron requisiciones'
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Si la petición fue cancelada, retornamos un resultado vacío válido
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        return {
          success: true,
          data: [],
          message: 'La búsqueda de requisiciones fue cancelada'
        };
      }

      console.error("Error al obtener requisiciones:", error);
      return {
        success: true,
        data: [],
        message: 'Error al cargar requisiciones'
      };
    }
  },

  async createRequisition(payload) {
    try {
      const response = await httpService.post("/requisiciones/crear", payload);
      return response;
    } catch (error) {
      console.error("Error al crear requisición:", error);
      throw error;
    }
  },

  async updateRequisition(id, payload) {
    try {
      const response = await httpService.put(`/requisiciones/${id}`, payload);
      return response;
    } catch (error) {
      console.error("Error al actualizar requisición:", error);
      throw error;
    }
  },

  async deleteRequisition(id) {
    try {
      const response = await httpService.delete(`/requisiciones/${id}`);
      return response;
    } catch (error) {
      console.error("Error al eliminar requisición:", error);
      throw error;
    }
  },

  async getRequisitionById(id) {
    try {
      const response = await httpService.get(`/requisiciones/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener requisición por ID:", error);
      throw error;
    }
  }
};

export default requisiService;
