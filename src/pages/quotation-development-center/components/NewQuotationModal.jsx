import { useNotifications } from '../../../context/NotificationContext';
import useQuotation from '../../../hooks/useQuotation';
import useClient from '../../../hooks/useClient';
import React, { useState } from 'react';
import useProyecto from '../../../hooks/useProyect';
import usePerson from '../../../hooks/usePerson';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const NewQuotationModal = ({ isOpen, onClose, onCreateQuotation }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    contactPerson: '',
    phone: '',
    email: '',
    projectDescription: '',
    location: '',
    estimatedBudget: '',
    timeline: '',
    priority: 'medium',
    assignedTo: 'María García',
    projectType: 'hvac',
    notes: ''
    // ...existing code...
  });

  // Proyectos y clientes
  const { proyectos, getProyectos, loading: loadingProyectos } = useProyecto();
  const { clients, getClients, loading: loadingClients } = useClient();
  React.useEffect(() => {
    getProyectos();
    getClients();
  }, []);
  // Opciones para el select de proyectos (con clientId)
  const projectOptions = proyectos?.map(p => ({
    value: p.id || p._id || p.codigo || p.nombreProyecto,
    label: p.nombreProyecto || p.codigo,
    clientId: p.cliente?.id || p.cliente?.id || p.cliente || ''
  })) || [];

  // Función para obtener el nombre del cliente por id
  const getClientNameById = (id) => {
    if (!id || !clients) return '';
    // Buscar por id, _id, y también comparar como string
    const found = clients.find(c => String(c.id) === String(id) || String(c._id) === String(id));
    // Mostrar empresa si existe, si no nombre, si no razonSocial, si no name
    return found?.empresa || found?.nombre || found?.razonSocial || found?.name || id || '';
  };

  // Cuando cambia el proyecto seleccionado, actualizar el cliente
  const handleProjectChange = (value) => {
    const selected = projectOptions.find(opt => opt.value === value);
    setFormData(prev => ({
      ...prev,
      projectName: selected?.label || value,
      clientName: getClientNameById(selected?.clientId)
    }));
    // Limpiar error si lo hay
    if (errors?.projectName) setErrors(prev => ({ ...prev, projectName: '' }));
  };

  // Cuando cambia el proyecto seleccionado, actualizar el cliente

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Hook para cargar empleados
  const { persons, getPersons, loading: loadingEmployees } = usePerson();
  React.useEffect(() => { getPersons(); /* solo una vez */ }, []);
  // Opciones para el select de responsables (corregido)
  // Opciones para el select de responsables (corregido)
  const assignedToOptions = persons?.map(emp => ({
    value: emp.empleadoId || emp.id || emp.nombreCompleto || emp.nombre,
    label: emp.nombreCompleto || emp.nombre || emp.empleadoId || emp.id,
    key: emp.empleadoId || emp.id // clave única para React
  })) || [];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.clientName?.trim()) {
      newErrors.clientName = 'El nombre del cliente es requerido';
    }

    if (!formData?.projectName?.trim()) {
      newErrors.projectName = 'El nombre del proyecto es requerido';
    }

    if (!formData?.contactPerson?.trim()) {
      newErrors.contactPerson = 'La persona de contacto es requerida';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData?.projectDescription?.trim()) {
      newErrors.projectDescription = 'La descripción del proyecto es requerida';
    }

    if (!formData?.location?.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (!formData?.estimatedBudget?.trim()) {
      newErrors.estimatedBudget = 'El presupuesto estimado es requerido';
    }

    if (!formData?.timeline?.trim()) {
      newErrors.timeline = 'El cronograma es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const generateQuotationId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `COT-${new Date()?.getFullYear()}-${timestamp?.toString()?.slice(-3)}${random?.toString()?.padStart(3, '0')}`;
  };

  const { createQuotation, loading: loadingQuotation, error: errorQuotation } = useQuotation();
  const { showOperationSuccess } = useNotifications();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const quotationPayload = {
        clientName: formData?.clientName?.trim(),
        projectName: formData?.projectName?.trim(),
        assignedTo: formData?.assignedTo,
        priority: formData?.priority,
        projectType: formData?.projectType,
        notes: formData?.notes,
        contactPerson: formData?.contactPerson?.trim(),
        phone: formData?.phone?.trim(),
        email: formData?.email?.trim(),
        projectDescription: formData?.projectDescription?.trim(),
        location: formData?.location?.trim(),
        estimatedBudget: formData?.estimatedBudget,
        timeline: formData?.timeline,
        // Puedes agregar más campos si el backend lo requiere
      };
      const response = await createQuotation(quotationPayload);
      if (response?.success) {
        showOperationSuccess('Cotización creada exitosamente');
        onCreateQuotation?.(response.data || response);
        handleClose();
      } else {
        alert('Error al crear la cotización');
      }
    } catch (error) {
      alert('Error al crear la cotización');
      console.error('Error creating quotation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clientName: '',
      projectName: '',
      contactPerson: '',
      phone: '',
      email: '',
      projectDescription: '',
      location: '',
      estimatedBudget: '',
      timeline: '',
      priority: 'medium',
      assignedTo: 'María García',
      projectType: 'hvac',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={handleClose}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Nueva Cotización</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crear una nueva cotización de proyecto
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={handleClose}
            disabled={isSubmitting}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="FileText" size={18} className="mr-2" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Cliente"
                  required
                  value={formData?.clientName}
                  disabled
                  error={errors?.clientName}
                  placeholder="Cliente del proyecto seleccionado"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nombre del Proyecto <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={projectOptions.find(opt => opt.label === formData?.projectName)?.value || ''}
                    onChange={handleProjectChange}
                    options={projectOptions}
                    isLoading={loadingProyectos}
                    placeholder={loadingProyectos ? 'Cargando proyectos...' : 'Selecciona un proyecto'}
                  />
                  {errors?.projectName && (
                    <p className="text-sm text-destructive mt-1">{errors?.projectName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Prioridad <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData?.priority}
                    onChange={(value) => handleInputChange('priority', value)}
                    options={[
                      { value: 'urgent', label: 'Urgente' },
                      { value: 'high', label: 'Alta' },
                      { value: 'medium', label: 'Media' },
                      { value: 'low', label: 'Baja' }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tipo de Proyecto <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData?.projectType}
                    onChange={(value) => handleInputChange('projectType', value)}
                    options={[
                      { value: 'hvac', label: 'Sistema HVAC' },
                      { value: 'installation', label: 'Instalación' },
                      { value: 'maintenance', label: 'Mantenimiento' },
                      { value: 'modernization', label: 'Modernización' }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="Users" size={18} className="mr-2" />
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Persona de Contacto"
                  required
                  value={formData?.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e?.target?.value)}
                  error={errors?.contactPerson}
                  placeholder="Ej. Ing. Carlos Rodriguez"
                />

                <Input
                  label="Teléfono"
                  required
                  value={formData?.phone}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  error={errors?.phone}
                  placeholder="+52 55 1234 5678"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={formData?.email}
                    onChange={(e) => handleInputChange('email', e?.target?.value)}
                    error={errors?.email}
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="Settings" size={18} className="mr-2" />
                Detalles del Proyecto
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Descripción del Proyecto <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                    value={formData?.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e?.target?.value)}
                    placeholder="Describe el alcance y especificaciones del proyecto..."
                  />
                  {errors?.projectDescription && (
                    <p className="text-sm text-destructive mt-1">{errors?.projectDescription}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Ubicación del Proyecto"
                    required
                    value={formData?.location}
                    onChange={(e) => handleInputChange('location', e?.target?.value)}
                    error={errors?.location}
                    placeholder="Ciudad, Estado"
                  />

                  <Input
                    label="Presupuesto Estimado (MXN)"
                    type="number"
                    required
                    value={formData?.estimatedBudget}
                    onChange={(e) => handleInputChange('estimatedBudget', e?.target?.value)}
                    error={errors?.estimatedBudget}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <Input
                  label="Tiempo de Ejecución"
                  required
                  value={formData?.timeline}
                  onChange={(e) => handleInputChange('timeline', e?.target?.value)}
                  error={errors?.timeline}
                  placeholder="Ej. 16 semanas, 3 meses"
                />
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="UserCheck" size={18} className="mr-2" />
                Asignación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Responsable <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData?.assignedTo}
                    onChange={(value) => handleInputChange('assignedTo', value)}
                    options={assignedToOptions}
                    isLoading={loadingEmployees}
                    placeholder={loadingEmployees ? 'Cargando empleados...' : 'Selecciona un responsable'}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Notas Adicionales</label>
                  <textarea
                    className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                    value={formData?.notes}
                    onChange={(e) => handleInputChange('notes', e?.target?.value)}
                    placeholder="Información adicional relevante para la cotización..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50 dark:bg-gray-800/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              iconName={isSubmitting ? "Loader2" : "Plus"}
              iconPosition="left"
              className={isSubmitting ? "animate-spin" : ""}
            >
              {isSubmitting ? 'Creando...' : 'Crear Cotización'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewQuotationModal;