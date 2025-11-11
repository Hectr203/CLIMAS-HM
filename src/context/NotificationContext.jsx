import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Contexto para el manejo de notificaciones
 */
export const NotificationContext = createContext();

/**
 * Hook personalizado para usar el contexto de notificaciones
 */


/**
 * Tipos de notificación
 */
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Provider del contexto de notificaciones
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Agregar una nueva notificación
  const addNotification = useCallback((message, type = NotificationTypes.INFO, options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      action: options.action || null,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remover notificación si no es persistente
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, notification.duration);
    }

    return notification.id;
  }, []);

  // Remover notificación específica
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Limpiar notificaciones por tipo
  const clearNotificationsByType = useCallback((type) => {
    setNotifications(prev => prev.filter(notification => notification.type !== type));
  }, []);

  // Helpers para diferentes tipos de notificaciones
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification(message, NotificationTypes.SUCCESS, options);
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification(message, NotificationTypes.ERROR, { 
      duration: 7000, 
      ...options 
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification(message, NotificationTypes.WARNING, options);
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification(message, NotificationTypes.INFO, options);
  }, [addNotification]);

  // Mostrar error HTTP con formato específico
  const showHttpError = useCallback((error, context = '') => {
    let message = 'Ha ocurrido un error inesperado';

    if (typeof error === 'string') {
      message = error;
    } else if (error?.userMessage) {
      message = error.userMessage;
    } else if (error?.message) {
      message = error.message;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    return showError(message, { duration: 8000 });
  }, [showError]);

  // Mostrar éxito de operación
  const showOperationSuccess = useCallback((operation, resource = '') => {
    const messages = {
      create: `${resource} creado exitosamente`,
      update: `${resource} actualizado exitosamente`,
      delete: `${resource} eliminado exitosamente`,
      save: `${resource} guardado exitosamente`,
      send: `${resource} enviado exitosamente`,
      default: 'Operación completada exitosamente'
    };

    const message = messages[operation] || messages.default;
    return showSuccess(message);
  }, [showSuccess]);
    //  Mostrar notificación tipo confirmación con botones

const showConfirm = useCallback((message, { onConfirm, onCancel } = {}) => {
  const id = Date.now() + Math.random();

  const action = (
    <div className="flex justify-end gap-3 mt-3">
      <button
        onClick={() => {
          if (onCancel) onCancel();
          removeNotification(id);
        }}
        className="px-4 py-1.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
      >
        Cancelar
      </button>

      <button
        onClick={() => {
          if (onConfirm) onConfirm();
          removeNotification(id);
        }}
        className="px-4 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
      >
        Eliminar
      </button>
    </div>
  );

  setNotifications(prev => [
    ...prev,
    {
      id,
      message: (
        <div className="flex flex-col">
          <span className="text-sm text-gray-800">{message}</span>
          {action}
        </div>
      ),
      type: NotificationTypes.WARNING,
      duration: 0, // No se cierra automáticamente
      persistent: true,
    }
  ]);
}, [removeNotification]);

 


  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    clearNotificationsByType,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showHttpError,
    showOperationSuccess,
    showConfirm,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar el contexto de notificaciones
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }

  return context;
};

/**
 * Hook para manejo de errores HTTP
 */
export const useErrorHandler = () => {
  const { showHttpError, showOperationSuccess } = useNotifications();

  const handleError = useCallback((error, context = '') => {
    console.error('HTTP Error:', error);
    showHttpError(error, context);
  }, [showHttpError]);

  const handleSuccess = useCallback((operation, resource = '') => {
    showOperationSuccess(operation, resource);
  }, [showOperationSuccess]);

  return {
    handleError,
    handleSuccess
  };
};

// Alias para usar el contexto de notificaciones como useNotification
export const useNotification = useNotifications;

export default NotificationContext;
