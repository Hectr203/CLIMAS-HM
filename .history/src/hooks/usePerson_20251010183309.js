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
      // Tu API devuelve { success: true, data: [...] }
      if (response.success && Array.isArray(response.data)) {
        setPersons(response.data);
      } else {
        setPersons([]);
      }
    } catch (err) {
      console.error("❌ Error en usePerson.getPersons:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { persons, loading, error, getPersons };
};

export default usePerson;
