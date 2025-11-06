import { useState } from "react";
import quotationService from "../services/quotationService";

const useQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createQuotation = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.createQuotation(data);
      // console.log eliminado
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
  const getConstructorByCotizacionId = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.getConstructorByCotizacionId(id);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para crear/actualizar revisión
  const upsertRevision = async (revisionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.upsertRevision(revisionData);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener revisión
  const getRevision = async ({ id, idCotizacion }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quotationService.getRevision({ id, idCotizacion });
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
    getConstructorByCotizacionId,
    upsertRevision,
    getRevision,
    loading,
    error,
  };
};

export default useQuotation;
