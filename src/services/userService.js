import httpService from "./httpService";

const userService = {
  /**
   * Obtiene la lista de usuarios
   * @returns {Promise} Promise con la respuesta del servidor
   */
  getUsers: () => {
    return httpService.get("/usuarios/obtenerUsuarios");
  },

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise} Promise con la respuesta del servidor
   */
  createUser: (userData) => {
    return httpService.post("/usuarios/crear", userData);
  },

  /**
   * Actualiza un usuario existente
   * @param {string|number} id - ID del usuario a actualizar
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise} Promise con la respuesta del servidor
   */
  updateUser: (id, userData) => {
    return httpService.put(`/usuarios/actualizar/${id}`, userData);
  },

  /**
   * Obtiene un usuario por su ID
   * @param {string|number} id - ID del usuario
   * @returns {Promise} Promise con la respuesta del servidor
   */
  getUserById: (id) => {
    return httpService.get(`/usuarios/${id}`);
  },
};

export default userService;
