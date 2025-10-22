// services/proyectoService.js
import httpService from "./httpService";

const ROUTES = {
  LIST: "/proyectos/todos",                      // GET
  GET_BY_ID: (id) => `/proyectos/obtener/${id}`, // GET (ajusta si tu handler usa otra ruta)
  CREATE: "/proyectos/crear",                    // POST
  UPDATE: (id) => `/proyectos/actualizar/${id}`, // PUT
  DELETE: (id) => `/proyectos/eliminar/${id}`,   // DELETE
};

/** Sanitiza CREATE: mayúsculas en moneda y NO enviar 'total' si el back lo calcula */
function sanitizeCreatePayload(payload = {}) {
  const out = { ...payload };

  // Forzar _metaEquipos.capturadoEn en mayúsculas si existe
  if (out?.presupuesto?._metaEquipos?.capturadoEn) {
    out.presupuesto._metaEquipos.capturadoEn =
      String(out.presupuesto._metaEquipos.capturadoEn).trim().toUpperCase();
  }

  // Evitar 400 si el back no permite 'total' en create
  if (out?.presupuesto && "total" in out.presupuesto) {
    const { total, ...rest } = out.presupuesto;
    out.presupuesto = rest;
  }

  return out;
}

const proyectoService = {
  /** GET /proyectos/todos */
  async getProyectos(config = {}) {
    try {
      const data = await httpService.get(ROUTES.LIST, config);
      return data;
    } catch (error) {
      console.error("Error al obtener proyectos:", {
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },

  /** GET /proyectos/obtener/{id} (ajusta si tu handler difiere) */
  async getProyectoById(id, config = {}) {
    try {
      const data = await httpService.get(ROUTES.GET_BY_ID(id), config);
      return data;
    } catch (error) {
      console.error(`Error al obtener el proyecto con ID ${id}:`, {
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },

  /** POST /proyectos/crear */
  async createProyecto(payload, config = {}) {
    try {
      const body = sanitizeCreatePayload(payload);
      const data = await httpService.post(ROUTES.CREATE, body, config);
      return data;
    } catch (error) {
      // 🔎 Mostrar razón exacta del 400
      console.group("Error al crear proyecto");
      console.error("status:", error?.status);
      console.error("message:", error?.userMessage || error?.message);
      console.error("data:", error?.data);               // <-- detalle del backend
      console.error("request payload:", payload);        // <-- lo que mandaste
      console.groupEnd();
      throw error;
    }
  },

  /** PUT /proyectos/actualizar/{id} */
  async updateProyecto(id, payload, config = {}) {
    try {
      const data = await httpService.put(ROUTES.UPDATE(id), payload, config);
      return data;
    } catch (error) {
      console.error(`Error al actualizar el proyecto con ID ${id}:`, {
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },

  /** DELETE /proyectos/eliminar/{id} */
  async deleteProyecto(id, config = {}) {
    try {
      const data = await httpService.delete(ROUTES.DELETE(id), config);
      return data;
    } catch (error) {
      console.error(`Error al eliminar el proyecto con ID ${id}:`, {
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },
};

export default proyectoService;
