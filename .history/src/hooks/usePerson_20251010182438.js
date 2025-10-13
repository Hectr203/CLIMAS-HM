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
      const result = await personService.getPersons();
      if (result?.success && Array.isArray(result.data)) {
        setPersons(result.data);
        return result.data;
      } else {
        console.warn("⚠️ Estructura inesperada en respuesta:", result);
        setPersons([]);
        return [];
      }
    } catch (err) {
      console.error("❌ Error al obtener personas:", err);
      setError(err);
      setPersons([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createPerson = async (personData) => {
    console.log("📤 Enviando a API:", personData);
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await personService.createPerson(personData);
      console.log("📥 Respuesta API:", response);
      setSuccess(true);
      await getPersons();
      return response;
    } catch (err) {
      console.error("❌ Error al crear persona:", err);
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editPerson = async (id, personData) => {
    console.log("✏️ Editando persona:", id, personData);
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await personService.updatePerson(id, personData);
      setSuccess(true);
      await getPersons();
      return response;
    } catch (err) {
      console.error("❌ Error al editar persona:", err);
      setError(err);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    persons,
    loading,
    error,
    success,
    getPersons,
    createPerson,
    editPerson,
    setPersons,
    refresh: getPersons
  };
};

export default usePerson;
