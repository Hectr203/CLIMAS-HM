import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ChangeRequestPanel = ({ project, onRequestChange }) => {
  const [newChangeRequest, setNewChangeRequest] = useState({
    description: '',
    reason: '',
    commercialImpact: {
      cost: '',
      timeImpact: ''
    },
    urgency: 'normal'
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    if (!newChangeRequest?.description?.trim()) return;

    const changeRequest = {
      id: `change-${Date.now()}`,
      description: newChangeRequest?.description,
      reason: newChangeRequest?.reason,
      requestDate: new Date()?.toISOString()?.split('T')?.[0],
      status: 'pending',
      commercialImpact: {
        cost: parseFloat(newChangeRequest?.commercialImpact?.cost) || 0,
        timeImpact: newChangeRequest?.commercialImpact?.timeImpact
      },
      urgency: newChangeRequest?.urgency,
      requestedBy: project?.salesRep
    };

    onRequestChange?.(changeRequest);
    
    // Reset form
    setNewChangeRequest({
      description: '',
      reason: '',
      commercialImpact: { cost: '', timeImpact: '' },
      urgency: 'normal'
    });
    setShowForm(false);
  };

  const handleApproveChange = (changeId) => {
    // This would update the change status to approved
    console.log('Approving change:', changeId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-sm">Gestión de Cambios</h5>
            <p className="text-xs text-muted-foreground">
              Cambios con impacto comercial durante la ejecución (Pasos 21-24)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            onClick={() => setShowForm(!showForm)}
          >
            Nuevo Cambio
          </Button>
        </div>

        {/* Existing Change Requests */}
        <div className="space-y-3">
          <h6 className="font-medium text-sm">Solicitudes de Cambio</h6>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {project?.changeRequests?.map((change) => (
              <div key={change?.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {change?.description}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Solicitado el {new Date(change?.requestDate)?.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(change?.status)}`}>
                      {change?.status === 'pending' ? 'Pendiente' :
                       change?.status === 'approved' ? 'Aprobado' :
                       change?.status === 'rejected' ? 'Rechazado' :
                       change?.status === 'in_progress' ? 'En Proceso' : 'Completado'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getUrgencyColor(change?.urgency)}`}>
                      {change?.urgency === 'urgent' ? 'Urgente' :
                       change?.urgency === 'high' ? 'Alta' :
                       change?.urgency === 'normal' ? 'Normal' : 'Baja'}
                    </span>
                  </div>
                </div>

                {change?.reason && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Razón:</strong> {change?.reason}
                  </p>
                )}

                {/* Commercial Impact */}
                {change?.commercialImpact && (
                  <div className="p-2 bg-gray-50 rounded mb-2">
                    <h6 className="text-xs font-medium mb-1">Impacto Comercial</h6>
                    <div className="grid grid-cols-2 gap-2">
                      {change?.commercialImpact?.cost > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground">Costo:</span>
                          <p className="text-sm font-medium">
                            ${change?.commercialImpact?.cost?.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {change?.commercialImpact?.timeImpact && (
                        <div>
                          <span className="text-xs text-muted-foreground">Tiempo:</span>
                          <p className="text-sm font-medium">
                            {change?.commercialImpact?.timeImpact}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {change?.approvalDate && (
                  <p className="text-xs text-green-600">
                    <strong>Aprobado el:</strong> {new Date(change?.approvalDate)?.toLocaleDateString()}
                  </p>
                )}

                {/* Actions for pending changes */}
                {change?.status === 'pending' && (
                  <div className="flex items-center space-x-2 mt-3 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Check"
                      onClick={() => handleApproveChange(change?.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      iconName="X"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Rechazar
                    </Button>
                  </div>
                )}

                {/* Implementation status for approved changes */}
                {change?.status === 'approved' && change?.implementation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600">
                      <strong>Implementación:</strong> {change?.implementation}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {(!project?.changeRequests || project?.changeRequests?.length === 0) && (
              <div className="text-center py-8">
                <Icon name="FileEdit" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay solicitudes de cambio</p>
              </div>
            )}
          </div>
        </div>

        {/* New Change Request Form */}
        {showForm && (
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <h6 className="font-medium text-sm">Nueva Solicitud de Cambio</h6>
            
            <div>
              <label className="text-xs font-medium block mb-1">Descripción del Cambio</label>
              <textarea
                value={newChangeRequest?.description}
                onChange={(e) => setNewChangeRequest(prev => ({ ...prev, description: e?.target?.value }))}
                placeholder="Descripción detallada del cambio solicitado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">Razón del Cambio</label>
              <textarea
                value={newChangeRequest?.reason}
                onChange={(e) => setNewChangeRequest(prev => ({ ...prev, reason: e?.target?.value }))}
                placeholder="Justificación del cambio solicitado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={2}
              />
            </div>

            {/* Commercial Impact */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Impacto Comercial</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Costo Adicional</label>
                  <Input
                    type="number"
                    min="0"
                    value={newChangeRequest?.commercialImpact?.cost}
                    onChange={(e) => setNewChangeRequest(prev => ({ 
                      ...prev, 
                      commercialImpact: { ...prev?.commercialImpact, cost: e?.target?.value }
                    }))}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Impacto en Tiempo</label>
                  <Input
                    type="text"
                    value={newChangeRequest?.commercialImpact?.timeImpact}
                    onChange={(e) => setNewChangeRequest(prev => ({ 
                      ...prev, 
                      commercialImpact: { ...prev?.commercialImpact, timeImpact: e?.target?.value }
                    }))}
                    placeholder="ej. 2 semanas adicionales"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">Urgencia</label>
              <select
                value={newChangeRequest?.urgency}
                onChange={(e) => setNewChangeRequest(prev => ({ ...prev, urgency: e?.target?.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSubmit}
                disabled={!newChangeRequest?.description?.trim()}
                iconName="FileEdit"
                iconPosition="left"
                size="sm"
                className="flex-1"
              >
                Solicitar Cambio
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="X"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Change Management Guidelines */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-blue-600" />
            <span className="font-medium text-sm text-blue-800">Proceso de Cambios</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>1. Levantar cambio con impacto comercial</li>
            <li>2. Comunicar ajuste y solicitar aprobación formal</li>
            <li>3. Registrar adenda/condiciones del cambio</li>
            <li>4. Notificar internamente para implementación</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangeRequestPanel;