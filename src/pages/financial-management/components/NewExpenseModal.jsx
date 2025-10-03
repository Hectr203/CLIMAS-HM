import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const NewExpenseModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date()?.toISOString()?.split('T')?.[0],
    time: new Date()?.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    category: '',
    description: '',
    amount: '',
    currency: 'MXN',
    project: '',
    projectCode: '',
    vendor: '',
    requestedBy: '',
    paymentMethod: 'Transferencia',
    priority: 'Media',
    departmentBudget: '',
    notes: '',
    receiptRequired: true,
    authorizedBy: '',
    dueDate: '',
    taxDeductible: true
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Materiales',
    'Viajes',
    'Nómina',
    'Equipos',
    'Proveedores',
    'Servicios',
    'Oficina',
    'Marketing',
    'Capacitación',
    'Transporte',
    'Mantenimiento',
    'Otro'
  ];

  const currencies = [
    'MXN',
    'USD',
    'EUR'
  ];

  const projects = [
    'Torre Corporativa - HVAC-2024-001',
    'Centro Comercial - HVAC-2024-002',
    'Hospital Regional - HVAC-2024-003',
    'Complejo Industrial - HVAC-2024-004',
    'Residencial Premium - HVAC-2024-005'
  ];

  const paymentMethods = [
    'Transferencia',
    'Cheque',
    'Efectivo',
    'Tarjeta Corporativa',
    'Facturación Directa'
  ];

  const priorities = [
    'Baja',
    'Media',
    'Alta',
    'Urgente'
  ];

  const departmentBudgets = [
    'Operaciones',
    'Proyectos',
    'Administración',
    'Ventas',
    'Recursos Humanos',
    'IT',
    'General'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.date) {
      newErrors.date = 'La fecha es requerida';
    }

    if (!formData?.category) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData?.amount?.trim()) {
      newErrors.amount = 'El monto es requerido';
    } else if (isNaN(parseFloat(formData?.amount)) || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'El monto debe ser un número válido mayor a 0';
    }

    if (!formData?.requestedBy?.trim()) {
      newErrors.requestedBy = 'El solicitante es requerido';
    }

    if (!formData?.project) {
      newErrors.project = 'El proyecto es requerido';
    }

    if (!formData?.departmentBudget) {
      newErrors.departmentBudget = 'El presupuesto departamental es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

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

    // Auto-populate project code when project is selected
    if (field === 'project' && value) {
      const projectCode = value?.split(' - ')?.[1];
      setFormData(prev => ({
        ...prev,
        projectCode: projectCode || ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare the expense data
    const expenseData = {
      ...formData,
      id: Date.now(), // Temporary ID for mock data
      amount: `$${parseFloat(formData?.amount)?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      status: 'Pendiente'
    };

    onSubmit(expenseData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      date: new Date()?.toISOString()?.split('T')?.[0],
      time: new Date()?.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      category: '',
      description: '',
      amount: '',
      currency: 'MXN',
      project: '',
      projectCode: '',
      vendor: '',
      requestedBy: '',
      paymentMethod: 'Transferencia',
      priority: 'Media',
      departmentBudget: '',
      notes: '',
      receiptRequired: true,
      authorizedBy: '',
      dueDate: '',
      taxDeductible: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Nuevo Gasto</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Registra un nuevo gasto para autorización
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="Receipt" size={20} className="mr-2" />
                Información del Gasto
              </h3>
            </div>

            <div>
              <Input
                type="date"
                label="Fecha"
                value={formData?.date}
                onChange={(e) => handleInputChange('date', e?.target?.value)}
                error={errors?.date}
                required
              />
            </div>

            <div>
              <Input
                type="time"
                label="Hora"
                value={formData?.time}
                onChange={(e) => handleInputChange('time', e?.target?.value)}
                required
              />
            </div>

            <div>
              <Select
                label="Categoría"
                value={formData?.category}
                onChange={(value) => handleInputChange('category', value)}
                error={errors?.category}
                options={categories?.map(category => ({ value: category, label: category }))}
                placeholder="Selecciona una categoría"
                required
              />
            </div>

            <div>
              <Select
                label="Prioridad"
                value={formData?.priority}
                onChange={(value) => handleInputChange('priority', value)}
                options={priorities?.map(priority => ({ value: priority, label: priority }))}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Descripción"
                placeholder="Ej. Compra de materiales para instalación HVAC"
                value={formData?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
                error={errors?.description}
                required
              />
            </div>

            {/* Información Financiera */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="DollarSign" size={20} className="mr-2" />
                Información Financiera
              </h3>
            </div>

            <div>
              <Input
                type="number"
                label="Monto"
                placeholder="Ej. 2500.00"
                value={formData?.amount}
                onChange={(e) => handleInputChange('amount', e?.target?.value)}
                error={errors?.amount}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <Select
                label="Moneda"
                value={formData?.currency}
                onChange={(value) => handleInputChange('currency', value)}
                options={currencies?.map(currency => ({ value: currency, label: currency }))}
                required
              />
            </div>

            <div>
              <Select
                label="Método de Pago"
                value={formData?.paymentMethod}
                onChange={(value) => handleInputChange('paymentMethod', value)}
                options={paymentMethods?.map(method => ({ value: method, label: method }))}
                required
              />
            </div>

            <div>
              <Select
                label="Presupuesto Departamental"
                value={formData?.departmentBudget}
                onChange={(value) => handleInputChange('departmentBudget', value)}
                error={errors?.departmentBudget}
                options={departmentBudgets?.map(dept => ({ value: dept, label: dept }))}
                placeholder="Selecciona un departamento"
                required
              />
            </div>

            {/* Información del Proyecto */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="Folder" size={20} className="mr-2" />
                Información del Proyecto
              </h3>
            </div>

            <div>
              <Select
                label="Proyecto"
                value={formData?.project}
                onChange={(value) => handleInputChange('project', value)}
                error={errors?.project}
                options={projects?.map(project => ({ value: project, label: project }))}
                placeholder="Selecciona un proyecto"
                required
              />
            </div>

            <div>
              <Input
                label="Código de Proyecto"
                placeholder="Se completa automáticamente"
                value={formData?.projectCode}
                onChange={(e) => handleInputChange('projectCode', e?.target?.value)}
                readOnly
              />
            </div>

            <div>
              <Input
                label="Proveedor/Vendor"
                placeholder="Ej. Materiales Industriales SA"
                value={formData?.vendor}
                onChange={(e) => handleInputChange('vendor', e?.target?.value)}
              />
            </div>

            <div>
              <Input
                label="Solicitado por"
                placeholder="Ej. Carlos Mendoza"
                value={formData?.requestedBy}
                onChange={(e) => handleInputChange('requestedBy', e?.target?.value)}
                error={errors?.requestedBy}
                required
              />
            </div>

            {/* Información Adicional */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="FileText" size={20} className="mr-2" />
                Información Adicional
              </h3>
            </div>

            <div>
              <Input
                label="Autorizado por"
                placeholder="Ej. Ana García"
                value={formData?.authorizedBy}
                onChange={(e) => handleInputChange('authorizedBy', e?.target?.value)}
              />
            </div>

            <div>
              <Input
                type="date"
                label="Fecha Límite de Pago"
                value={formData?.dueDate}
                onChange={(e) => handleInputChange('dueDate', e?.target?.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="receiptRequired"
                  checked={formData?.receiptRequired}
                  onChange={(e) => handleInputChange('receiptRequired', e?.target?.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="receiptRequired" className="ml-2 text-sm text-foreground">
                  Comprobante requerido
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="taxDeductible"
                  checked={formData?.taxDeductible}
                  onChange={(e) => handleInputChange('taxDeductible', e?.target?.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="taxDeductible" className="ml-2 text-sm text-foreground">
                  Deducible de impuestos
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Notas Adicionales
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-foreground"
                  rows="4"
                  placeholder="Información adicional sobre el gasto..."
                  value={formData?.notes}
                  onChange={(e) => handleInputChange('notes', e?.target?.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              iconName="Plus"
              iconPosition="left"
            >
              Registrar Gasto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExpenseModal;