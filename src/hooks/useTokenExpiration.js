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
    // Notificar 2 minutos antes de expirar
    // Notificar 2 minutos antes de expirar
    const notifyMs = msBeforeExpiry - 2 * 60 * 1000;
    if (notifyMs <= 0) {
      // Si ya está por expirar, notificar inmediatamente
      handleSessionExtension();
      return;
    }
    timeoutRef.current = setTimeout(handleSessionExtension, notifyMs);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line
  }, [token]);

  async function handleSessionExtension() {
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
        console.log("Respuesta de renovación, nuevo token:", newToken);
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
          showInfo(`Nuevo token expira: ${expDate.toLocaleString()}`);
        }
        if (onTokenRenewed) onTokenRenewed(newToken);
        showInfo("Sesión extendida correctamente.");
      } catch (error) {
        console.warn("Error al renovar el token:", error);
        showInfo(
          "No se pudo extender la sesión. Detalle: " +
            (error?.message || JSON.stringify(error))
        );
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } else {
      logout();
    }
  }
}
