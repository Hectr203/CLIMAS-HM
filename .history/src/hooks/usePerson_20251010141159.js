import { useState } from "react";
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

  const createPerson = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.createPerson(data);
      setSuccess(true);
      await getPersons();
      return response;
    } catch (err) {
      setError(err);
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
      await getPersons();
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
  };
};

export default usePerson;
