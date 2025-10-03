import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const DeliveryManagementPanel = ({ project, onUpdate }) => {
  const [deliveryUpdate, setDeliveryUpdate] = useState({
    scheduledDate: project?.delivery?.scheduledDate || '',
    status: project?.delivery?.status || 'scheduled',
    notes: ''
  });

  const [acceptanceChecklist, setAcceptanceChecklist] = useState(
    project?.delivery?.clientAcceptance?.checklist || []
  );

  const [correctionRequest, setCorrectionRequest] = useState({
    description: '',
    timeline: '',
    evidence: ''
  });

  const handleChecklistUpdate = (index, checked) => {
    const updatedChecklist = acceptanceChecklist?.map((item, i) => 
      i === index ? { ...item, checked } : item
    );
    setAcceptanceChecklist(updatedChecklist);
    
    onUpdate?.({
      delivery: {
        ...project?.delivery,
        clientAcceptance: {
          ...project?.delivery?.clientAcceptance,
          checklist: updatedChecklist
        }
      }
    });
  };

  const handleDeliveryConfirmation = () => {
    const allChecked = acceptanceChecklist?.every(item => item?.checked);
    const deliveryData = {
      ...project?.delivery,
      status: allChecked ? 'accepted' : 'pending_corrections',
      acceptanceDate: allChecked ? new Date()?.toISOString()?.split('T')?.[0] : null,
      clientAcceptance: {
        ...project?.delivery?.clientAcceptance,
        status: allChecked ? 'accepted' : 'pending',
        checklist: acceptanceChecklist
      }
    };

    onUpdate?.({ delivery: deliveryData });
  };

  const handleCorrectionRequest = () => {
    if (!correctionRequest?.description?.trim()) return;

    const correctionData = {
      id: `correction-${Date.now()}`,
      description: correctionRequest?.description,
      timeline: correctionRequest?.timeline,
      evidence: correctionRequest?.evidence,
      requestDate: new Date()?.toISOString()?.split('T')?.[0],
      status: 'pending'
    };

    onUpdate?.({
      delivery: {
        ...project?.delivery,
        corrections: [...(project?.delivery?.corrections || []), correctionData],
        status: 'corrections_requested'
      }
    });

    setCorrectionRequest({ description: '', timeline: '', evidence: '' });
  };

  const getDeliveryTypeIcon = (type) => {
    switch (type) {
      case 'construction': return 'Building';
      case 'pieces': return 'Package';
      default: return 'Truck';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'corrections_requested': return 'text-orange-600 bg-orange-100';
      case 'pending_corrections': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h5 className="font-medium text-sm">Gestión de Entrega</h5>
        <p className="text-xs text-muted-foreground">
          Coordinación de entrega final y gestión de conformidad (Pasos 27-32)
        </p>

        {/* Delivery Type */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name={getDeliveryTypeIcon(project?.delivery?.type)} size={16} className="text-blue-600" />
            <span className="font-medium text-sm">Tipo de Entrega</span>
          </div>
          <p className="text-sm">
            {project?.delivery?.type === 'construction' ? 'Obra / Construcción' : 'Piezas / Equipos'}
          </p>
        </div>

        {/* Delivery Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h6 className="font-medium text-sm">Estado de Entrega</h6>
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(project?.delivery?.status)}`}>
              {project?.delivery?.status === 'scheduled' ? 'Programada' :
               project?.delivery?.status === 'in_progress' ? 'En Progreso' :
               project?.delivery?.status === 'accepted' ? 'Aceptada' :
               project?.delivery?.status === 'corrections_requested' ? 'Correcciones Solicitadas' :
               project?.delivery?.status === 'pending_corrections' ? 'Pendiente Correcciones' : 'Pendiente'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Fecha Programada</label>
              <Input
                type="date"
                value={deliveryUpdate?.scheduledDate}
                onChange={(e) => setDeliveryUpdate(prev => ({ ...prev, scheduledDate: e?.target?.value }))}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Deliverables */}
        {project?.delivery?.deliverables && (
          <div className="space-y-3">
            <h6 className="font-medium text-sm">Entregables</h6>
            <div className="space-y-2">
              {project?.delivery?.deliverables?.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 border rounded-lg">
                  <Icon name="Package" size={16} className="text-muted-foreground" />
                  <span className="text-sm flex-1">{item}</span>
                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client Acceptance Checklist */}
        {project?.delivery?.clientAcceptance && (
          <div className="space-y-3">
            <h6 className="font-medium text-sm">Lista de Aceptación del Cliente</h6>
            
            <div className="space-y-2">
              {acceptanceChecklist?.map((item, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={item?.checked || false}
                    onChange={(checked) => handleChecklistUpdate(index, checked)}
                  />
                  <span className="text-sm flex-1">{item?.item}</span>
                  {item?.checked && (
                    <Icon name="CheckCircle" size={16} className="text-green-600" />
                  )}
                </label>
              ))}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Progreso de Aceptación</span>
                <span className="text-sm font-bold">
                  {acceptanceChecklist?.filter(item => item?.checked)?.length || 0}/
                  {acceptanceChecklist?.length || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${((acceptanceChecklist?.filter(item => item?.checked)?.length || 0) / (acceptanceChecklist?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            <Button
              onClick={handleDeliveryConfirmation}
              disabled={!acceptanceChecklist?.every(item => item?.checked)}
              iconName="CheckCircle"
              iconPosition="left"
              size="sm"
              className="w-full"
            >
              Confirmar Entrega
            </Button>
          </div>
        )}

        {/* Correction Management */}
        {project?.delivery?.status === 'corrections_requested' || project?.delivery?.corrections?.length > 0 && (
          <div className="space-y-3">
            <h6 className="font-medium text-sm">Gestión de Correcciones</h6>
            
            {/* Existing Corrections */}
            {project?.delivery?.corrections?.map((correction) => (
              <div key={correction?.id} className="p-3 border rounded-lg bg-orange-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{correction?.description}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(correction?.status)}`}>
                    {correction?.status === 'pending' ? 'Pendiente' :
                     correction?.status === 'in_progress' ? 'En Proceso' : 'Completada'}
                  </span>
                </div>
                
                {correction?.timeline && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Tiempo estimado:</strong> {correction?.timeline}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Solicitado el {new Date(correction?.requestDate)?.toLocaleDateString()}
                </p>
              </div>
            ))}

            {/* New Correction Request */}
            <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
              <h6 className="font-medium text-sm">Solicitar Corrección</h6>
              
              <div>
                <label className="text-xs font-medium block mb-1">Descripción</label>
                <textarea
                  value={correctionRequest?.description}
                  onChange={(e) => setCorrectionRequest(prev => ({ ...prev, description: e?.target?.value }))}
                  placeholder="Descripción detallada de la corrección necesaria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Tiempo Estimado</label>
                <Input
                  type="text"
                  value={correctionRequest?.timeline}
                  onChange={(e) => setCorrectionRequest(prev => ({ ...prev, timeline: e?.target?.value }))}
                  placeholder="ej. 3-5 días hábiles"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Evidencia</label>
                <Input
                  type="text"
                  value={correctionRequest?.evidence}
                  onChange={(e) => setCorrectionRequest(prev => ({ ...prev, evidence: e?.target?.value }))}
                  placeholder="Fotografías, documentos de referencia..."
                  className="text-sm"
                />
              </div>

              <Button
                onClick={handleCorrectionRequest}
                disabled={!correctionRequest?.description?.trim()}
                iconName="AlertTriangle"
                iconPosition="left"
                size="sm"
                className="w-full"
              >
                Solicitar Corrección
              </Button>
            </div>
          </div>
        )}

        {/* Delivery Completion */}
        {project?.delivery?.status === 'accepted' && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="CheckCircle" size={16} className="text-green-600" />
              <span className="font-medium text-sm text-green-800">Entrega Completada</span>
            </div>
            <p className="text-sm text-green-700">
              Aceptada el {new Date(project?.delivery?.acceptanceDate)?.toLocaleDateString()}
            </p>
            {project?.delivery?.clientFeedback && (
              <p className="text-sm text-green-700 mt-1">
                <strong>Comentarios:</strong> {project?.delivery?.clientFeedback}
              </p>
            )}
          </div>
        )}

        {/* Delivery Guidelines */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} className="text-blue-600" />
            <span className="font-medium text-sm text-blue-800">Proceso de Entrega</span>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>1. Verificar lista de aceptación del cliente</li>
            <li>2. Coordinar entrega final y actas de conformidad</li>
            <li>3. Gestionar correcciones si son necesarias</li>
            <li>4. Obtener aceptación final del cliente</li>
            <li>5. Proceder a facturación</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagementPanel;