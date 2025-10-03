import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const StartupTrackingPanel = ({ project, onConfirm }) => {
  const [startupData, setStartupData] = useState({
    confirmedDate: project?.startup?.confirmedDate || '',
    preWorkMeeting: project?.startup?.preWorkMeeting || '',
    accessPermits: project?.startup?.accessPermits || false,
    safetyBriefing: project?.startup?.safetyBriefing || false,
    materialsDelivery: project?.startup?.materialsDelivery || false,
    fieldSupervisorAssigned: project?.startup?.fieldSupervisorAssigned || false
  });
  
  const [notes, setNotes] = useState('');

  const handleCheckboxChange = (field) => {
    setStartupData(prev => ({
      ...prev,
      [field]: !prev?.[field]
    }));
  };

  const handleConfirm = () => {
    const confirmationData = {
      ...startupData,
      status: 'confirmed',
      confirmationDate: new Date()?.toISOString()?.split('T')?.[0],
      notes: notes
    };
    
    onConfirm?.(confirmationData);
  };

  const isAllRequirementsMet = () => {
    return startupData?.confirmedDate && 
           startupData?.preWorkMeeting && 
           startupData?.accessPermits && 
           startupData?.safetyBriefing && 
           startupData?.fieldSupervisorAssigned;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h5 className="font-medium text-sm">Seguimiento de Arranque</h5>
        <p className="text-xs text-muted-foreground">
          Confirmar fechas y responsable en campo (Paso 19 del flujo)
        </p>

        {/* Field Supervisor Info */}
        {project?.fieldSupervisor && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="HardHat" size={16} className="text-blue-600" />
              <span className="font-medium text-sm">Supervisor de Campo</span>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>{project?.fieldSupervisor?.name}</strong></p>
              <p className="text-muted-foreground">{project?.fieldSupervisor?.phone}</p>
              <p className="text-muted-foreground">{project?.fieldSupervisor?.email}</p>
            </div>
          </div>
        )}

        {/* Date Confirmations */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Fecha de Inicio Confirmada</label>
            <Input
              type="date"
              value={startupData?.confirmedDate}
              onChange={(e) => setStartupData(prev => ({ ...prev, confirmedDate: e?.target?.value }))}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Reunión Pre-trabajo</label>
            <Input
              type="date"
              value={startupData?.preWorkMeeting}
              onChange={(e) => setStartupData(prev => ({ ...prev, preWorkMeeting: e?.target?.value }))}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Reunión inicial con cliente y equipo de campo
            </p>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3">
          <h6 className="font-medium text-sm">Lista de Verificación</h6>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={startupData?.accessPermits}
                onChange={() => handleCheckboxChange('accessPermits')}
              />
              <div className="flex-1">
                <span className="text-sm">Permisos de acceso confirmados</span>
                <p className="text-xs text-muted-foreground">
                  Acceso a todas las áreas de trabajo autorizado
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <Checkbox
                checked={startupData?.safetyBriefing}
                onChange={() => handleCheckboxChange('safetyBriefing')}
              />
              <div className="flex-1">
                <span className="text-sm">Briefing de seguridad completado</span>
                <p className="text-xs text-muted-foreground">
                  Equipo informado sobre protocolos de seguridad
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <Checkbox
                checked={startupData?.materialsDelivery}
                onChange={() => handleCheckboxChange('materialsDelivery')}
              />
              <div className="flex-1">
                <span className="text-sm">Entrega de materiales coordinada</span>
                <p className="text-xs text-muted-foreground">
                  Cronograma de entrega de materiales confirmado
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <Checkbox
                checked={startupData?.fieldSupervisorAssigned}
                onChange={() => handleCheckboxChange('fieldSupervisorAssigned')}
              />
              <div className="flex-1">
                <span className="text-sm">Supervisor de campo asignado</span>
                <p className="text-xs text-muted-foreground">
                  Responsable técnico confirmado para el proyecto
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium block mb-1">Notas Adicionales</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e?.target?.value)}
            placeholder="Observaciones especiales, coordinaciones adicionales..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
            rows={3}
          />
        </div>

        {/* Confirmation Status */}
        {project?.startup?.status === 'confirmed' && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-green-600" />
              <span className="font-medium text-sm text-green-800">Arranque Confirmado</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Confirmado el {new Date(project?.startup?.confirmationDate)?.toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleConfirm}
            disabled={!isAllRequirementsMet()}
            iconName="CheckCircle"
            iconPosition="left"
            size="sm"
            className={`flex-1 ${!isAllRequirementsMet() ? 'opacity-50' : ''}`}
          >
            Confirmar Arranque
          </Button>
        </div>

        {!isAllRequirementsMet() && (
          <p className="text-xs text-orange-600 text-center">
            Complete todos los campos requeridos para confirmar el arranque
          </p>
        )}
      </div>
    </div>
  );
};

export default StartupTrackingPanel;