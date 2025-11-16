import axios from "axios";

/**
 * Cliente HTTP centralizado con interceptors para manejo automático de tokens
 * Funciona como middleware para todas las peticiones de la aplicación
 */
class HttpService {
  constructor() {
    // Determinar la URL base según el entorno
    const getBaseURL = () => {
      // Detectar si estamos en desarrollo (localhost o 127.0.0.1)
      const isDevelopment =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === '0.0.0.0' ||
          import.meta.env.DEV);

      // En desarrollo, usar el proxy de Vite
      if (isDevelopment) {
        return "/api";
      }

      // En producción, usar la variable de entorno o el túnel como fallback
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        // Si la URL ya incluye /api, usarla tal cual, si no, agregarlo
        return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
      }

      // Fallback: URL del túnel de VS Code
      return "https://qg8pqmgk-7071.usw3.devtunnels.ms/api";
    };

    const baseURL = getBaseURL();

    // Log para debug (solo en producción)
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      console.log('🔧 API Base URL:', baseURL);
    }

    this.api = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // REQUEST
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Suprimir completamente 404 en comunicaciones (no es un error real)
        if (
          error.response?.status === 404 &&
          error.config?.url?.includes("/comunicaciones/cliente/")
        ) {
          // Retornar una respuesta exitosa vacía en lugar de error
          return { data: { data: { comunicaciones: [] } } };
        }

        if (error.response?.status === 401) this.handleUnauthorized();
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  handleUnauthorized() {
    this.setToken(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  normalizeError(error) {
    return {
      message: error.message || "Error desconocido",
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response,
      isServerError: error.response?.status >= 500,
      isClientError:
        error.response?.status >= 400 && error.response?.status < 500,
      originalError: error,
      userMessage:
        error.response?.data?.message || error.message || "Error desconocido",
    };
  }

  // Métodos HTTP
  async get(url, config = {}) {
    const res = await this.api.get(url, config);
    return res.data;
  }

  async post(url, data = {}, config = {}) {
    const res = await this.api.post(url, data, config);
    return res.data;
  }

  async put(url, data = {}, config = {}) {
    const res = await this.api.put(url, data, config);
    return res.data;
  }

  async patch(url, data = {}, config = {}) {
    const res = await this.api.patch(url, data, config);
    return res.data;
  }

  async delete(url, config = {}) {
    const res = await this.api.delete(url, config);
    return res.data;
  }

  async healthCheck() {
    try {
      const response = await this.get("/health");
      return { healthy: true, ...response };
    } catch (error) {
      return { healthy: false, error: error.userMessage };
    }
  }
}

const httpService = new HttpService();
export default httpService;
