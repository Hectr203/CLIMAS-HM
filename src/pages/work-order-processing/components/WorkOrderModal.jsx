import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const WorkOrderModal = ({ isOpen, onClose, workOrder, onSave }) => {
  const [formData, setFormData] = useState({
    assignedTechnician: '',
    priority: 'Media',
    status: 'Pendiente',
    dueDate: '',
    notes: '',
    requiredPPE: [],
    medicalRequirements: false
  });

  // Update formData when workOrder prop changes
  useEffect(() => {
    if (workOrder) {
      setFormData({
        assignedTechnician: workOrder?.assignedTechnician || '',
        priority: workOrder?.priority || 'Media',
        status: workOrder?.status || 'Pendiente',
        dueDate: workOrder?.dueDate || '',
        notes: workOrder?.notes || '',
        requiredPPE: workOrder?.requiredPPE || [],
        medicalRequirements: workOrder?.medicalRequirements || false
      });
    } else {
      // Reset form for new order
      setFormData({
        assignedTechnician: '',
        priority: 'Media',
        status: 'Pendiente',
        dueDate: '',
        notes: '',
        requiredPPE: [],
        medicalRequirements: false
      });
    }
  }, [workOrder, isOpen]);

  const technicianOptions = [
    { value: 'Carlos Mendoza', label: 'Carlos Mendoza - Técnico Senior' },
    { value: 'Ana García', label: 'Ana García - Especialista HVAC' },
    { value: 'Roberto Silva', label: 'Roberto Silva - Técnico Junior' },
    { value: 'María López', label: 'María López - Supervisora' },
    { value: 'Diego Ramírez', label: 'Diego Ramírez - Técnico Senior' }
  ];

  const priorityOptions = [
    { value: 'Crítica', label: 'Crítica' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' }
  ];

  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En Progreso', label: 'En Progreso' },
    { value: 'En Pausa', label: 'En Pausa' },
    { value: 'Completada', label: 'Completada' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];

  const ppeOptions = [
    'Casco de Seguridad',
    'Gafas de Protección',
    'Guantes de Trabajo',
    'Calzado de Seguridad',
    'Arnés de Seguridad',
    'Respirador N95',
    'Chaleco Reflectivo'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePPEChange = (item, checked) => {
    setFormData(prev => ({
      ...prev,
      requiredPPE: checked 
        ? [...prev?.requiredPPE, item]
        : prev?.requiredPPE?.filter(ppe => ppe !== item)
    }));
  };

  const handleSave = () => {
    onSave({ ...workOrder, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {workOrder ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
            </h2>
            {workOrder && (
              <p className="text-sm text-muted-foreground mt-1">
                {workOrder?.orderNumber} - {workOrder?.projectName}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Técnico Asignado"
              options={technicianOptions}
              value={formData?.assignedTechnician}
              onChange={(value) => handleInputChange('assignedTechnician', value)}
              searchable
              required
            />

            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange('priority', value)}
              required
            />

            <Select
              label="Estado"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
              required
            />

            <Input
              label="Fecha Límite"
              type="date"
              value={formData?.dueDate}
              onChange={(e) => handleInputChange('dueDate', e?.target?.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notas Adicionales
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows={4}
              placeholder="Agregar notas sobre la orden de trabajo..."
              value={formData?.notes}
              onChange={(e) => handleInputChange('notes', e?.target?.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Equipo de Protección Personal (PPE) Requerido
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ppeOptions?.map((item) => (
                <Checkbox
                  key={item}
                  label={item}
                  checked={formData?.requiredPPE?.includes(item)}
                  onChange={(e) => handlePPEChange(item, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <Checkbox
              label="Requiere Estudios Médicos Actualizados"
              description="El técnico asignado debe tener estudios médicos vigentes"
              checked={formData?.medicalRequirements}
              onChange={(e) => handleInputChange('medicalRequirements', e?.target?.checked)}
            />
          </div>

          {workOrder && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Información del Proyecto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="text-foreground ml-2">{workOrder?.clientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="text-foreground ml-2">{workOrder?.type}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            iconName="Save"
            iconSize={16}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderModal;