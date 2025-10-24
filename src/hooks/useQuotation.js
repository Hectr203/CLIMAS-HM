// useQuotation.js
import { useState } from 'react';
import quotationService from '../services/quotationService';

const useQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createQuotation = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.createQuotation(data);
      console.log('Respuesta del backend (cotización creada):', response);
      // Mostrar los datos principales del formulario para verificar
      console.log('Cliente:', data.clientName);
      console.log('Proyecto:', data.projectName);
      console.log('Responsable:', data.assignedTo);
      console.log('Datos completos enviados:', data);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

    const getCotizaciones = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await quotationService.getCotizaciones();
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const getCotizacionById = async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await quotationService.getCotizacionById(id);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    const editCotizacion = async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await quotationService.editCotizacion(id, data);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    };
  const crearConstructor = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.crearConstructor(data);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
      createQuotation,
      getCotizaciones,
      getCotizacionById,
      editCotizacion,
     crearConstructor,
      loading,
      error,
  };
};

export default useQuotation;
