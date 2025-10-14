import { useState } from 'react';
import personService from '../services/personService';

const usePerson = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPersons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.getPersons();
      if (response.success && Array.isArray(response.data)) {
        setPersons(response.data);
      } else {
        setPersons([]);
      }
    } catch (err) {
      console.error("Error en usePerson.getPersons:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createPerson = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.createPerson(payload);
      if (response.success) {
        setPersons(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (err) {
      console.error("Error en usePerson.createPerson:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 NUEVA FUNCIÓN PARA ACTUALIZAR EMPLEADO EXISTENTE
  const updatePersonByEmpleadoId = async (empleadoId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.updatePersonByEmpleadoId(empleadoId, payload);
      if (response.success) {
        // Actualiza la lista local sin perder los datos previos
        setPersons(prev =>
          prev.map(p => (p.empleadoId === empleadoId ? { ...p, ...response.data } : p))
        );
        return response.data;
      }
    } catch (err) {
      console.error("Error en usePerson.updatePersonByEmpleadoId:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { persons, loading, error, getPersons, createPerson, updatePersonByEmpleadoId };
};

export default usePerson;
