import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const ButtonHandlersContext = createContext();

export const useButtonHandlers = () => {
  const context = useContext(ButtonHandlersContext);
  if (!context) {
    throw new Error('useButtonHandlers must be used within ButtonHandlersProvider');
  }
  return context;
};

export const ButtonHandlersProvider = ({ children }) => {
  const navigate = useNavigate();

  // Generic handlers for common button actions
  const handleNavigate = (path) => {
    try {
      if (path) {
        navigate(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      if (path) {
        window.location.href = path;
      }
    }
  };

  const handleExportData = async (data, filename, headers = []) => {
    try {
      let csvContent = '';
      
      if (headers?.length > 0) {
        csvContent = headers?.join(',') + '\n';
      }
      
      if (data?.length > 0) {
        const rows = data?.map(row => 
          Object.values(row)?.map(value => `"${value || ''}"`)?.join(',')
        );
        csvContent += rows?.join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `export-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, message: 'Datos exportados exitosamente' };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, message: 'Error al exportar datos' };
    }
  };

  const handleRefresh = async (callback) => {
    try {
      if (callback && typeof callback === 'function') {
        await callback();
      }
      return { success: true, message: 'Datos actualizados' };
    } catch (error) {
      console.error('Error refreshing data:', error);
      return { success: false, message: 'Error al actualizar datos' };
    }
  };

  const handleDelete = (item, onDelete, itemName = 'elemento') => {
    if (window.confirm(`¿Está seguro de que desea eliminar este ${itemName}?\n\nEsta acción no se puede deshacer.`)) {
      if (onDelete && typeof onDelete === 'function') {
        onDelete(item);
        return { success: true, message: `${itemName} eliminado exitosamente` };
      }
    }
    return { success: false, message: 'Eliminación cancelada' };
  };

  const handleEdit = (item, onEdit, promptText = 'Nuevo valor:') => {
    const newValue = prompt(promptText, item?.name || '');
    if (newValue && newValue?.trim() && newValue !== item?.name) {
      if (onEdit && typeof onEdit === 'function') {
        onEdit({ ...item, name: newValue?.trim() });
        return { success: true, message: 'Elemento actualizado exitosamente' };
      }
    }
    return { success: false, message: 'Edición cancelada o sin cambios' };
  };

  const handleApprove = (item, onApprove, message = '¿Desea aprobar este elemento?') => {
    if (window.confirm(message)) {
      if (onApprove && typeof onApprove === 'function') {
        onApprove(item);
        return { success: true, message: 'Elemento aprobado exitosamente' };
      }
    }
    return { success: false, message: 'Aprobación cancelada' };
  };

  const handleReject = (item, onReject, message = '¿Desea rechazar este elemento?') => {
    if (window.confirm(message)) {
      if (onReject && typeof onReject === 'function') {
        onReject(item);
        return { success: true, message: 'Elemento rechazado' };
      }
    }
    return { success: false, message: 'Rechazo cancelado' };
  };

  const value = {
    handleNavigate,
    handleExportData,
    handleRefresh,
    handleDelete,
    handleEdit,
    handleApprove,
    handleReject
  };

  return (
    <ButtonHandlersContext.Provider value={value}>
      {children}
    </ButtonHandlersContext.Provider>
  );
};

// Create a wrapper component that doesn't use useNavigate at the top level
export const SafeButtonHandlersProvider = ({ children }) => {
  return (
    <ButtonHandlersContext.Provider value={null}>
      {children}
    </ButtonHandlersContext.Provider>
  );
};

export default ButtonHandlersProvider;