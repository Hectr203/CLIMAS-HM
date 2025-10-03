import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EditProjectModal = ({ isOpen, onClose, onSubmit, project }) => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: '',
    priority: '',
    budgetBreakdown: {
      labor: '',
      parts: '',
      equipment: '',
      materials: '',
      transportation: '',
      other: ''
    },
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'planning', label: 'Planificación' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'on-hold', label: 'En Pausa' },
    { value: 'review', label: 'En Revisión' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const clientOptions = [
    { value: 'ABC Corporation', label: 'ABC Corporation' },
    { value: 'XYZ Industries', label: 'XYZ Industries' },
    { value: 'Tech Solutions SA', label: 'Tech Solutions SA' },
    { value: 'Green Energy México', label: 'Green Energy México' },
    { value: 'Urban Development Group', label: 'Urban Development Group' }
  ];

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      // Calculate budget breakdown from total budget if not available
      const totalBudget = project?.budget || 0;
      const breakdown = project?.budgetBreakdown || {};
      
      // If no breakdown exists, distribute total budget evenly across main categories
      const defaultBreakdown = {
        labor: breakdown?.labor || (totalBudget * 0.4)?.toString(),
        parts: breakdown?.parts || (totalBudget * 0.25)?.toString(),
        equipment: breakdown?.equipment || (totalBudget * 0.20)?.toString(),
        materials: breakdown?.materials || (totalBudget * 0.10)?.toString(),
        transportation: breakdown?.transportation || (totalBudget * 0.03)?.toString(),
        other: breakdown?.other || (totalBudget * 0.02)?.toString()
      };

      setFormData({
        name: project?.name || '',
        client: project?.client?.name || project?.client || '',
        status: project?.status || '',
        priority: project?.priority || '',
        budgetBreakdown: defaultBreakdown,
        startDate: project?.startDate || '',
        endDate: project?.endDate || '',
        location: project?.location || '',
        description: project?.description || ''
      });
    }
  }, [project]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBudgetChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      budgetBreakdown: {
        ...prev?.budgetBreakdown,
        [category]: value
      }
    }));
    
    // Clear budget errors when user starts typing
    if (errors?.budget) {
      setErrors(prev => ({
        ...prev,
        budget: ''
      }));
    }
  };

  const calculateTotalBudget = () => {
    const breakdown = formData?.budgetBreakdown || {};
    return Object.values(breakdown)?.reduce((total, value) => {
      return total + (parseFloat(value) || 0);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'El nombre del proyecto es requerido';
    }

    if (!formData?.client?.trim()) {
      newErrors.client = 'El cliente es requerido';
    }

    if (!formData?.status) {
      newErrors.status = 'El estado es requerido';
    }

    if (!formData?.priority) {
      newErrors.priority = 'La prioridad es requerida';
    }

    // Validate budget breakdown - at least one category must have a value
    const totalBudget = calculateTotalBudget();
    if (totalBudget <= 0) {
      newErrors.budget = 'Al menos una categoría del presupuesto debe tener un valor mayor a 0';
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData?.endDate) {
      newErrors.endDate = 'La fecha de finalización es requerida';
    }

    if (formData?.startDate && formData?.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de finalización debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updatedProject = {
        ...project,
        ...formData,
        budget: calculateTotalBudget(),
        statusLabel: statusOptions?.find(s => s?.value === formData?.status)?.label || formData?.status,
        priorityLabel: priorityOptions?.find(p => p?.value === formData?.priority)?.label || formData?.priority,
        client: {
          ...project?.client,
          name: formData?.client
        },
        updatedAt: new Date()?.toISOString(),
        updatedBy: 'current-user'
      };

      await onSubmit(updatedProject);
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Editar Proyecto</h2>
            <p className="text-sm text-muted-foreground">
              Modificar información del proyecto: {project?.code}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-foreground mb-4">Información del Proyecto</h3>
            </div>

            <Input
              label="Nombre del Proyecto"
              type="text"
              placeholder="Nombre del proyecto"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />

            <Select
              label="Cliente"
              options={clientOptions}
              value={formData?.client}
              onChange={(value) => handleInputChange('client', value)}
              error={errors?.client}
              searchable
              required
            />

            <Select
              label="Estado del Proyecto"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
              error={errors?.status}
              required
            />

            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange('priority', value)}
              error={errors?.priority}
              required
            />

            {/* Budget Breakdown Section */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Desglose de Presupuesto</h3>
              {errors?.budget && (
                <p className="text-sm text-destructive mb-4">{errors?.budget}</p>
              )}
            </div>

            <Input
              label="Mano de Obra (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.labor}
              onChange={(e) => handleBudgetChange('labor', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Piezas (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.parts}
              onChange={(e) => handleBudgetChange('parts', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Equipos (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.equipment}
              onChange={(e) => handleBudgetChange('equipment', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Materiales (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.materials}
              onChange={(e) => handleBudgetChange('materials', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Transporte (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.transportation}
              onChange={(e) => handleBudgetChange('transportation', e?.target?.value)}
              min="0"
              step="0.01"
            />

            <Input
              label="Otros Gastos (MXN)"
              type="number"
              placeholder="0.00"
              value={formData?.budgetBreakdown?.other}
              onChange={(e) => handleBudgetChange('other', e?.target?.value)}
              min="0"
              step="0.01"
            />

            {/* Total Budget Display */}
            <div className="md:col-span-2">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Total del Presupuesto:</span>
                  <span className="text-lg font-semibold text-primary">
                    ${calculateTotalBudget()?.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Cronograma</h3>
            </div>

            <Input
              label="Fecha de Inicio"
              type="date"
              value={formData?.startDate}
              onChange={(e) => handleInputChange('startDate', e?.target?.value)}
              error={errors?.startDate}
              required
            />

            <Input
              label="Fecha de Finalización"
              type="date"
              value={formData?.endDate}
              onChange={(e) => handleInputChange('endDate', e?.target?.value)}
              error={errors?.endDate}
              required
            />

            <Input
              label="Ubicación"
              type="text"
              placeholder="Ubicación del proyecto"
              value={formData?.location}
              onChange={(e) => handleInputChange('location', e?.target?.value)}
            />

            {/* Description */}
            <div className="md:col-span-2 mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción del Proyecto
              </label>
              <textarea
                rows={4}
                placeholder="Describa los objetivos, alcance y detalles importantes del proyecto..."
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName="Save"
              iconPosition="left"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;