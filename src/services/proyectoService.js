// services/proyectoService.js
import httpService from "./httpService";

const ROUTES = {
  LIST: "/proyectos/todos",                      // GET
  GET_BY_ID: (id) => `/proyectos/obtener/${id}`, // GET
  CREATE: "/proyectos/crear",                    // POST
  UPDATE: (id) => `/proyectos/actualizar/${id}`, // PUT
  DELETE: (id) => `/proyectos/eliminar/${id}`,   // DELETE
};

// === API externa ===
const EXTERNALS = {
  CURRENCY_LATEST: "https://api.currencyapi.com/v3/latest",
};

/** Sanitiza CREATE: mayúsculas y no enviar 'total' si lo calcula el back */
function sanitizeCreatePayload(payload = {}) {
  const out = { ...payload };

  if (out?.presupuesto?._metaEquipos?.capturadoEn) {
    out.presupuesto._metaEquipos.capturadoEn =
      String(out.presupuesto._metaEquipos.capturadoEn).trim().toUpperCase();
  }

  if (out?.presupuesto && "total" in out.presupuesto) {
    const { total, ...rest } = out.presupuesto;
    out.presupuesto = rest;
  }

  return out;
}

/** ✅ Compatible con Vite (import.meta.env) y CRA; sin `process` en navegador */
function getCurrencyApiKey() {
  const env =
    (typeof import.meta !== "undefined" && import.meta.env) ||
    (typeof process !== "undefined" && process.env) ||
    {};

  return (
    env.VITE_CURRENCY_API_KEY ||
    env.REACT_APP_CURRENCY_API_KEY ||
    // ⚠️ Fallback SOLO para dev local. No lo dejes así en prod.
    "fca_live_8tZwnMuA2xq5ExRpYPkQeZiVHGS2wXbFWnc1U7y3"
  );
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

  /** GET /proyectos/obtener/{id} */
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
      console.group("Error al crear proyecto");
      console.error("status:", error?.status);
      console.error("message:", error?.userMessage || error?.message);
      console.error("data:", error?.data);
      console.error("request payload:", payload);
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

  // ========================================
  // 🌎 CURRENCY API
  // ========================================
  /**
   * Devuelve JSON crudo de currencyapi (data:{ MXN:{value}, ... })
   */
  async getCurrencyRates({ base = "USD", currencies = [] } = {}, config = {}) {
    try {
      const params = new URLSearchParams({
        apikey: getCurrencyApiKey(),
        base_currency: base,
      });
      if (Array.isArray(currencies) && currencies.length) {
        params.set("currencies", currencies.join(","));
      }

      const url = `${EXTERNALS.CURRENCY_LATEST}?${params.toString()}`;

      // URL absoluta ⇒ httpService NO usa baseURL aquí
      const data = await httpService.get(url, {
        timeout: 15000,
        ...config,
      });

      return data; // { data: { MXN:{ code, value }, ... }, meta?... }
    } catch (error) {
      console.error("Error al obtener currency rates (API externa):", {
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },

  /**
   * Devuelve mapa plano { MXN: 18.2, EUR: 0.92, ... }
   */
  async getCurrencyRatesMap(args = {}, config = {}) {
    const res = await this.getCurrencyRates(args, config);
    const entries = Object.entries(res?.data || {}).map(([code, obj]) => [
      code,
      obj?.value,
    ]);
    return Object.fromEntries(entries);
  },
};

export default proyectoService;
