// hooks/useOrder.js
import { useState, useCallback } from 'react';
import ordenCompraService from '../services/ordenCompraService';

const useOrder = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las órdenes de compra
  const getOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.getOrdenes();
      console.log('Respuesta de getOrdenes:', response);
      
      if (response.success) {
        // Verificar si data es un array directamente
        if (Array.isArray(response.data)) {
          console.log('Data es un array:', response.data);
          setOrdenes(response.data);
        } 
        // Verificar si data tiene una propiedad que contenga el array
        else if (response.data && typeof response.data === 'object') {
          console.log('Data es un objeto:', response.data);
          // Buscar posibles propiedades que contengan el array
          const possibleArrayKeys = ['datos', 'ordenes', 'items', 'data', 'results', 'list'];
          let foundArray = null;
          
          for (const key of possibleArrayKeys) {
            if (response.data[key] && Array.isArray(response.data[key])) {
              console.log(`Encontrado array en propiedad ${key}:`, response.data[key]);
              foundArray = response.data[key];
              break;
            }
          }
          
          if (foundArray) {
            setOrdenes(foundArray);
          } else {
            console.log('No se encontró ningún array en las propiedades conocidas');
            setOrdenes([]);
          }
        } else {
          console.log('response.data no es válido:', response.data);
          setOrdenes([]);
        }
      } else {
        console.log('Backend response.success es false');
        setOrdenes([]);
      }
    } catch (err) {
      console.error("Error en useOrder.getOrdenes:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una orden por ID
  const getOrdenById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.getOrdenById(id);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error("Error en useOrder.getOrdenById:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener una orden por número
  const getOrdenByNumero = async (numeroOrden) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.getOrdenByNumero(numeroOrden);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error("Error en useOrder.getOrdenByNumero:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear una nueva orden
  const createOrden = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.createOrden(payload);
      if (response.success) {
        // Agregar la nueva orden al estado local
        setOrdenes((prev) => [...prev, response.data]);
        
        // También recargar todas las órdenes para asegurar sincronización
        setTimeout(async () => {
          try {
            await getOrdenes();
          } catch (error) {
            console.error('Error recargando órdenes después de crear:', error);
          }
        }, 100);
        
        return response.data;
      }
    } catch (err) {
      console.error("Error en useOrder.createOrden:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar una orden existente
  const updateOrden = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.updateOrden(id, payload);
      if (response.success) {
        setOrdenes((prev) =>
          prev.map((o) => (o.id === id ? { ...o, ...response.data } : o))
        );
        return response.data;
      }
    } catch (err) {
      console.error("Error en useOrder.updateOrden:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar una orden (soft delete)
  const deleteOrden = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.deleteOrden(id);
      if (response.success) {
        setOrdenes((prev) => prev.filter((o) => o.id !== id));
        return true;
      }
    } catch (err) {
      console.error("Error en useOrder.deleteOrden:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar una orden permanentemente
  const hardDeleteOrden = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.hardDeleteOrden(id);
      if (response.success) {
        setOrdenes((prev) => prev.filter((o) => o.id !== id));
        return true;
      }
    } catch (err) {
      console.error("Error en useOrder.hardDeleteOrden:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener órdenes eliminadas
  const getOrdenesEliminadas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.getOrdenesEliminadas();
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error("Error en useOrder.getOrdenesEliminadas:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restaurar una orden eliminada
  const restaurarOrden = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordenCompraService.restaurarOrden(id);
      if (response.success) {
        // Recargar las órdenes después de restaurar
        await getOrdenes();
        return true;
      }
    } catch (err) {
      console.error("Error en useOrder.restaurarOrden:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ordenes,
    loading,
    error,
    getOrdenes,
    getOrdenById,
    getOrdenByNumero,
    createOrden,
    updateOrden,
    deleteOrden,
    hardDeleteOrden,
    getOrdenesEliminadas,
    restaurarOrden,
  };
};

export default useOrder;
