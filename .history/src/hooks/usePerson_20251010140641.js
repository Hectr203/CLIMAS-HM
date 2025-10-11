import { useState } from 'react';
import personService from '../services/personService';

const usePerson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [persons, setPersons] = useState([]);

  // Obtener lista de empleados
  const getPersons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.getPersons();
      console.log('✅ Respuesta del backend (empleados):', response);
      setPersons(Array.isArray(response) ? response : response?.data || []);
      return response;
    } catch (err) {
      console.error('❌ Error al obtener empleados:', err);
      setError(err);
      setPersons([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo empleado
  const createPerson = async (personData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await personService.createPerson(personData);
      setSuccess(true);
      await getPersons(); // recarga lista
      return response;
    } catch (err) {
      console.error('❌ Error al crear empleado:', err);
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Editar empleado existente
  const editPerson = async (id, personData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await personService.updatePerson(id, personData);
      setSuccess(true);
      await getPersons();
      return response;
    } catch (err) {
      console.error('❌ Error al editar empleado:', err);
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar empleado (opcional)
  const deletePerson = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await personService.deletePerson(id);
      setSuccess(true);
      await getPersons();
      return response;
    } catch (err) {
      console.error('❌ Error al eliminar empleado:', err);
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    persons,
    getPersons,
    createPerson,
    editPerson,
    deletePerson,
    loading,
    error,
    success,
    setPersons
  };
};

export default usePerson;
