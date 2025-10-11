import { useState, useEffect } from "react";
import personService from "../services/personService";

const usePerson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [persons, setPersons] = useState([]);

  const getPersons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.getPersons();
      // Asumiendo que el backend devuelve { success: true, data: [...] }
      const dataArray = Array.isArray(response) ? response : response?.data || [];
      setPersons(dataArray);
      return dataArray;
    } catch (err) {
      console.error("Error en getPersons:", err);
      setError(err.message || "Error al obtener empleados");
      setPersons([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPerson = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.createPerson(data);
      setSuccess(true);
      // Refresca la lista automáticamente
      await getPersons();
      // Reset success después de 3s para UX
      setTimeout(() => setSuccess(false), 3000);
      return response;
    } catch (err) {
      console.error("Error en createPerson:", err);
      setError(err.message || "Error al crear empleado");
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editPerson = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.updatePerson(id, data);
      setSuccess(true);
      // Refresca la lista automáticamente
      await getPersons();
      // Reset success después de 3s para UX
      setTimeout(() => setSuccess(false), 3000);
      return response;
    } catch (err) {
      console.error("Error en editPerson:", err);
      setError(err.message || "Error al editar empleado");
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Inicializar carga en mount
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