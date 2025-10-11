import { useState, useEffect } from "react";
import personService from "../services/personService";

/**
 * Hook personalizado para manejar empleados (personas).
 * Contiene lógica para listar, crear y editar empleados.
 */
const usePerson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [persons, setPersons] = useState([]);

  /** 🔹 Obtener todos los empleados */
  const getPersons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.getPersons();

      // El backend debe devolver { success: true, data: [...] }
      const dataArray = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setPersons(dataArray);
      return dataArray;
    } catch (err) {
      console.error("❌ Error en getPersons:", err);
      setError(err.message || "Error al obtener empleados");
      setPersons([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Crear un nuevo empleado */
  const createPerson = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.createPerson(data);
      setSuccess(true);
      await getPersons(); // Refrescar lista
      setTimeout(() => setSuccess(false), 3000);
      return response;
    } catch (err) {
      console.error("❌ Error en createPerson:", err);
      setError(err.message || "Error al crear empleado");
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Editar empleado existente */
  const editPerson = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.updatePerson(id, data);
      setSuccess(true);
      await getPersons(); // Refrescar lista
      setTimeout(() => setSuccess(false), 3000);
      return response;
    } catch (err) {
      console.error("❌ Error en editPerson:", err);
      setError(err.message || "Error al editar empleado");
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar datos al montar el componente
  useEffect(() => {
    getPersons();
  }, []);

  return {
    persons,
    getPersons,
    createPerson,
    editPerson,
    loading,
    error,
    success,
  };
};

export default usePerson;
