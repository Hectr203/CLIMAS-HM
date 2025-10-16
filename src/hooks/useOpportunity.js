import { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import opportunityService from '../services/opportunityService';

export function useOpportunity() {
  const { showOperationSuccess, showHttpError } = useNotifications();
  const [oportunidades, setOportunidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOportunidades = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunityService.obtenerTodasLasOportunidades();
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
        quotationData: opp.quotationData || {
          scope: '',
          assumptions: [],
          timeline: '',
          conditions: '',
          materials: [],
          riskAssessment: 'low',
          extraCosts: [],
          totalAmount: 0,
          validity: '30 días'
        },
        contractualInfo: opp.contractualInfo || {
          paymentConditions: '',
          billingData: {
            businessName: '',
            rfc: '',
            address: ''
          },
          deliverySchedule: []
        },
        notes: opp.notasAdicionales,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
      }));
      setOportunidades(mapped);
    } catch (err) {
      setError(err);
      // No mostrar notificación, solo actualizar el estado de error
    } finally {
      setLoading(false);
    }
  };

  const crearOportunidad = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunityService.crearOportunidad(data);
      await fetchOportunidades();
      showOperationSuccess('Oportunidad guardada exitosamente');
      return response;
    } catch (err) {
      setError(err);
      showHttpError('Error al guardar oportunidad');
      throw err;
    } finally {
      setLoading(false);
    }
    };

    const actualizarOportunidad = async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await opportunityService.actualizarOportunidad(id, data);
        await fetchOportunidades();
        showOperationSuccess('Oportunidad actualizada exitosamente');
        return response;
      } catch (err) {
        setError(err);
        showHttpError('Error al actualizar oportunidad');
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
     actualizarOportunidad,
  };
}
