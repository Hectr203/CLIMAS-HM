// src/services/proyectoService.js
import httpService from "./httpService";

const ROUTES = {
  LIST: "/proyectos/todos",                        // GET
  GET_BY_ID: (id) => `/proyectos/obtener/${id}`,   // GET
  CREATE: "/proyectos/crear",                      // POST
  UPDATE: (id) => `/proyectos/actualizar/${id}`,   // PUT
  DELETE: (id) => `/proyectos/eliminar/${id}`,     // DELETE
};

const EXTERNALS = {
  CURRENCY_LATEST: "https://api.currencyapi.com/v3/latest",
};

function assertId(id, ctx = "id") {
  if (!id || (typeof id !== "string" && typeof id !== "number")) {
    const err = new Error(`Parámetro ${ctx} inválido`);
    err.code = "EINVAL";
    throw err;
  }
}

function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

/** Normaliza payloads para evitar campos calculados y formateos inconsistentes */
function sanitizePresupuesto(obj) {
  const out = deepClone(obj) || {};
  if (out?._metaEquipos?.capturadoEn) {
    out._metaEquipos.capturadoEn = String(out._metaEquipos.capturadoEn).trim().toUpperCase();
  }
  if ("total" in out) {
    const { total, ...rest } = out;
    return rest;
  }
  return out;
}

/** Sanitiza CREATE/UPDATE */
function sanitizeWritePayload(payload = {}) {
  const out = deepClone(payload);
  if (out?.presupuesto) out.presupuesto = sanitizePresupuesto(out.presupuesto);
  return out;
}

/** ✅ Compatible con Vite (import.meta.env) y CRA; sin `process` directo */
function getCurrencyApiKey() {
  const env =
    (typeof import.meta !== "undefined" && import.meta.env) ||
    (typeof process !== "undefined" && process.env) ||
    {};
  const key = env.VITE_CURRENCY_API_KEY || env.REACT_APP_CURRENCY_API_KEY;
  if (!key) {
    const err = new Error("Falta CURRENCY_API_KEY. Configura VITE_CURRENCY_API_KEY o REACT_APP_CURRENCY_API_KEY.");
    err.code = "NO_API_KEY";
    throw err;
  }
  return key;
}

/** Cache simple en memoria para rates */
const currencyCache = {
  value: null,
  expiresAt: 0,
};
function getNow() { return Date.now(); }

const proyectoService = {
  /**
   * GET /proyectos/todos
   * @param {object} config { params, headers, signal, timeout, ... }
   */
  async getProyectos(config = {}) {
    try {
      const data = await httpService.get(ROUTES.LIST, config);
      return data;
    } catch (error) {
      console.error("[proyectoService.getProyectos] GET", {
        endpoint: ROUTES.LIST,
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },

  /**
   * GET /proyectos/obtener/{id}
   */
  async getProyectoById(id, config = {}) {
    assertId(id, "id");
    try {
      const data = await httpService.get(ROUTES.GET_BY_ID(id), config);
      return data;
    } catch (error) {
      console.error("[proyectoService.getProyectoById] GET", {
        endpoint: ROUTES.GET_BY_ID(id),
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },

  /**
   * POST /proyectos/crear
   */
  async createProyecto(payload, config = {}) {
    try {
      const body = sanitizeWritePayload(payload);
      const data = await httpService.post(ROUTES.CREATE, body, config);
      return data;
    } catch (error) {
      console.group("[proyectoService.createProyecto] POST");
      console.error("endpoint:", ROUTES.CREATE);
      console.error("status:", error?.status);
      console.error("message:", error?.userMessage || error?.message);
      console.error("data:", error?.data);
      console.error("request payload (sanitized):", sanitizeWritePayload(payload));
      console.groupEnd();
      throw error;
    }
  },

  /**
   * PUT /proyectos/actualizar/{id}
   */
  async updateProyecto(id, payload, config = {}) {
    assertId(id, "id");
    try {
      const body = sanitizeWritePayload(payload);
      const data = await httpService.put(ROUTES.UPDATE(id), body, config);
      return data;
    } catch (error) {
      console.error("[proyectoService.updateProyecto] PUT", {
        endpoint: ROUTES.UPDATE(id),
        status: error?.status,
        data: error?.data,
        message: error?.userMessage || error?.message,
      });
      throw error;
    }
  },

  /**
   * DELETE /proyectos/eliminar/{id}
   */
  async deleteProyecto(id, config = {}) {
    assertId(id, "id");
    try {
      const data = await httpService.delete(ROUTES.DELETE(id), config);
      return data;
    } catch (error) {
      console.error("[proyectoService.deleteProyecto] DELETE", {
        endpoint: ROUTES.DELETE(id),
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
   * Llama a currencyapi y devuelve el JSON crudo
   * @param {{base?: string, currencies?: string[]}} params
   * @param {object} config
   */
  async getCurrencyRates({ base = "USD", currencies = [] } = {}, config = {}) {
    try {
      const apikey = getCurrencyApiKey();

      // Cache 10 minutos
      const cacheKey = `rates:${base}:${(currencies || []).join(",")}`;
      const now = getNow();
      if (currencyCache.value?.key === cacheKey && currencyCache.expiresAt > now) {
        return currencyCache.value.data;
      }

      const urlParams = new URLSearchParams({
        apikey,
        base_currency: base,
      });
      if (Array.isArray(currencies) && currencies.length) {
        urlParams.set("currencies", currencies.join(","));
      }

      const url = `${EXTERNALS.CURRENCY_LATEST}?${urlParams.toString()}`;

      const data = await httpService.get(url, {
        timeout: 15000,
        ...config,
      });

      currencyCache.value = { key: cacheKey, data };
      currencyCache.expiresAt = now + 10 * 60 * 1000;

      return data; // { data: { MXN:{ code, value }, ... }, meta?... }
    } catch (error) {
      console.error("[proyectoService.getCurrencyRates] GET external", {
        endpoint: EXTERNALS.CURRENCY_LATEST,
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
    const entries = Object.entries(res?.data || {}).map(([code, obj]) => [code, obj?.value]);
    return Object.fromEntries(entries);
  },
};

export default proyectoService;
