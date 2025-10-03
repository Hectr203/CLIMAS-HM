import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkflowBoard = ({
  workOrders = [],
  onStageUpdate,
  onMaterialReception,
  onSafetyChecklist,
  onManufacturingUpdate,
  onQualityControl,
  onEvidenceSubmission,
  onChangeOrder,
  onReportToProjects,
  onRequestToPurchases
}) => {
  const stages = [
    {
      id: 'material_reception',
      name: 'Recepción de Materiales',
      color: 'bg-blue-500',
      icon: 'Package'
    },
    {
      id: 'safety_attendance',
      name: 'Seguridad y Asistencia',
      color: 'bg-orange-500',
      icon: 'Shield'
    },
    {
      id: 'manufacturing',
      name: 'Fabricación',
      color: 'bg-purple-500',
      icon: 'Wrench'
    },
    {
      id: 'quality_control',
      name: 'Control de Calidad',
      color: 'bg-green-500',
      icon: 'CheckCircle'
    },
    {
      id: 'evidence_submission',
      name: 'Envío de Evidencias',
      color: 'bg-indigo-500',
      icon: 'Camera'
    }
  ];

  const getStatusColor = (workOrder, stage) => {
    if (workOrder?.stage !== stage?.id) return 'border-border';
    
    switch (workOrder?.priority) {
      case 'Crítica': return 'border-red-500 bg-red-50';
      case 'Alta': return 'border-orange-500 bg-orange-50';
      case 'Media': return 'border-yellow-500 bg-yellow-50';
      case 'Baja': return 'border-green-500 bg-green-50';
      default: return 'border-border';
    }
  };

  const handleWorkOrderAction = (workOrder, action) => {
    switch (action) {
      case 'verify_materials':
        onMaterialReception?.(workOrder?.id, { status: 'in_progress' });
        break;
      case 'complete_safety':
        onSafetyChecklist?.(workOrder?.id, { status: 'completed' });
        break;
      case 'update_progress':
        onManufacturingUpdate?.(workOrder?.id, { progress: workOrder?.manufacturing?.progress + 25 });
        break;
      case 'quality_check':
        onQualityControl?.(workOrder?.id, { status: 'in_progress' });
        break;
      case 'submit_evidence':
        onEvidenceSubmission?.(workOrder?.id, { status: 'completed', submittedToProjects: true });
        break;
      default:
        break;
    }
  };

  const renderWorkOrderCard = (workOrder) => (
    <div
      key={workOrder?.id}
      className={`bg-card border rounded-lg p-4 mb-3 card-shadow ${getStatusColor(workOrder, stages?.find(s => s?.id === workOrder?.stage))}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm text-foreground">{workOrder?.orderNumber}</h4>
          <p className="text-xs text-muted-foreground">{workOrder?.projectReference}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          workOrder?.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
          workOrder?.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
          workOrder?.priority === 'Media'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {workOrder?.priority}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={14} className="text-muted-foreground" />
          <div className="flex -space-x-1">
            {workOrder?.assignedTechnicians?.slice(0, 2)?.map((tech, index) => (
              <div
                key={tech?.id}
                className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-medium text-secondary-foreground"
                title={`${tech?.name} - ${tech?.role}`}
              >
                {tech?.name?.charAt(0)}
              </div>
            ))}
            {workOrder?.assignedTechnicians?.length > 2 && (
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                +{workOrder?.assignedTechnicians?.length - 2}
              </div>
            )}
          </div>
        </div>

        {/* Stage-specific info */}
        {workOrder?.stage === 'material_reception' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Materiales:</span>
              <span className={`text-xs font-medium ${
                workOrder?.materialsReceived?.status === 'completed' ? 'text-green-600' :
                workOrder?.materialsReceived?.status === 'in_progress'? 'text-orange-600' : 'text-red-600'
              }`}>
                {workOrder?.materialsReceived?.items?.filter(item => item?.received)?.length || 0}/{workOrder?.materialsReceived?.items?.length || 0}
              </span>
            </div>
            {workOrder?.materialsReceived?.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWorkOrderAction(workOrder, 'verify_materials')}
                className="w-full text-xs"
              >
                Verificar Materiales
              </Button>
            )}
          </div>
        )}

        {workOrder?.stage === 'safety_attendance' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Seguridad:</span>
              <span className={`text-xs font-medium ${
                workOrder?.safetyChecklist?.status === 'completed' ? 'text-green-600' :
                workOrder?.safetyChecklist?.status === 'in_progress'? 'text-orange-600' : 'text-red-600'
              }`}>
                {workOrder?.safetyChecklist?.items?.filter(item => item?.checked)?.length || 0}/{workOrder?.safetyChecklist?.items?.length || 0}
              </span>
            </div>
            {workOrder?.safetyChecklist?.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWorkOrderAction(workOrder, 'complete_safety')}
                className="w-full text-xs"
              >
                Completar Checklist
              </Button>
            )}
          </div>
        )}

        {workOrder?.stage === 'manufacturing' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progreso:</span>
              <span className="text-xs font-medium text-foreground">{workOrder?.manufacturing?.progress || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${workOrder?.manufacturing?.progress || 0}%` }}
              />
            </div>
            {workOrder?.manufacturing?.progress < 100 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWorkOrderAction(workOrder, 'update_progress')}
                className="w-full text-xs"
              >
                Actualizar Progreso
              </Button>
            )}
          </div>
        )}

        {workOrder?.stage === 'quality_control' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Calidad:</span>
              <span className={`text-xs font-medium ${
                workOrder?.qualityControl?.status === 'completed' ? 'text-green-600' :
                workOrder?.qualityControl?.status === 'in_progress'? 'text-orange-600' : 'text-red-600'
              }`}>
                {workOrder?.qualityControl?.checkpoints?.filter(cp => cp?.passed === true)?.length || 0}/{workOrder?.qualityControl?.checkpoints?.length || 0}
              </span>
            </div>
            {workOrder?.qualityControl?.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWorkOrderAction(workOrder, 'quality_check')}
                className="w-full text-xs"
              >
                Inspección
              </Button>
            )}
          </div>
        )}

        {workOrder?.stage === 'evidence_submission' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Evidencias:</span>
              <span className={`text-xs font-medium ${
                workOrder?.evidenceSubmission?.submittedToProjects ? 'text-green-600' : 'text-orange-600'
              }`}>
                {workOrder?.evidenceSubmission?.photos?.length || 0} fotos, {workOrder?.evidenceSubmission?.documents?.length || 0} docs
              </span>
            </div>
            {!workOrder?.evidenceSubmission?.submittedToProjects && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleWorkOrderAction(workOrder, 'submit_evidence')}
                className="w-full text-xs"
              >
                Enviar a Proyectos
              </Button>
            )}
          </div>
        )}

        {/* Change orders indicator */}
        {workOrder?.changeOrders?.length > 0 && (
          <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-border">
            <Icon name="AlertTriangle" size={12} className="text-warning" />
            <span className="text-xs text-warning">{workOrder?.changeOrders?.length} cambio(s)</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="Workflow" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tablero de Flujo Operativo</h2>
            <p className="text-sm text-muted-foreground">Kanban del flujo de trabajo del taller</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Actualizar
          </Button>
          <Button variant="outline" size="sm" iconName="Filter">
            Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {stages?.map((stage) => {
          const stageWorkOrders = workOrders?.filter(wo => wo?.stage === stage?.id) || [];
          
          return (
            <div key={stage?.id} className="space-y-3">
              <div className={`${stage?.color} text-white p-3 rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name={stage?.icon} size={16} color="white" />
                    <h3 className="font-medium text-sm">{stage?.name}</h3>
                  </div>
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">{stageWorkOrders?.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stageWorkOrders?.map(workOrder => renderWorkOrderCard(workOrder))}
                
                {stageWorkOrders?.length === 0 && (
                  <div className="text-center py-8">
                    <Icon name={stage?.icon} size={32} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No hay órdenes en esta etapa</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowBoard;