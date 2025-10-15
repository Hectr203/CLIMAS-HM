// hooks/useProyecto.js
import { useState } from 'react';
import proyectoService from '../services/proyectoService';

const useProyecto = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Obtener todos los proyectos
  const getProyectos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await proyectoService.getProyectos();
      if (response.success && Array.isArray(response.data)) {
        setProyectos(response.data);
      } else {
        setProyectos([]);
      }
    } catch (err) {
      console.error("Error en useProyecto.getProyectos:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Obtener un proyecto por ID
  const getProyectoById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await proyectoService.getProyectoById(id);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error("Error en useProyecto.getProyectoById:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear un nuevo proyecto
  const createProyecto = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await proyectoService.createProyecto(payload);
      if (response.success) {
        setProyectos((prev) => [...prev, response.data]);
        return response.data;
      }
    } catch (err) {
      console.error("Error en useProyecto.createProyecto:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Actualizar un proyecto existente
  const updateProyecto = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await proyectoService.updateProyecto(id, payload);
      if (response.success) {
        setProyectos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...response.data } : p))
        );
        return response.data;
      }
    } catch (err) {
      console.error("Error en useProyecto.updateProyecto:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Eliminar un proyecto
  const deleteProyecto = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await proyectoService.deleteProyecto(id);
      if (response.success) {
        setProyectos((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
    } catch (err) {
      console.error("Error en useProyecto.deleteProyecto:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    proyectos,
    loading,
    error,
    getProyectos,
    getProyectoById,
    createProyecto,
    updateProyecto,
    deleteProyecto,
  };
};

export default useProyecto;
