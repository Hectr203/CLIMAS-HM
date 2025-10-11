import axios from "axios";
import EnvConfig from "../utils/config";

/**
 * Cliente HTTP centralizado con interceptors para manejo automático de tokens
 * Funciona como middleware para todas las peticiones de la aplicación
 */
class HttpService {
  constructor() {
    // Crear instancia de Axios con configuración base
    this.api = axios.create({
      baseURL: EnvConfig.API_URL,
      timeout: 30000, // 30 segundos
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Configurar interceptors
    this.setupInterceptors();
  }

  /**
   * Configurar interceptors para requests y responses
   */
  setupInterceptors() {
    // REQUEST INTERCEPTOR
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE INTERCEPTOR
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
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

  // Métodos HTTP básicos
  async get(url, config = {}) {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post(url, data = {}, config = {}) {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put(url, data = {}, config = {}) {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async patch(url, data = {}, config = {}) {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Health check
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
