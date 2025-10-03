import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WorkflowStatus = ({ project, workflowSteps, currentStep, onStepUpdate }) => {
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionStep, setDecisionStep] = useState(null);

  const decisionPoints = [
    'catalog-check',
    'quotation-validation', 
    'client-approval',
    'payment-confirmation'
  ];

  const getStepStatus = (stepId) => {
    const currentIndex = workflowSteps?.findIndex(step => step?.id === currentStep);
    const stepIndex = workflowSteps?.findIndex(step => step?.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-400 bg-gray-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const handleStepClick = (stepId) => {
    if (decisionPoints?.includes(stepId)) {
      setDecisionStep(stepId);
      setShowDecisionModal(true);
    } else {
      onStepUpdate(project?.id, stepId);
    }
  };

  const handleDecision = (decision) => {
    if (decisionStep === 'catalog-check') {
      // Si el cliente proporciona catálogo, ir a cotización desde catálogo
      // Si no, ir a identificación de materiales
      const nextStep = decision ? 'quotation-dev' : 'material-identification';
      onStepUpdate(project?.id, nextStep);
    } else if (decisionStep === 'quotation-validation') {
      // Si es validada, continuar; si no, ajustar
      const nextStep = decision ? 'client-proposal' : 'quotation-dev';
      onStepUpdate(project?.id, nextStep);
    } else if (decisionStep === 'client-approval') {
      // Si aprueba, búsqueda proveedores; si no, ajustes
      const nextStep = decision ? 'provider-search' : 'quotation-dev';
      onStepUpdate(project?.id, nextStep);
    }
    setShowDecisionModal(false);
    setDecisionStep(null);
  };

  const getDecisionLabels = (stepId) => {
    switch (stepId) {
      case 'catalog-check':
        return { yes: 'Sí, tiene catálogo', no: 'No, usar planos' };
      case 'quotation-validation':
        return { yes: 'Validada', no: 'Requiere ajustes' };
      case 'client-approval':
        return { yes: 'Aprobada', no: 'Requiere cambios' };
      case 'payment-confirmation':
        return { yes: 'Pagos al día', no: 'Pagos pendientes' };
      default:
        return { yes: 'Sí', no: 'No' };
    }
  };

  const getStepNotes = (stepId) => {
    switch (stepId) {
      case 'client-info':
        return 'Recibir catálogos, planos, ubicación de obra o requerimientos del cliente';
      case 'document-org':
        return 'Crear carpetas digitales y organizar archivos manualmente';
      case 'catalog-check':
        return 'Punto de decisión: ¿El cliente proporciona catálogo?';
      case 'quotation-dev':
        return 'Incluir % instalación, piezas, viáticos, personal. Condiciones: 30% anticipo, 70% avance';
      case 'quotation-validation':
        return 'Validación por Ventas/Martín antes de envío';
      case 'client-proposal':
        return 'Envío por correo o WhatsApp al cliente';
      case 'client-approval':
        return 'Esperar aprobación del cliente o negociar ajustes';
      case 'provider-search':
        return 'Buscar proveedores en zona de obra o contactos conocidos';
      case 'progress-control':
        return 'Control de avances mediante fotografías con metadatos';
      case 'payment-confirmation':
        return 'Confirmar que no existan pagos pendientes';
      case 'final-documentation':
        return 'Para obras pequeñas: contrato, facturas, comprobantes, certificaciones';
      case 'warranty-continuity':
        return 'Gestión de garantía según tipo de proyecto';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Diagram */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Flujo de Actividades - Área de Proyectos
            </h3>
            <p className="text-muted-foreground text-sm">
              Desde Inicio → Desarrollo → Cierre
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="RotateCcw"
              iconPosition="left"
            >
              Reiniciar
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Workflow Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps?.map((step, index) => {
            const status = getStepStatus(step?.id);
            const isDecisionPoint = decisionPoints?.includes(step?.id);
            
            return (
              <div
                key={step?.id}
                onClick={() => handleStepClick(step?.id)}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  status === 'current' ?'border-primary bg-primary/5 shadow-md' 
                    : status === 'completed' ?'border-green-300 bg-green-50' :'border-border bg-background hover:border-primary/50'
                } ${isDecisionPoint ? 'border-yellow-300 bg-yellow-50' : ''}`}
              >
                {/* Step Number */}
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-background border-2 border-current flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                {/* Decision Diamond Indicator */}
                {isDecisionPoint && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rotate-45 border border-yellow-500"></div>
                )}

                {/* Step Content */}
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                    <Icon
                      name={step?.icon}
                      size={18}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground mb-1">
                      {step?.label}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {getStepNotes(step?.id)}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between mt-3">
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                    {status === 'completed' && 'Completado'}
                    {status === 'current' && 'Actual'}
                    {status === 'pending' && 'Pendiente'}
                  </div>
                  
                  {status === 'completed' && (
                    <Icon name="CheckCircle" size={14} className="text-green-600" />
                  )}
                  {status === 'current' && (
                    <Icon name="Play" size={14} className="text-blue-600" />
                  )}
                  {isDecisionPoint && (
                    <Icon name="HelpCircle" size={14} className="text-yellow-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-border">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-4 h-4 rounded bg-background border-2 border-gray-400"></div>
            <span className="text-muted-foreground">Inicio/Fin</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400"></div>
            <span className="text-muted-foreground">Actividad/Tarea</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-yellow-400 rotate-45 border border-yellow-500"></div>
            <span className="text-muted-foreground">Decisión clave</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Icon name="FileText" size={16} className="text-orange-600" />
            <span className="text-muted-foreground">Aclaración/Política</span>
          </div>
        </div>
      </div>

      {/* Current Step Details */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon
              name={workflowSteps?.find(step => step?.id === currentStep)?.icon || 'Circle'}
              size={24}
              className="text-primary"
            />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground">
              {workflowSteps?.find(step => step?.id === currentStep)?.label}
            </h4>
            <p className="text-muted-foreground">
              {getStepNotes(currentStep)}
            </p>
          </div>
        </div>

        {/* Step Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {decisionPoints?.includes(currentStep) ? (
              <>
                <Button
                  variant="success"
                  size="sm"
                  iconName="CheckCircle"
                  iconPosition="left"
                  onClick={() => handleDecision(true)}
                >
                  {getDecisionLabels(currentStep)?.yes}
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  iconName="XCircle"
                  iconPosition="left"
                  onClick={() => handleDecision(false)}
                >
                  {getDecisionLabels(currentStep)?.no}
                </Button>
              </>
            ) : (
              <Button
                variant="success"
                size="sm"
                iconName="ArrowRight"
                iconPosition="right"
                onClick={() => {
                  const currentIndex = workflowSteps?.findIndex(step => step?.id === currentStep);
                  const nextStep = workflowSteps?.[currentIndex + 1];
                  if (nextStep) {
                    onStepUpdate(project?.id, nextStep?.id);
                  }
                }}
              >
                Completar Paso
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Paso {workflowSteps?.findIndex(step => step?.id === currentStep) + 1} de {workflowSteps?.length}
          </div>
        </div>
      </div>

      {/* Project Timeline */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Cronología del Proyecto</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <Icon name="Calendar" size={16} className="text-blue-600" />
            <span className="text-muted-foreground">Creado:</span>
            <span className="font-medium">{project?.createdDate}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Icon name="Clock" size={16} className="text-orange-600" />
            <span className="text-muted-foreground">Última actualización:</span>
            <span className="font-medium">{project?.lastUpdated}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Icon name="User" size={16} className="text-green-600" />
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-medium">{project?.client?.name}</span>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Icon name="HelpCircle" size={20} className="text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Punto de Decisión</h4>
                <p className="text-sm text-muted-foreground">
                  {workflowSteps?.find(step => step?.id === decisionStep)?.label}
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              {getStepNotes(decisionStep)}
            </p>

            <div className="flex space-x-3">
              <Button
                variant="success"
                className="flex-1"
                onClick={() => handleDecision(true)}
              >
                {getDecisionLabels(decisionStep)?.yes}
              </Button>
              <Button
                variant="warning"
                className="flex-1"
                onClick={() => handleDecision(false)}
              >
                {getDecisionLabels(decisionStep)?.no}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3"
              onClick={() => setShowDecisionModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStatus;