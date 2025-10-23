import { useNotifications } from '../../../context/NotificationContext';
import useQuotation from '../../../hooks/useQuotation';
import useClient from '../../../hooks/useClient';
import React, { useState } from 'react';
import { useEstados, useMunicipios } from '../../../hooks/useEstado';
import useProyecto from '../../../hooks/useProyect';
import usePerson from '../../../hooks/usePerson';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import Select from '../../../components/ui/Select';

// Formatea el presupuesto solo con separadores de miles y decimales
function formatearNumero(valor) {
  if (!valor || isNaN(Number(valor))) return '';
  const partes = valor.split('.');
  let entero = partes[0];
  let decimal = partes[1] || '';
  entero = Number(entero).toLocaleString('es-MX');
  if (decimal.length > 0) {
    return `${entero}.${decimal}`;
  }
  return entero;
}

// Formatea el presupuesto como dinero MXN
function formatearDinero(valor) {
  if (!valor || isNaN(Number(valor))) return '';
  return Number(valor).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

const NewQuotationModal = ({ isOpen, onClose, onCreateQuotation }) => {
  const [formData, setFormData] = useState({
    clienteId: '',
    nombreCliente: '',
    proyectoId: '',
    nombreProyecto: '',
    personalAsignadoId: '',
    asignadoA: '',
    personaContacto: '',
    telefono: '',
    email: '',
    descripcionProyecto: '',
    estado: '',
    municipio: '',
    direccion: '',
    montoTotal: '',
    cronograma: '',
    prioridad: 'media',
    tipoProyecto: 'hvac',
    notas: ''
  });

  // Proyectos y clientes
  const { proyectos, getProyectos, loading: loadingProyectos } = useProyecto();
  const { clients, getClients, loading: loadingClients } = useClient();
  React.useEffect(() => {
    getProyectos();
    getClients();
  }, []);

  // Estados y municipios (hooks llamados una sola vez)
  const { estados, loading: loadingEstados, error: errorEstados } = useEstados();
  const { municipios, loading: loadingMunicipios, error: errorMunicipios } = useMunicipios(formData.estado);

  // Mostrar en consola cómo se obtienen los estados y municipios
  React.useEffect(() => {
    console.log('Estados:', estados);
    console.log('Municipios:', municipios);
    console.log('Estado seleccionado:', formData.estado);
  }, [estados, municipios, formData.estado]);
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
      proyectoId: selected?.value || '',
      nombreProyecto: selected?.label || value,
      clienteId: selected?.clientId || '',
      nombreCliente: getClientNameById(selected?.clientId)
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
  // Clave única para cada responsable (evita duplicados)
  const assignedToOptions = persons?.map((emp, idx) => {
    const idValue = emp.empleadoId || emp.id || `${idx}`;
    // Si hay duplicados, agrega el índice para asegurar unicidad
    return {
      value: idValue,
      label: emp.nombreCompleto || emp.nombre || emp.empleadoId || emp.id,
      key: `${idValue}-${idx}`
    };
  }) || [];

  const handleInputChange = (field, value) => {
    // Formateo visual para el campo montoTotal (presupuesto)
    if (field === 'montoTotal') {
      let cleanValue = value.replace(/[^\d.]/g, '');
      if (cleanValue.includes('.')) {
        const [intPart, decPart] = cleanValue.split('.');
        cleanValue = intPart + '.' + decPart.slice(0,2);
      }
      setFormData(prev => ({
        ...prev,
        [field]: cleanValue
      }));
    } else if (field === 'telefono') {
      let cleanValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [field]: cleanValue
      }));
    } else if (field === 'asignadoA') {
      // Guardar id y nombre
      const selected = assignedToOptions.find(opt => opt.value === value);
      setFormData(prev => ({
        ...prev,
        personalAsignadoId: selected?.value || '',
        asignadoA: selected?.label || value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

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

    if (!formData?.nombreCliente?.trim()) {
      newErrors.nombreCliente = 'El nombre del cliente es requerido';
    }

    if (!formData?.nombreProyecto?.trim()) {
      newErrors.nombreProyecto = 'El nombre del proyecto es requerido';
    }

    if (!formData?.personaContacto?.trim()) {
      newErrors.personaContacto = 'La persona de contacto es requerida';
    }

    if (!formData?.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData?.telefono)) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos numéricos';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData?.descripcionProyecto?.trim()) {
      newErrors.descripcionProyecto = 'La descripción del proyecto es requerida';
    }

    if (!formData?.estado?.trim()) {
      newErrors.estado = 'El estado es requerido';
    }
    if (!formData?.municipio?.trim()) {
      newErrors.municipio = 'El municipio es requerido';
    }
    if (!formData?.direccion?.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData?.montoTotal?.trim()) {
      newErrors.montoTotal = 'El presupuesto estimado es requerido';
    }

    if (!formData?.cronograma?.trim()) {
      newErrors.cronograma = 'El cronograma es requerido';
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
      // Construir el objeto con los campos que espera el backend
      const quotationPayload = {
        clienteId: formData?.clienteId,
        nombreCliente: formData?.nombreCliente?.trim(),
        proyectoId: formData?.proyectoId,
        nombreProyecto: formData?.nombreProyecto?.trim(),
        personalAsignadoId: formData?.personalAsignadoId,
        asignadoA: formData?.asignadoA,
        prioridad: formData?.prioridad,
        tipoProyecto: formData?.tipoProyecto,
        notas: formData?.notas,
        personaContacto: formData?.personaContacto?.trim(),
        telefono: formData?.telefono?.trim(),
        email: formData?.email?.trim(),
        descripcionProyecto: formData?.descripcionProyecto?.trim(),
        ubicacion: {
          estado: formData?.estado,
          municipio: formData?.municipio,
          direccion: formData?.direccion,
        },
        presupuestoEstimado: Number(formData?.montoTotal),
        cronograma: formData?.cronograma,
      };
      console.log('Objeto enviado al backend:', quotationPayload);
      const response = await createQuotation(quotationPayload);
      const wasCreated = response?.success || response?.id || response?.data?.id;
      if (wasCreated) {
        showOperationSuccess('Cotización creada exitosamente');
        onCreateQuotation?.(response.data || response);
        handleClose();
      } else {
        showOperationSuccess('Error al crear la cotización');
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
      clienteId: '',
      nombreCliente: '',
      proyectoId: '',
      nombreProyecto: '',
      personalAsignadoId: '',
      asignadoA: '',
      personaContacto: '',
      telefono: '',
      email: '',
      descripcionProyecto: '',
      ubicacion: '',
      montoTotal: '',
      cronograma: '',
      prioridad: 'media',
      tipoProyecto: 'hvac',
      notas: ''
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
                  value={formData?.nombreCliente}
                  disabled
                  error={errors?.nombreCliente}
                  placeholder="Cliente del proyecto seleccionado"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nombre del Proyecto <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={projectOptions.find(opt => opt.label === formData?.nombreProyecto)?.value || ''}
                    onChange={handleProjectChange}
                    options={projectOptions}
                    isLoading={loadingProyectos}
                    placeholder={loadingProyectos ? 'Cargando proyectos...' : 'Selecciona un proyecto'}
                  />
                  {errors?.nombreProyecto && (
                    <p className="text-sm text-destructive mt-1">{errors?.nombreProyecto}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Prioridad <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData?.prioridad}
                    onChange={(value) => handleInputChange('prioridad', value)}
                    options={[
                      { value: 'urgente', label: 'Urgente' },
                      { value: 'alta', label: 'Alta' },
                      { value: 'media', label: 'Media' },
                      { value: 'baja', label: 'Baja' }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tipo de Proyecto <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData?.tipoProyecto}
                    onChange={(value) => handleInputChange('tipoProyecto', value)}
                    options={[
                      { value: 'hvac', label: 'Sistema HVAC' },
                      { value: 'instalacion', label: 'Instalación' },
                      { value: 'mantenimiento', label: 'Mantenimiento' },
                      { value: 'modernizacion', label: 'Modernización' }
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
                  value={formData?.personaContacto}
                  onChange={(e) => handleInputChange('personaContacto', e?.target?.value)}
                  error={errors?.personaContacto}
                  placeholder="Ej. Ing. Carlos Rodriguez"
                />

                <Input
                  label="Teléfono"
                  required
                  value={formData?.telefono}
                  onChange={(e) => handleInputChange('telefono', e?.target?.value)}
                  error={errors?.telefono}
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
                    value={formData?.descripcionProyecto}
                    onChange={(e) => handleInputChange('descripcionProyecto', e?.target?.value)}
                    placeholder="Describe el alcance y especificaciones del proyecto..."
                  />
                  {errors?.projectDescription && (
                    <p className="text-sm text-destructive mt-1">{errors?.projectDescription}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 items-center">
                  <div className="flex flex-col justify-end h-full">
                    <Select
                      label={<>Estado <span className="text-destructive">*</span></>}
                      value={formData.estado}
                      onChange={value => {
                        handleInputChange('estado', value);
                        handleInputChange('municipio', '');
                      }}
                      options={
                        estados ? [{ value: '', label: 'Selecciona un estado' }, ...estados.map(e => ({ value: e.code, label: e.name }))] : []
                      }
                      loading={loadingEstados}
                      error={errors?.estado}
                      required
                      disabled={loadingEstados || !!errorEstados}
                      placeholder={loadingEstados ? 'Cargando estados...' : 'Selecciona un estado'}
                      searchable
                      className="h-12 md:h-14 w-full text-base"
                    />
                  </div>
                  <div className="flex flex-col justify-end h-full">
                    <Select
                      label={<>Municipio <span className="text-destructive">*</span></>}
                      value={formData.municipio}
                      onChange={value => handleInputChange('municipio', value)}
                      options={
                        formData.estado === ''
                          ? [{ value: '', label: 'Selecciona un estado primero' }]
                          : loadingMunicipios
                            ? [{ value: '', label: 'Cargando municipios...' }]
                            : errorMunicipios
                              ? [{ value: '', label: 'Error al cargar municipios' }]
                              : [{ value: '', label: 'Selecciona un municipio' }, ...(municipios ? Object.values(municipios.municipios || {}).map((m, idx) => ({ value: m, label: m })) : [])]
                      }
                      loading={loadingMunicipios}
                      error={errors?.municipio}
                      required
                      disabled={formData.estado === '' || loadingMunicipios || !!errorMunicipios}
                      placeholder={formData.estado === '' ? 'Selecciona un estado primero' : loadingMunicipios ? 'Cargando municipios...' : 'Selecciona un municipio'}
                      searchable
                      className="h-12 md:h-14 w-full text-base"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Input
                    label="Dirección"
                    required
                    value={formData?.direccion}
                    onChange={(e) => handleInputChange('direccion', e?.target?.value)}
                    error={errors?.direccion}
                    placeholder="Dirección completa"
                    className="h-12 md:h-14 w-full text-base"
                  />
                  <Input
                    label="Presupuesto Estimado (MXN)"
                    type="text"
                    required
                    value={formatearNumero(formData?.montoTotal)}
                    onChange={(e) => handleInputChange('montoTotal', e?.target?.value)}
                    error={errors?.montoTotal}
                    placeholder="$0.00 MXN"
                    min="0"
                    step="0.01"
                    className="h-12 md:h-14 w-full text-base"
                  />
                </div>

                <Input
                  label="Tiempo de Ejecución"
                  required
                  value={formData?.cronograma}
                  onChange={(e) => handleInputChange('cronograma', e?.target?.value)}
                  error={errors?.cronograma}
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
                    value={formData?.personalAsignadoId}
                    onChange={(value) => handleInputChange('asignadoA', value)}
                    options={assignedToOptions}
                    isLoading={loadingEmployees}
                    placeholder={loadingEmployees ? 'Cargando empleados...' : 'Selecciona un responsable'}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Notas Adicionales</label>
                  <textarea
                    className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                    value={formData?.notas}
                    onChange={(e) => handleInputChange('notas', e?.target?.value)}
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