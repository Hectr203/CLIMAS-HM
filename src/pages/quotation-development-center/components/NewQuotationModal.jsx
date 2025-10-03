import React, { useState } from 'react';
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
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignedToOptions = [
    'María García',
    'Roberto Silva', 
    'Carmen Díaz',
    'Patricia Morales',
    'Alejandro Torres'
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newQuotation = {
        id: generateQuotationId(),
        clientName: formData?.clientName?.trim(),
        projectName: formData?.projectName?.trim(),
        status: 'development',
        createdDate: new Date()?.toISOString()?.split('T')?.[0],
        lastModified: new Date()?.toISOString()?.split('T')?.[0],
        assignedTo: formData?.assignedTo,
        priority: formData?.priority,
        stage: 'scope-definition',
        quotationData: {
          scope: formData?.projectDescription?.trim(),
          assumptions: [
            "Acceso libre durante horario laboral (8:00-18:00)",
            "Cliente proporciona conexiones básicas de servicios"
          ],
          timeline: formData?.timeline?.trim(),
          conditions: "50% anticipo, 50% contra entrega",
          warranty: "24 meses en equipos, 12 meses en instalación",
          totalAmount: parseFloat(formData?.estimatedBudget) || 0,
          validity: "45 días"
        },
        materials: [],
        riskAssessment: {
          overall: "medium",
          factors: [
            { factor: "Evaluación inicial", risk: "low", mitigation: "Pendiente inspección técnica" }
          ],
          extraCostsPrevention: false
        },
        revisions: [
          {
            version: "1.0",
            date: new Date()?.toISOString()?.split('T')?.[0],
            changes: "Versión inicial de cotización",
            author: formData?.assignedTo
          }
        ],
        communications: [
          {
            id: `comm-${Date.now()}`,
            type: "email",
            date: new Date()?.toISOString()?.split('T')?.[0],
            subject: `Nueva cotización registrada: ${formData?.projectName?.trim()}`,
            content: `Cotización inicial creada para ${formData?.projectDescription?.trim()}`,
            urgency: 'normal'
          }
        ],
        internalReview: {
          status: "pending",
          reviewAreas: {
            pricing: { reviewed: false, reviewer: "", comments: "" },
            scope: { reviewed: false, reviewer: "", comments: "" },
            timeline: { reviewed: false, reviewer: "", comments: "" },
            technical: { reviewed: false, reviewer: "", comments: "" }
          }
        },
        additionalWork: [],
        contactInfo: {
          phone: formData?.phone?.trim(),
          email: formData?.email?.trim(),
          contactPerson: formData?.contactPerson?.trim(),
          location: formData?.location?.trim()
        }
      };

      onCreateQuotation?.(newQuotation);
      handleClose();
    } catch (error) {
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
                  onChange={(e) => handleInputChange('clientName', e?.target?.value)}
                  error={errors?.clientName}
                  placeholder="Ej. Corporación ABC"
                />
                
                <Input
                  label="Nombre del Proyecto"
                  required
                  value={formData?.projectName}
                  onChange={(e) => handleInputChange('projectName', e?.target?.value)}
                  error={errors?.projectName}
                  placeholder="Ej. Instalación HVAC Torre Corporativa"
                />

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
                    options={assignedToOptions?.map(person => ({ value: person, label: person }))}
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