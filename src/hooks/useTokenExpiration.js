import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useNotifications } from "../context/NotificationContext";
import { useConfirmDialog } from "../ui/ConfirmDialogContext";
import { renewToken, logout } from "../utils/auth";

/**
 * Hook para manejar la expiración y renovación del token JWT.
 * @param {string} token - El token JWT actual.
 * @param {function} onTokenRenewed - Callback para actualizar el token en el estado global.
 */

export default function useTokenExpiration(token, onTokenRenewed) {
  const { showInfo } = useNotifications();
  const { showConfirm } = useConfirmDialog();
  const timeoutRef = useRef();
  const isRenewingRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch {
      logout();
      return;
    }
    
    if (!decoded.exp) return;
    
    const expMs = decoded.exp * 1000;
    const now = Date.now();
    const msBeforeExpiry = expMs - now;
    
    console.log(`Token actual expira en: ${Math.round(msBeforeExpiry / 1000)} segundos`);
    
    // Si el token ya expiró o expira en menos de 30 segundos, renovar inmediatamente
    if (msBeforeExpiry <= 30000) {
      console.log("Token expira muy pronto, renovando inmediatamente");
      handleSessionExtension();
      return;
    }
    
    // Calcular cuándo notificar:
    // - Si el token dura más de 5 minutos, notificar 2 minutos antes
    // - Si el token dura entre 2-5 minutos, notificar cuando quede 1 minuto
    // - Si el token dura menos de 2 minutos, notificar cuando quede 30 segundos
    let notifyMs;
    const totalDurationMs = msBeforeExpiry;
    
    if (totalDurationMs > 5 * 60 * 1000) { // Más de 5 minutos
      notifyMs = msBeforeExpiry - 2 * 60 * 1000; // 2 minutos antes
    } else if (totalDurationMs > 2 * 60 * 1000) { // Entre 2-5 minutos
      notifyMs = msBeforeExpiry - 1 * 60 * 1000; // 1 minuto antes
    } else { // Menos de 2 minutos
      notifyMs = msBeforeExpiry - 30 * 1000; // 30 segundos antes
    }
    
    // Asegurar que notifyMs no sea negativo
    if (notifyMs <= 0) {
      console.log("Tiempo de notificación ya pasó, renovando inmediatamente");
      handleSessionExtension();
      return;
    }
    
    console.log(`Programando renovación en: ${Math.round(notifyMs / 1000)} segundos`);
    timeoutRef.current = setTimeout(handleSessionExtension, notifyMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Limpiar el flag de renovación cuando el token cambie
      isRenewingRef.current = false;
    };
    // eslint-disable-next-line
  }, [token]);

  async function handleSessionExtension() {
    // Evitar múltiples renovaciones simultáneas
    if (isRenewingRef.current) {
      console.log("Ya hay una renovación en progreso, ignorando");
      return;
    }
    
    isRenewingRef.current = true;
    
    try {
      const confirmed = await showConfirm({
        title: "Extender sesión",
        message: "Tu sesión está por expirar. ¿Deseas extenderla?",
        confirmText: "Extender sesión",
        cancelText: "Cerrar sesión",
      });
      
      if (confirmed) {
        try {
          console.log("Renovando token... token actual:", token);
          const newToken = await renewToken(token);
          console.log("Token renovado exitosamente:", newToken ? "✓" : "✗");
          
          if (newToken) {
            // Decodifica el nuevo token para mostrar la expiración
            let decodedNew;
            try {
              decodedNew = jwtDecode(newToken);
            } catch {
              decodedNew = null;
            }
            
            if (decodedNew?.exp) {
              const expDate = new Date(decodedNew.exp * 1000);
              console.log("Nuevo token expira en:", expDate.toLocaleString());
              showInfo(`Sesión extendida hasta: ${expDate.toLocaleString()}`);
            }
            
            if (onTokenRenewed) onTokenRenewed(newToken);
            showInfo("Sesión extendida correctamente.");
          } else {
            throw new Error("No se recibió un token válido");
          }
        } catch (error) {
          console.error("Error al renovar el token:", error);
          showInfo("No se pudo extender la sesión. Cerrando sesión...");
          setTimeout(() => {
            console.log("Ejecutando logout por error de renovación");
            logout();
          }, 2000);
        }
      } else {
        console.log("Usuario eligió cerrar sesión");
        logout();
      }
    } finally {
      isRenewingRef.current = false;
    }
  }
}
