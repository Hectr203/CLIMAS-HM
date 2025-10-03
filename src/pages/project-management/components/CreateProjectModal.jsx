import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    client: '',
    department: '',
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
    description: '',
    location: '',
    assignedPersonnel: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = [
    { value: 'installation', label: 'Instalación HVAC' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'repair', label: 'Reparación' },
    { value: 'upgrade', label: 'Actualización' }
  ];

  const clientOptions = [
    { value: 'abc-corp', label: 'ABC Corporation' },
    { value: 'xyz-industries', label: 'XYZ Industries' },
    { value: 'tech-solutions', label: 'Tech Solutions SA' },
    { value: 'green-energy', label: 'Green Energy México' },
    { value: 'urban-development', label: 'Urban Development Group' }
  ];

  const departmentOptions = [
    { value: 'sales', label: 'Ventas' },
    { value: 'engineering', label: 'Ingeniería' },
    { value: 'installation', label: 'Instalación' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'administration', label: 'Administración' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const personnelOptions = [
    { value: 'carlos-martinez', label: 'Carlos Martínez - Ingeniero' },
    { value: 'ana-rodriguez', label: 'Ana Rodríguez - Técnico' },
    { value: 'luis-garcia', label: 'Luis García - Supervisor' },
    { value: 'maria-lopez', label: 'María López - Coordinadora' },
    { value: 'jose-hernandez', label: 'José Hernández - Instalador' }
  ];

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

    if (!formData?.code?.trim()) {
      newErrors.code = 'El código del proyecto es requerido';
    }

    if (!formData?.type) {
      newErrors.type = 'El tipo de proyecto es requerido';
    }

    if (!formData?.client) {
      newErrors.client = 'El cliente es requerido';
    }

    if (!formData?.department) {
      newErrors.department = 'El departamento es requerido';
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

    if (!formData?.location?.trim()) {
      newErrors.location = 'La ubicación es requerida';
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
      // Generate project code if not provided
      const projectCode = formData?.code || `PROJ-${Date.now()?.toString()?.slice(-6)}`;
      
      const projectData = {
        ...formData,
        code: projectCode,
        totalBudget: calculateTotalBudget(),
        id: Date.now()?.toString(),
        status: 'planning',
        progress: 0,
        createdAt: new Date()?.toISOString(),
        createdBy: 'current-user'
      };

      await onSubmit(projectData);
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        type: '',
        client: '',
        department: '',
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
        description: '',
        location: '',
        assignedPersonnel: []
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Crear Nuevo Proyecto</h2>
            <p className="text-sm text-muted-foreground">Complete la información del proyecto</p>
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
              <h3 className="text-lg font-medium text-foreground mb-4">Información Básica</h3>
            </div>

            <Input
              label="Nombre del Proyecto"
              type="text"
              placeholder="Ej: Instalación HVAC Edificio Central"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              error={errors?.name}
              required
            />

            <Input
              label="Código del Proyecto"
              type="text"
              placeholder="Ej: PROJ-2024-001"
              value={formData?.code}
              onChange={(e) => handleInputChange('code', e?.target?.value)}
              error={errors?.code}
              description="Se generará automáticamente si se deja vacío"
            />

            <Select
              label="Tipo de Proyecto"
              options={projectTypes}
              value={formData?.type}
              onChange={(value) => handleInputChange('type', value)}
              error={errors?.type}
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
              label="Departamento Responsable"
              options={departmentOptions}
              value={formData?.department}
              onChange={(value) => handleInputChange('department', value)}
              error={errors?.department}
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

            <Input
              label="Ubicación"
              type="text"
              placeholder="Ej: Ciudad de México, CDMX"
              value={formData?.location}
              onChange={(e) => handleInputChange('location', e?.target?.value)}
              error={errors?.location}
              required
            />

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

            {/* Personnel Assignment */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4">Asignación de Personal</h3>
            </div>

            <div className="md:col-span-2">
              <Select
                label="Personal Asignado"
                options={personnelOptions}
                value={formData?.assignedPersonnel}
                onChange={(value) => handleInputChange('assignedPersonnel', value)}
                multiple
                searchable
                description="Seleccione el personal que trabajará en este proyecto"
              />
            </div>

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
              iconName="Plus"
              iconPosition="left"
            >
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;