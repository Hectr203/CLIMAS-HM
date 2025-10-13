// src/hooks/usePerson.js
import { useState } from 'react';
import personService from '../services/personService';

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
      console.log('✅ Respuesta backend (empleados):', response);
      setPersons(Array.isArray(response) ? response : response?.data || []);
      return response;
    } catch (err) {
      setError(err);
      setPersons([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPerson = async (personData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await personService.createPerson(personData);
      setSuccess(true);

      if (response && response.success && response.data) {
        setPersons(prev => [...prev, response.data]);
      }
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editPerson = async (id, personData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await personService.updatePerson(id, personData);
      setSuccess(true);

      if (response && response.success && response.data) {
        setPersons(prev =>
          prev.map(p =>
            (p.id === id || p._id === id)
              ? { ...p, ...response.data, id: p.id || p._id }
              : p
          )
        );
      } else if (response && response.success) {
        setPersons(prev =>
          prev.map(p =>
            (p.id === id || p._id === id)
              ? { ...p, ...personData, id: p.id || p._id }
              : p
          )
        );
      }
      return response;
    } catch (err) {
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
    loading,
    error,
    success,
    setPersons
  };
};

export default usePerson;
