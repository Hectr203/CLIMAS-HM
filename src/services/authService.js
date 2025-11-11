import httpService from "./httpService";

/**
 * Servicio de autenticación
 * Maneja todas las operaciones relacionadas con login, logout, registro, etc.
 */
class AuthService {
  /**
   * Iniciar sesión
   */
  async login(email, password) {
    try {
      console.log("=== ENVIANDO LOGIN REQUEST ===");
      console.log("Email:", email);
      
      const response = await httpService.post("/usuarios/login", {
        email,
        password,
      });
      
      console.log("=== RESPUESTA DEL SERVIDOR ===");
      console.log("Respuesta completa:", response);
      console.log("¿Tiene token?", !!response.token);
      console.log("Usuario:", response.usuario);
      console.log("=============================");
      
      if (response.token) {
        httpService.setToken(response.token);
      }
      return {
        success: true,
        data: response,
        user: response.usuario,
        token: response.token,
      };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        error: error.userMessage,
        details: error,
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await httpService.post("/usuarios/logout");
      httpService.setToken(null);
      return { success: true };
    } catch (error) {
      httpService.setToken(null);
      return {
        success: false,
        error: error.userMessage,
        details: error,
      };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await httpService.post("/auth/register", userData);
      return {
        success: true,
        data: response,
        message: "Usuario registrado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        details: error,
      };
    }
  }

  /**
   * Verificar token actual
   */
  async verifyToken() {
    try {
      const response = await httpService.get("/usuarios/token-info");
      return {
        success: true,
        valid: true,
        user: response.tokenInfo?.usuario || response.usuario,
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken() {
    try {
      const response = await httpService.post("/usuarios/extender-sesion");
      if (response.token) {
        httpService.setToken(response.token);
      }
      return {
        success: true,
        token: response.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email) {
    try {
      const response = await httpService.post("/auth/forgot-password", {
        email,
      });
      return {
        success: true,
        message:
          "Se ha enviado un email con instrucciones para recuperar tu contraseña",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await httpService.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
      return {
        success: true,
        message: "Contraseña restablecida exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await httpService.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return {
        success: true,
        message: "Contraseña cambiada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile() {
    try {
      const response = await httpService.get("/auth/profile");
      return {
        success: true,
        user: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(profileData) {
    try {
      const response = await httpService.put("/auth/profile", profileData);
      return {
        success: true,
        user: response,
        message: "Perfil actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }
}

const authService = new AuthService();
export default authService;
