import { useState, useEffect } from 'react';
import opportunityService from '../services/opportunityService';

export function useOpportunity() {
  const [oportunidades, setOportunidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOportunidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunityService.obtenerTodasLasOportunidades();
      // Mapeo los datos del backend a la estructura esperada por el Kanban
      const raw = response.data || [];
      const mapped = raw.map((opp) => ({
        id: opp.id,
        clientName: opp.nombreCliente,
        contactChannel: opp.canalContacto,
        projectType: opp.tipoProyecto,
        salesRep: opp.ejecutivoVentas,
        stage: opp.etapa || 'initial-contact',
        priority: opp.prioridad,
        stageDuration: opp.diasEnEtapa || 1,
        contactInfo: {
          phone: opp.telefono,
          email: opp.email,
          contactPerson: opp.personaContacto,
        },
        projectDetails: {
          description: opp.descripcionProyecto,
          location: opp.ubicacion,
          estimatedBudget: opp.presupuestoEstimado,
          timeline: opp.cronogramaEsperado,
        },
        notes: opp.notasAdicionales,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
      }));
      setOportunidades(mapped);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const crearOportunidad = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunityService.crearOportunidad(data);
      await fetchOportunidades(); // Actualiza la lista después de crear
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOportunidades();
  }, []);

  return {
    oportunidades,
    loading,
    error,
    fetchOportunidades,
    crearOportunidad,
  };
}
