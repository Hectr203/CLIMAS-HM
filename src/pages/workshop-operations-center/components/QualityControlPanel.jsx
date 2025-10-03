import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QualityControlPanel = ({ workOrders = [], onQualityUpdate, onReportToProjects }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qualityPhotos, setQualityPhotos] = useState([]);
  const [inspectionNotes, setInspectionNotes] = useState('');

  const qualityCheckpoints = [
    {
      id: 'installation_verification',
      name: 'Verificación de instalación',
      description: 'Revisión de montaje y conexiones según especificaciones',
      icon: 'Wrench',
      critical: true
    },
    {
      id: 'function_tests',
      name: 'Pruebas de funcionamiento',
      description: 'Operación del sistema bajo condiciones normales',
      icon: 'Play',
      critical: true
    },
    {
      id: 'visual_inspection',
      name: 'Inspección visual',
      description: 'Revisión de acabados, etiquetado y limpieza',
      icon: 'Eye',
      critical: false
    },
    {
      id: 'technical_documentation',
      name: 'Documentación técnica',
      description: 'Manuales, garantías y certificados completos',
      icon: 'FileText',
      critical: true
    },
    {
      id: 'safety_compliance',
      name: 'Cumplimiento de seguridad',
      description: 'Verificación de normas de seguridad aplicables',
      icon: 'Shield',
      critical: true
    },
    {
      id: 'performance_tests',
      name: 'Pruebas de rendimiento',
      description: 'Medición de parámetros técnicos y eficiencia',
      icon: 'BarChart3',
      critical: false
    }
  ];

  const handleCheckpointUpdate = (workOrderId, checkpointId, passed, notes = '') => {
    const workOrder = workOrders?.find(wo => wo?.id === workOrderId);
    if (!workOrder) return;

    const updatedCheckpoints = workOrder?.qualityControl?.checkpoints?.map(checkpoint => {
      const qualityCheckpoint = qualityCheckpoints?.find(qc => 
        qc?.name?.toLowerCase()?.replace(/\s+/g, '_') === checkpoint?.name?.toLowerCase()?.replace(/\s+/g, '_')
      );
      
      if (qualityCheckpoint?.id === checkpointId) {
        return { 
          ...checkpoint, 
          passed, 
          notes,
          inspectedAt: new Date()?.toISOString(),
          inspector: 'Inspector Actual' // This should come from authentication
        };
      }
      return checkpoint;
    });

    const criticalCheckpoints = qualityCheckpoints?.filter(qc => qc?.critical);
    const passedCritical = updatedCheckpoints?.filter(cp => {
      const qualityCheckpoint = qualityCheckpoints?.find(qc => 
        qc?.name?.toLowerCase()?.replace(/\s+/g, '_') === cp?.name?.toLowerCase()?.replace(/\s+/g, '_')
      );
      return cp?.passed === true && qualityCheckpoint?.critical;
    });

    const hasFailures = updatedCheckpoints?.some(cp => cp?.passed === false);
    const criticalComplete = passedCritical?.length >= criticalCheckpoints?.length;
    
    const status = hasFailures ? 'failed' : 
                  criticalComplete ? 'completed' : 'in_progress';

    onQualityUpdate?.(workOrderId, {
      status,
      checkpoints: updatedCheckpoints,
      photos: qualityPhotos,
      inspector: 'Inspector Actual',
      completedAt: status === 'completed' ? new Date()?.toISOString() : null,
      notes: inspectionNotes
    });

    // Auto-report failures to Projects
    if (hasFailures) {
      const failedCheckpoints = updatedCheckpoints?.filter(cp => cp?.passed === false);
      onReportToProjects?.(workOrderId, 'quality_failure', {
        failedCheckpoints,
        photos: qualityPhotos,
        notes: inspectionNotes,
        inspector: 'Inspector Actual'
      });
    }
  };

  const handleCompleteInspection = (workOrder) => {
    const criticalCheckpoints = qualityCheckpoints?.filter(qc => qc?.critical);
    const passedCritical = workOrder?.qualityControl?.checkpoints?.filter(cp => {
      const qualityCheckpoint = qualityCheckpoints?.find(qc => 
        qc?.name?.toLowerCase()?.replace(/\s+/g, '_') === cp?.name?.toLowerCase()?.replace(/\s+/g, '_')
      );
      return cp?.passed === true && qualityCheckpoint?.critical;
    });

    if (passedCritical?.length < criticalCheckpoints?.length) {
      alert('Por favor completa todos los puntos críticos de control de calidad.');
      return;
    }

    const hasFailures = workOrder?.qualityControl?.checkpoints?.some(cp => cp?.passed === false);
    
    onQualityUpdate?.(workOrder?.id, {
      status: hasFailures ? 'failed' : 'completed',
      checkpoints: workOrder?.qualityControl?.checkpoints,
      photos: qualityPhotos,
      inspector: 'Inspector Actual',
      completedAt: new Date()?.toISOString(),
      notes: inspectionNotes
    });

    // Report completion to Projects
    onReportToProjects?.(workOrder?.id, 'quality_approval', {
      status: hasFailures ? 'rejected' : 'approved',
      checkpoints: workOrder?.qualityControl?.checkpoints,
      photos: qualityPhotos,
      notes: inspectionNotes,
      inspector: 'Inspector Actual'
    });

    setSelectedOrder(null);
    setQualityPhotos([]);
    setInspectionNotes('');
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event?.target?.files || []);
    const photoUrls = files?.map(file => URL.createObjectURL(file));
    setQualityPhotos(prev => [...prev, ...photoUrls]);
  };

  const getCompletionPercentage = (workOrder) => {
    const totalCritical = qualityCheckpoints?.filter(qc => qc?.critical)?.length;
    const completedCritical = workOrder?.qualityControl?.checkpoints?.filter(cp => {
      const qualityCheckpoint = qualityCheckpoints?.find(qc => 
        qc?.name?.toLowerCase()?.replace(/\s+/g, '_') === cp?.name?.toLowerCase()?.replace(/\s+/g, '_')
      );
      return cp?.passed === true && qualityCheckpoint?.critical;
    })?.length || 0;
    
    return Math.round((completedCritical / totalCritical) * 100);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Icon name="CheckCircle" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Control de Calidad</h2>
            <p className="text-sm text-muted-foreground">Inspección y validación de trabajos completados</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Camera">
            Cámara
          </Button>
          <Button variant="outline" size="sm" iconName="FileText">
            Checklist
          </Button>
        </div>
      </div>

      {workOrders?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay inspecciones pendientes</h3>
          <p className="text-muted-foreground">Todas las órdenes están en proceso de fabricación</p>
        </div>
      ) : (
        <div className="space-y-6">
          {workOrders?.map((workOrder) => (
            <div key={workOrder?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{workOrder?.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">{workOrder?.projectReference}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Icon name="User" size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Inspector: {workOrder?.qualityControl?.inspector || 'No asignado'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                    workOrder?.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                    workOrder?.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                    workOrder?.priority === 'Media'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {workOrder?.priority}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {getCompletionPercentage(workOrder)}% Inspeccionado
                  </div>
                  <div className="w-16 bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage(workOrder)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground mb-2">Puntos de Control de Calidad:</h4>
                
                {qualityCheckpoints?.map((checkpoint) => {
                  const workOrderCheckpoint = workOrder?.qualityControl?.checkpoints?.find(cp =>
                    cp?.name?.toLowerCase()?.replace(/\s+/g, '_') === checkpoint?.name?.toLowerCase()?.replace(/\s+/g, '_')
                  );
                  const status = workOrderCheckpoint?.passed;
                  
                  return (
                    <div key={checkpoint?.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      checkpoint?.critical ? 'bg-green-50 border border-green-200' : 'bg-muted'
                    }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        status === true ? 'bg-green-500' :
                        status === false ? 'bg-red-500': checkpoint?.critical ?'bg-green-500' : 'bg-gray-500'
                      }`}>
                        <Icon name={checkpoint?.icon} size={16} color="white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm text-foreground">{checkpoint?.name}</h4>
                          {checkpoint?.critical && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              Crítico
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{checkpoint?.description}</p>
                        {workOrderCheckpoint?.notes && (
                          <p className="text-xs text-blue-600 mt-1">Notas: {workOrderCheckpoint?.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={status === true ? 'default' : 'outline'}
                          onClick={() => handleCheckpointUpdate(workOrder?.id, checkpoint?.id, true)}
                          className="text-xs px-2 py-1"
                        >
                          <Icon name="CheckCircle" size={12} className="mr-1" />
                          Aprobado
                        </Button>
                        <Button
                          size="sm"
                          variant={status === false ? 'destructive' : 'outline'}
                          onClick={() => handleCheckpointUpdate(workOrder?.id, checkpoint?.id, false)}
                          className="text-xs px-2 py-1"
                        >
                          <Icon name="XCircle" size={12} className="mr-1" />
                          Rechazado
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Photo evidence section */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm text-foreground">Evidencia Fotográfica</h4>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" iconName="Camera">
                      Tomar Foto
                    </Button>
                  </label>
                </div>
                
                {qualityPhotos?.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {qualityPhotos?.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Quality evidence ${index + 1}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 w-5 h-5"
                          onClick={() => setQualityPhotos(prev => prev?.filter((_, i) => i !== index))}
                        >
                          <Icon name="X" size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inspection notes */}
              <div className="mt-4">
                <textarea
                  placeholder="Observaciones de la inspección..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e?.target?.value)}
                  className="w-full p-3 border border-border rounded-lg resize-none h-20 text-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Info" size={16} className="text-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Puntos críticos: {qualityCheckpoints?.filter(qc => qc?.critical)?.length}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReportToProjects?.(workOrder?.id, 'quality_update', {
                      checkpoints: workOrder?.qualityControl?.checkpoints,
                      photos: qualityPhotos,
                      notes: inspectionNotes
                    })}
                    iconName="Send"
                  >
                    Reportar Progreso
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCompleteInspection(workOrder)}
                    iconName="CheckCircle"
                    disabled={getCompletionPercentage(workOrder) < 100}
                  >
                    Finalizar Inspección
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QualityControlPanel;