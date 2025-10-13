// src/hooks/usePerson.js
import { useState } from "react";
import personService from "../services/personService";

const usePerson = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getPersons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await personService.getPersons();
      setPersons(Array.isArray(response.data) ? response.data : []);
      return response.data;
    } catch (err) {
      console.error("Error al obtener personas:", err);
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
      await getPersons(); // actualizar lista
      return response.data;
    } catch (err) {
      console.error("Error al crear persona:", err);
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
      await getPersons();
      return response.data;
    } catch (err) {
      console.error("Error al editar persona:", err);
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { persons, getPersons, createPerson, editPerson, loading, error, success, setPersons };
};

export default usePerson;
