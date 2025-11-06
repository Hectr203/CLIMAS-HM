import React, { useEffect, useState } from 'react';
import useQuotation from '../../../hooks/useQuotation';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RevisionHistory = ({ quotation }) => {
  const { getRevision } = useQuotation();
  const [revisionData, setRevisionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState({});

  const toggleArea = (area) => {
    setExpandedAreas(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };

  useEffect(() => {
    if (quotation?.id) {
      setLoading(true);
      getRevision({ idCotizacion: quotation.id })
        .then(response => {
          if (response?.areasRevision) {
            const formattedData = {
              success: true,
              data: [response]
            };
            setRevisionData(formattedData);
          } else {
            setRevisionData(null);
          }
        })
        .catch((error) => {
          console.error('Error al obtener revisiones:', error);
          setRevisionData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setRevisionData(null);
    }
  }, [quotation?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" className="animate-spin" size={24} />
        <span className="ml-2">Cargando revisiones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Historial de Revisiones</h3>
        <div className="text-sm text-muted-foreground">
          Versión actual: 1.0
        </div>
      </div>

      {/* Timeline of Revisions */}
      <div className="space-y-6">
        {revisionData?.data?.[0]?.areasRevision ? (
          Object.entries(revisionData.data[0].areasRevision)
            .sort(([a], [b]) => {
              if (a === '_comentariosGenerales') return 1;
              if (b === '_comentariosGenerales') return -1;
              return a.localeCompare(b);
            })
            .map(([area, revisiones]) => (
              <div key={area} className="bg-card border rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleArea(area)}
                  className="w-full bg-muted/10 px-4 py-3 border-b hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Icon name={
                        area === "Precios y Costos" ? "DollarSign" :
                        area === "Alcance y Supuestos" ? "FileText" :
                        area === "Cronograma" ? "Calendar" :
                        area === "Aspectos Técnicos" ? "Tool" :
                        area === "_comentariosGenerales" ? "MessageCircle" : "Folder"
                      } size={16} />
                      <span>{area === "_comentariosGenerales" ? "Comentarios Generales" : area}</span>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {Object.keys(revisiones).length} {Object.keys(revisiones).length === 1 ? 'revisión' : 'revisiones'}
                      </span>
                      <Icon 
                        name={expandedAreas[area] ? "ChevronUp" : "ChevronDown"} 
                        size={16} 
                        className="text-muted-foreground"
                      />
                    </div>
                  </div>
                </button>
                
                <div className={`divide-y ${!expandedAreas[area] ? 'hidden' : ''}`}>
                  {Object.entries(revisiones).map(([fecha, revision]) => (
                    <div key={fecha} className="p-4 hover:bg-muted/5 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {revision.revisor && (
                            <span className="text-sm font-medium text-foreground">
                              {revision.revisor}
                            </span>
                          )}
                          {revision.estado && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              revision.estado === "Actualizado" ? "bg-green-100 text-green-700" :
                              revision.estado === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {revision.estado}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(revision.fecha)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {revision.descripcion || revision.comentarios}
                      </p>
                      {revision.revisado !== undefined && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                          <Icon name={revision.revisado ? "CheckCircle" : "Clock"} size={12} />
                          <span>{revision.revisado ? "Revisado" : "Pendiente de revisión"}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-8">
            <Icon name="GitBranch" size={32} className="text-muted-foreground mx-auto mb-2" />
            <h4 className="font-medium text-foreground mb-1">Sin revisiones</h4>
            <p className="text-sm text-muted-foreground">
              Las revisiones aparecerán aquí cuando se realicen cambios
            </p>
          </div>
        )}
      </div>

      {/* Revision Statistics */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium mb-3">Estadísticas de Revisión</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Icon name="GitCommit" size={16} className="text-muted-foreground" />
            <span>Total de revisiones: {
              revisionData?.data?.[0]?.areasRevision ? 
              Object.keys(revisionData.data[0].areasRevision).length : 0
            }</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} className="text-muted-foreground" />
            <span>Última actualización: {formatDate(revisionData?.data?.[0]?.fechaActualizacion)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <span>Fecha creación: {formatDate(revisionData?.data?.[0]?.fechaCreacion)}</span>
          </div>
        </div>
      </div>

      {/* Change Tracking */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Shield" size={16} className="text-green-600" />
          <span className="font-medium text-green-800">Trazabilidad Completa</span>
        </div>
        <p className="text-sm text-green-700">
          Todos los cambios son registrados automáticamente para mantener un historial completo de la cotización.
        </p>
      </div>
    </div>
  );
};

export default RevisionHistory;