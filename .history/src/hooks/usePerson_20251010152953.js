import { useState } from 'react';
import personService from '../services/personService';

const usePerson = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [people, setPeople] = useState([]);

  const getPeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.getPeople();
      console.log('Respuesta del backend (empleados):', response);
      setPeople(Array.isArray(response) ? response : response?.data || []);
      return response;
    } catch (err) {
      setError(err);
      setPeople([]);
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
      await getPeople();
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
      await getPeople();
      return response;
    } catch (err) {
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { people, getPeople, createPerson, editPerson, loading, error, success, setPeople };
};

export default usePerson;
