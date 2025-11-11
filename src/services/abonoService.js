// src/services/abonoService.js
import httpService from './httpService';

// Ruta base para los endpoints de abonos (configurable)
const BASE_PATH = '/abonos';

/**
 * Servicio centralizado para gestionar Abonos de pago
 * Usa el proxy /api configurado en httpService
 *
 * Convenciones de API asumidas (donde ${BASE_PATH} es configurable):
 *  - Crear:         POST   ${BASE_PATH}/crear
 *  - Listar:        GET    ${BASE_PATH}            (acepta ?page, ?limit, y filtros)
 *  - Obtener por ID GET    ${BASE_PATH}/:id
 *  - Actualizar:    PUT    ${BASE_PATH}/:id
 *  - Eliminar:      DELETE ${BASE_PATH}/:id
 *  - Por proyecto:  GET    ${BASE_PATH}/proyecto/:proyectoId
 *  - Por cliente:   GET    ${BASE_PATH}/cliente/:clienteId
 *  - Aprobar:       POST   ${BASE_PATH}/:id/aprobar
 *  - Rechazar:      POST   ${BASE_PATH}/:id/rechazar   (body: { motivo })
 */
const abonoService = {
  /**
   * Crea un nuevo abono
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createAbono(data) {
    return await httpService.post(`${BASE_PATH}/crear`, data);
  },

  /**
   * Lista abonos con filtros/paginación (opcional)
   * @param {Object} [params]  e.g. { page, limit, proyectoId, clienteId, estado, desde, hasta, q }
   * @returns {Promise<Object|Array>}
   */
  async getAbonos(params = {}) {
    return await httpService.get(`${BASE_PATH}`, { params });
  },

  /**
   * Obtiene un abono por ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getAbonoById(id) {
    return await httpService.get(`${BASE_PATH}/${id}`);
  },

  /**
   * Actualiza un abono por ID
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateAbono(id, data) {
    return await httpService.put(`${BASE_PATH}/${id}`, data);
  },

  /**
   * Elimina un abono por ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteAbono(id) {
    return await httpService.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Lista abonos por proyecto
   * @param {string} proyectoId
   * @param {Object} [params]
   * @returns {Promise<Object|Array>}
   */
  async getAbonosByProyecto(proyectoId, params = {}) {
    return await httpService.get(`${BASE_PATH}/proyecto/${proyectoId}`, { params });
  },

  /**
   * Lista abonos por cliente
   * @param {string} clienteId
   * @param {Object} [params]
   * @returns {Promise<Object|Array>}
   */
  async getAbonosByCliente(clienteId, params = {}) {
    return await httpService.get(`${BASE_PATH}/cliente/${clienteId}`, { params });
  },

  /**
   * Aprueba un abono
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async aprobarAbono(id) {
    return await httpService.post(`${BASE_PATH}/${id}/aprobar`, {});
  },

  /**
   * Rechaza un abono con motivo
   * @param {string} id
   * @param {string} motivo
   * @returns {Promise<Object>}
   */
  async rechazarAbono(id, motivo = '') {
    return await httpService.post(`${BASE_PATH}/${id}/rechazar`, { motivo });
  },
};

export default abonoService;
