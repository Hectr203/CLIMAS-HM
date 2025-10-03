import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ChangeOrderPanel = ({ workOrders = [], onChangeOrder, onReportToProjects }) => {
  const [selectedOrder, setSelectedOrder] = useState('');
  const [changeType, setChangeType] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [impactAssessment, setImpactAssessment] = useState('');
  const [requestedBy, setRequestedBy] = useState('');

  const changeTypes = [
    { value: 'client', label: 'Cambio del Cliente', icon: 'User', color: 'text-blue-600' },
    { value: 'engineering', label: 'Cambio de Ingeniería', icon: 'Settings', color: 'text-purple-600' },
    { value: 'material', label: 'Cambio de Materiales', icon: 'Package', color: 'text-orange-600' },
    { value: 'safety', label: 'Requerimiento de Seguridad', icon: 'Shield', color: 'text-red-600' },
    { value: 'quality', label: 'Mejora de Calidad', icon: 'CheckCircle', color: 'text-green-600' },
    { value: 'technical', label: 'Ajuste Técnico', icon: 'Wrench', color: 'text-gray-600' }
  ];

  const handleSubmitChangeOrder = () => {
    if (!selectedOrder || !changeType || !changeDescription || !requestedBy) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const changeOrderData = {
      id: Date.now(),
      type: changeType,
      description: changeDescription,
      reason: changeReason,
      impact: impactAssessment,
      requestedBy: requestedBy,
      date: new Date()?.toISOString(),
      status: 'pending_approval',
      registeredBy: 'Workshop Team'
    };

    onChangeOrder?.(parseInt(selectedOrder), changeOrderData);

    // Report change order to Projects
    onReportToProjects?.(parseInt(selectedOrder), 'change_order', changeOrderData);

    // Reset form
    setSelectedOrder('');
    setChangeType('');
    setChangeDescription('');
    setChangeReason('');
    setImpactAssessment('');
    setRequestedBy('');
  };

  const getChangeTypeInfo = (type) => {
    return changeTypes?.find(ct => ct?.value === type) || changeTypes?.[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAllChangeOrders = () => {
    return workOrders?.reduce((allChanges, workOrder) => {
      if (workOrder?.changeOrders?.length > 0) {
        return [...allChanges, ...workOrder?.changeOrders?.map(change => ({
          ...change,
          workOrderNumber: workOrder?.orderNumber,
          workOrderId: workOrder?.id,
          projectReference: workOrder?.projectReference
        }))];
      }
      return allChanges;
    }, []) || [];
  };

  const allChangeOrders = getAllChangeOrders();

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Icon name="AlertTriangle" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Gestión de Cambios</h2>
            <p className="text-sm text-muted-foreground">Registro y seguimiento de órdenes de cambio</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="FileText">
            Bitácora Digital
          </Button>
          <Button variant="outline" size="sm" iconName="History">
            Historial
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Order Registration Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Registrar Nueva Orden de Cambio</h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Orden de Trabajo *
            </label>
            <Select
              value={selectedOrder}
              onChange={setSelectedOrder}
              placeholder="Seleccionar orden de trabajo..."
            >
              {workOrders?.map((workOrder) => (
                <option key={workOrder?.id} value={workOrder?.id}>
                  {workOrder?.orderNumber} - {workOrder?.projectReference}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Cambio *
            </label>
            <Select
              value={changeType}
              onChange={setChangeType}
              placeholder="Seleccionar tipo de cambio..."
            >
              {changeTypes?.map((type) => (
                <option key={type?.value} value={type?.value}>
                  {type?.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Solicitado por *
            </label>
            <Input
              value={requestedBy}
              onChange={(e) => setRequestedBy(e?.target?.value)}
              placeholder="Nombre del solicitante..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción del Cambio *
            </label>
            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e?.target?.value)}
              placeholder="Describe detalladamente el cambio solicitado..."
              className="w-full p-3 border border-border rounded-lg resize-none h-20 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Justificación
            </label>
            <textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e?.target?.value)}
              placeholder="Razón o justificación del cambio..."
              className="w-full p-3 border border-border rounded-lg resize-none h-16 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Evaluación de Impacto
            </label>
            <textarea
              value={impactAssessment}
              onChange={(e) => setImpactAssessment(e?.target?.value)}
              placeholder="Impacto en cronograma, costos, recursos, etc..."
              className="w-full p-3 border border-border rounded-lg resize-none h-16 text-sm"
            />
          </div>

          <Button
            onClick={handleSubmitChangeOrder}
            variant="default"
            iconName="Send"
            iconPosition="left"
            className="w-full"
          >
            Registrar Orden de Cambio
          </Button>
        </div>

        {/* Change Orders History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Historial de Cambios</h3>
          
          {allChangeOrders?.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-lg">
              <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-foreground mb-2">No hay órdenes de cambio registradas</h4>
              <p className="text-muted-foreground text-sm">Las órdenes de cambio aparecerán aquí una vez registradas</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allChangeOrders
                ?.sort((a, b) => new Date(b?.date) - new Date(a?.date))
                ?.map((changeOrder, index) => {
                const typeInfo = getChangeTypeInfo(changeOrder?.type);
                
                return (
                  <div key={changeOrder?.id || index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <Icon name={typeInfo?.icon} size={16} color="white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">
                            {changeOrder?.workOrderNumber}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {changeOrder?.projectReference}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(changeOrder?.status)}`}>
                        {changeOrder?.status === 'pending_approval' ? 'Pendiente Aprobación' :
                         changeOrder?.status === 'approved' ? 'Aprobado' :
                         changeOrder?.status === 'rejected' ? 'Rechazado' :
                         changeOrder?.status === 'in_progress'? 'En Progreso' : 'Completado'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon name={typeInfo?.icon} size={14} className={typeInfo?.color} />
                        <span className="text-sm font-medium text-foreground">{typeInfo?.label}</span>
                      </div>
                      
                      <p className="text-sm text-foreground">{changeOrder?.description}</p>
                      
                      {changeOrder?.reason && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Justificación:</span> {changeOrder?.reason}
                        </p>
                      )}
                      
                      {changeOrder?.impact && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Impacto:</span> {changeOrder?.impact}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Solicitado por: {changeOrder?.requestedBy}</span>
                          <span>•</span>
                          <span>{new Date(changeOrder?.date)?.toLocaleDateString('es-MX')}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="Eye"
                            className="text-xs px-2 py-1"
                          >
                            Ver Detalles
                          </Button>
                          {changeOrder?.status === 'pending_approval' && (
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="Send"
                              className="text-xs px-2 py-1"
                              onClick={() => onReportToProjects?.(changeOrder?.workOrderId, 'change_follow_up', changeOrder)}
                            >
                              Seguimiento
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium text-sm text-foreground mb-3">Resumen de Cambios</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { status: 'pending_approval', label: 'Pendientes', color: 'text-orange-600' },
            { status: 'approved', label: 'Aprobados', color: 'text-green-600' },
            { status: 'rejected', label: 'Rechazados', color: 'text-red-600' },
            { status: 'in_progress', label: 'En Progreso', color: 'text-blue-600' },
            { status: 'completed', label: 'Completados', color: 'text-gray-600' }
          ]?.map((stat) => {
            const count = allChangeOrders?.filter(co => co?.status === stat?.status)?.length || 0;
            return (
              <div key={stat?.status} className="text-center">
                <div className={`text-2xl font-bold ${stat?.color}`}>{count}</div>
                <div className="text-xs text-muted-foreground">{stat?.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChangeOrderPanel;