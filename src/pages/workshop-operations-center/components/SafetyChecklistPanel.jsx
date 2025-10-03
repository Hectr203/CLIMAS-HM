import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const SafetyChecklistPanel = ({ workOrders = [], onSafetyUpdate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checklistNotes, setChecklistNotes] = useState('');

  const safetyItems = [
    {
      id: 'ppe_complete',
      name: 'EPP Completo',
      description: 'Casco, gafas, guantes, calzado de seguridad',
      icon: 'Shield',
      required: true
    },
    {
      id: 'tools_condition',
      name: 'Herramientas en buen estado',
      description: 'Verificación de herramientas y equipos',
      icon: 'Wrench',
      required: true
    },
    {
      id: 'work_area_clear',
      name: 'Área de trabajo despejada',
      description: 'Espacio libre de obstáculos y riesgos',
      icon: 'MapPin',
      required: true
    },
    {
      id: 'certifications_valid',
      name: 'Certificaciones vigentes',
      description: 'Certificados de trabajo en altura, espacios confinados, etc.',
      icon: 'Award',
      required: true
    },
    {
      id: 'emergency_procedures',
      name: 'Procedimientos de emergencia',
      description: 'Conocimiento de rutas de evacuación y primeros auxilios',
      icon: 'AlertCircle',
      required: true
    },
    {
      id: 'communication_devices',
      name: 'Dispositivos de comunicación',
      description: 'Radios, teléfonos de emergencia funcionando',
      icon: 'Phone',
      required: false
    }
  ];

  const handleChecklistUpdate = (workOrderId, itemId, checked) => {
    const workOrder = workOrders?.find(wo => wo?.id === workOrderId);
    if (!workOrder) return;

    const updatedItems = workOrder?.safetyChecklist?.items?.map(item =>
      item?.name?.toLowerCase()?.replace(/\s+/g, '_') === itemId
        ? { ...item, checked }
        : item
    );

    const requiredItems = safetyItems?.filter(item => item?.required);
    const completedRequired = updatedItems?.filter(item => {
      const safetyItem = safetyItems?.find(si => 
        si?.name?.toLowerCase()?.replace(/\s+/g, '_') === item?.name?.toLowerCase()?.replace(/\s+/g, '_')
      );
      return item?.checked && safetyItem?.required;
    });

    const isCompleted = completedRequired?.length >= requiredItems?.length;

    onSafetyUpdate?.(workOrderId, {
      status: isCompleted ? 'completed' : 'in_progress',
      items: updatedItems,
      completedAt: isCompleted ? new Date()?.toISOString() : null,
      notes: checklistNotes
    });
  };

  const handleCompleteChecklist = (workOrder) => {
    const requiredItems = safetyItems?.filter(item => item?.required);
    const checkedRequired = workOrder?.safetyChecklist?.items?.filter(item => {
      const safetyItem = safetyItems?.find(si => 
        si?.name?.toLowerCase()?.replace(/\s+/g, '_') === item?.name?.toLowerCase()?.replace(/\s+/g, '_')
      );
      return item?.checked && safetyItem?.required;
    });

    if (checkedRequired?.length < requiredItems?.length) {
      alert('Por favor completa todos los elementos obligatorios de seguridad antes de continuar.');
      return;
    }

    onSafetyUpdate?.(workOrder?.id, {
      status: 'completed',
      items: workOrder?.safetyChecklist?.items,
      completedAt: new Date()?.toISOString(),
      notes: checklistNotes
    });

    setSelectedOrder(null);
    setChecklistNotes('');
  };

  const getCompletionPercentage = (workOrder) => {
    const totalRequired = safetyItems?.filter(item => item?.required)?.length;
    const completedRequired = workOrder?.safetyChecklist?.items?.filter(item => {
      const safetyItem = safetyItems?.find(si => 
        si?.name?.toLowerCase()?.replace(/\s+/g, '_') === item?.name?.toLowerCase()?.replace(/\s+/g, '_')
      );
      return item?.checked && safetyItem?.required;
    })?.length || 0;
    
    return Math.round((completedRequired / totalRequired) * 100);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Icon name="Shield" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Checklist de Seguridad</h2>
            <p className="text-sm text-muted-foreground">Verificación obligatoria antes de iniciar trabajos</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="AlertTriangle">
            Incidencias
          </Button>
          <Button variant="outline" size="sm" iconName="FileText">
            Manual
          </Button>
        </div>
      </div>

      {workOrders?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Shield" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay checklists pendientes</h3>
          <p className="text-muted-foreground">Todas las verificaciones de seguridad están completas</p>
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
                    <div className="flex -space-x-1">
                      {workOrder?.assignedTechnicians?.map((tech, index) => (
                        <div
                          key={tech?.id}
                          className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-medium text-secondary-foreground border-2 border-background"
                          title={`${tech?.name} - ${tech?.role}`}
                        >
                          {tech?.name?.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Técnicos asignados</span>
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
                    {getCompletionPercentage(workOrder)}% Completo
                  </div>
                  <div className="w-16 bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionPercentage(workOrder)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground mb-2">Lista de Verificación de Seguridad:</h4>
                
                {safetyItems?.map((safetyItem) => {
                  const workOrderItem = workOrder?.safetyChecklist?.items?.find(item =>
                    item?.name?.toLowerCase()?.replace(/\s+/g, '_') === safetyItem?.id
                  );
                  const isChecked = workOrderItem?.checked || false;
                  
                  return (
                    <div key={safetyItem?.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      safetyItem?.required ? 'bg-orange-50 border border-orange-200' : 'bg-muted'
                    }`}>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Checkbox
                          checked={isChecked}
                          onChange={(checked) => handleChecklistUpdate(workOrder?.id, safetyItem?.id, checked)}
                          className="mt-0.5"
                        />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isChecked ? 'bg-green-500' : safetyItem?.required ? 'bg-orange-500' : 'bg-gray-500'
                        }`}>
                          <Icon name={safetyItem?.icon} size={16} color="white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm text-foreground">{safetyItem?.name}</h4>
                          {safetyItem?.required && (
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                              Obligatorio
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{safetyItem?.description}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {isChecked ? (
                          <Icon name="CheckCircle" size={20} className="text-green-500" />
                        ) : (
                          <Icon name="Circle" size={20} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes section */}
              <div className="mt-4">
                <textarea
                  placeholder="Observaciones de seguridad..."
                  value={checklistNotes}
                  onChange={(e) => setChecklistNotes(e?.target?.value)}
                  className="w-full p-3 border border-border rounded-lg resize-none h-20 text-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Info" size={16} className="text-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    Elementos obligatorios: {safetyItems?.filter(item => item?.required)?.length}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="AlertTriangle"
                    disabled
                  >
                    Reportar Incidencia
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCompleteChecklist(workOrder)}
                    iconName="CheckCircle"
                    disabled={getCompletionPercentage(workOrder) < 100}
                  >
                    Aprobar Seguridad
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

export default SafetyChecklistPanel;