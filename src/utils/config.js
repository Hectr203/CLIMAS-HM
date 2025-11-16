
// Configuración centralizada de variables de entorno para Vite
// Solo la URL del backend

class EnvConfig {
  static get API_URL() {
    // En desarrollo, usar localhost
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_API_URL || "http://localhost:7071/api";
    }

    // En producción, usar la variable de entorno o el túnel como fallback
    return import.meta.env.VITE_API_URL || "https://qg8pqmgk-7071.usw3.devtunnels.ms/api";
  }

  // Validación básica
  static validateRequiredEnvVars() {
    const required = ["VITE_API_URL"];
    const missing = required.filter((envVar) => !import.meta.env[envVar]);
    if (missing.length > 0) {
      console.warn("⚠️ Falta la variable de entorno requerida:", missing);
    }
    return missing.length === 0;
  }

  // Debug helper
  static logConfig() {
    console.group("🔧 Configuración de entorno");
    // console.log eliminado
    console.groupEnd();
  }
}

// Validar al importar
EnvConfig.validateRequiredEnvVars();

export default EnvConfig;
