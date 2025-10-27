// hooks/useInventory.js
import { useState, useCallback } from 'react';
import articuloService from '../services/articuloService';

const useInventory = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los artículos
  const getArticulos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await articuloService.getArticulos();
      
      if (response.success) {
        // Verificar si data es un array directamente
        if (Array.isArray(response.data)) {
          setArticulos(response.data);
        } 
        // Verificar si data tiene una propiedad que contenga el array
        else if (response.data && typeof response.data === 'object') {
          // Buscar posibles propiedades que contengan el array
          const possibleArrayKeys = ['datos', 'articulos', 'items', 'data', 'results', 'list'];
          let foundArray = null;
          
          for (const key of possibleArrayKeys) {
            if (response.data[key] && Array.isArray(response.data[key])) {
              foundArray = response.data[key];
              break;
            }
          }
          
          if (foundArray) {
            setArticulos(foundArray);
          } else {
            setArticulos([]);
          }
        } else {
          console.log('response.data no es válido');
          setArticulos([]);
        }
      } else {
        console.log('Backend response.success es false');
        setArticulos([]);
      }
    } catch (err) {
      console.error("Error en useInventory.getArticulos:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un artículo por ID
  const getArticuloById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await articuloService.getArticuloById(id);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error("Error en useInventory.getArticuloById:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo artículo
  const createArticulo = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await articuloService.createArticulo(payload);
      if (response.success) {
        // Agregar el nuevo artículo al estado local
        setArticulos((prev) => [...prev, response.data]);
        
        // También recargar todos los artículos para asegurar sincronización
        setTimeout(async () => {
          try {
            await getArticulos();
          } catch (error) {
            console.error('Error recargando artículos después de crear:', error);
          }
        }, 100);
        
        return response.data;
      }
    } catch (err) {
      console.error("Error en useInventory.createArticulo:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un artículo existente
  const updateArticulo = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await articuloService.updateArticulo(id, payload);
      if (response.success) {
        setArticulos((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...response.data } : a))
        );
        return response.data;
      }
    } catch (err) {
      console.error("Error en useInventory.updateArticulo:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un artículo
  const deleteArticulo = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await articuloService.deleteArticulo(id);
      if (response.success) {
        setArticulos((prev) => prev.filter((a) => a.id !== id));
        return true;
      }
    } catch (err) {
      console.error("Error en useInventory.deleteArticulo:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    articulos,
    loading,
    error,
    getArticulos,
    getArticuloById,
    createArticulo,
    updateArticulo,
    deleteArticulo,
  };
};

export default useInventory;
