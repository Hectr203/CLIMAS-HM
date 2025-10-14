import React, { useState } from 'react';
import useClient from '../../../hooks/useClient';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useNotifications } from '../../../context/NotificationContext.jsx';

const NewClientModal = ({ isOpen, onClose, onSubmit, mode = 'create', initialData = null }) => {
  const { createClient, editClient } = useClient();
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    location: '',
    status: 'Activo',
    relationshipHealth: 'Buena',
    rfc: '',
    clientSince: new Date()?.toISOString()?.split('T')?.[0],
    totalProjects: 0,
    activeContracts: 0,
    totalValue: 0,
    lastContact: new Date()?.toISOString()?.split('T')?.[0],
    nextFollowUp: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    website: '',
    notes: ''
  });

  React.useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        companyName: initialData.companyName || initialData.empresa || '',
        contactPerson: initialData.contactPerson || initialData.contacto || '',
        email: initialData.email || '',
        phone: initialData.phone || initialData.telefono || '',
        industry: initialData.industry || initialData.industria || '',
        location: initialData.location || initialData.ubicacionEmpre || '',
        status: initialData.status || initialData.estado || 'Activo',
        relationshipHealth: initialData.relationshipHealth || initialData.relacion || 'Buena',
        rfc: initialData.rfc || '',
        clientSince: initialData.clientSince || initialData.fechaDesde || '',
        totalProjects: initialData.totalProjects || 0,
        activeContracts: initialData.activeContracts || 0,
        totalValue: initialData.totalValue || 0,
        lastContact: initialData.lastContact || '',
        nextFollowUp: initialData.nextFollowUp || initialData.proximoSeguimiento || '',
        address: initialData.address || (initialData.ubicacion && initialData.ubicacion.direccion) || '',
        city: initialData.city || (initialData.ubicacion && initialData.ubicacion.ciudad) || '',
        state: initialData.state || (initialData.ubicacion && initialData.ubicacion.estado) || '',
        postalCode: initialData.postalCode || (initialData.ubicacion && initialData.ubicacion.codigoPostal) || '',
        website: initialData.website || initialData.sitioWeb || '',
        notes: initialData.notes || initialData.notas || ''
      });
    }
  }, [isOpen, mode, initialData]);

  const [errors, setErrors] = useState({});

  const industries = [
    'Manufactura',
    'Comercial',
    'Hospitalidad',
    'Educación',
    'Salud',
    'Gobierno',
    'Retail',
    'Oficinas',
    'Residencial',
    'Industrial',
    'Otro'
  ];

  const locations = [
    'Monterrey',
    'Ciudad de México',
    'Guadalajara',
    'Tijuana',
    'Puebla',
    'León',
    'Querétaro',
    'Mérida',
    'Cancún',
    'Otro'
  ];

  const statusOptions = [
    'Activo',
    'Pendiente',
    'Inactivo',
    'Prospecto'
  ];

  const relationshipHealthOptions = [
    'Excelente',
    'Buena',
    'Regular',
    'Mala'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.companyName?.trim()) {
      newErrors.companyName = 'El nombre de la empresa es requerido';
    }

    if (!formData?.contactPerson?.trim()) {
      newErrors.contactPerson = 'La persona de contacto es requerida';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData?.industry) {
      newErrors.industry = 'La industria es requerida';
    }

    if (!formData?.location?.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (!formData?.rfc?.trim()) {
      newErrors.rfc = 'El RFC es requerido';
    } else if (!/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/?.test(formData?.rfc?.toUpperCase())) {
      newErrors.rfc = 'El formato del RFC no es válido';
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
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      return;
    }
    const clientData = {
      empresa: formData.companyName,
      contacto: formData.contactPerson,
      email: formData.email,
      telefono: formData.phone,
      industria: formData.industry,
      ubicacion: {
        direccion: formData.address,
        ciudad: formData.city,
        estado: formData.state,
        codigoPostal: formData.postalCode
      },
      ubicacionEmpre: formData.location,
      rfc: formData.rfc?.toUpperCase(),
      sitioWeb: formData.website,
      estado: formData.status,
      relacion: formData.relationshipHealth,
      fechaDesde: formData.clientSince,
      proximoSeguimiento: formData.nextFollowUp,
      notas: formData.notes,
      totalProjects: parseInt(formData.totalProjects) || 0,
      activeContracts: parseInt(formData.activeContracts) || 0,
      totalValue: parseInt(formData.totalValue) || 0,
      lastContact: formData.lastContact
    };
    console.log('Datos enviados al servicio:', clientData);
    if (mode === 'edit' && initialData && initialData.id) {
      // Actualizar cliente usando la función pasada por props
      const res = await editClient(initialData.id, clientData);
      if (res && res.success) {
        showSuccess(`Cliente "${clientData.empresa}" actualizado exitosamente.`);
        handleClose();
      } else {
        showError('Error al actualizar el cliente');
      }
    } else {
      // Crear cliente usando la función pasada por props
      const res = await createClient(clientData);
      if (res && res.success) {
        showSuccess(`Cliente "${clientData.empresa}" guardado exitosamente.`);
        handleClose();
      } else {
        showError('Error al guardar el cliente');
      }
    }
  };

  const handleClose = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      industry: '',
      location: '',
      status: 'Activo',
      relationshipHealth: 'Buena',
      rfc: '',
      clientSince: new Date()?.toISOString()?.split('T')?.[0],
      totalProjects: 0,
      activeContracts: 0,
      totalValue: 0,
      lastContact: new Date()?.toISOString()?.split('T')?.[0],
      nextFollowUp: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      website: '',
      notes: ''
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
              <h2 className="text-xl font-semibold text-foreground">Nuevo Cliente</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega un nuevo cliente al sistema
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
                <Icon name="Building2" size={20} className="mr-2" />
                Información Básica
              </h3>
            </div>

            <div>
              <Input
                label="Nombre de la Empresa"
                placeholder="Ej. Grupo Industrial Monterrey"
                value={formData?.companyName}
                onChange={(e) => handleInputChange('companyName', e?.target?.value)}
                error={errors?.companyName}
                required
              />
            </div>

            <div>
              <Input
                label="Persona de Contacto"
                placeholder="Ej. Carlos Hernández"
                value={formData?.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e?.target?.value)}
                error={errors?.contactPerson}
                required
              />
            </div>

            <div>
              <Input
                type="email"
                label="Email"
                placeholder="Ej. carlos.hernandez@empresa.com.mx"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                required
              />
            </div>

            <div>
  <Input
    type="tel"
    inputMode="numeric"
    label="Teléfono"
    placeholder="Ej. 22"
    value={formData?.phone}
    onChange={(e) => {
      const value = e.target.value;
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      handleInputChange('phone', numericValue);
    }}
    error={errors?.phone}
    required
    maxLength={10}
  />
</div>


            <div>
              <Select
                label="Industria"
                value={formData?.industry}
                onChange={(value) => handleInputChange('industry', value)}
                error={errors?.industry}
                options={industries?.map(industry => ({ value: industry, label: industry }))}
                placeholder="Selecciona una industria"
                required
              />
            </div>

            <div>
              <Input
                label="Ubicación"
                placeholder="Ej. Monterrey, N.L."
                value={formData?.location}
                onChange={(e) => handleInputChange('location', e?.target?.value)}
                error={errors?.location}
                required
              />
            </div>

            <div>
              <Input
                label="RFC"
                placeholder="Ej. GIM850315ABC"
                value={formData?.rfc}
                onChange={(e) => handleInputChange('rfc', e?.target?.value?.toUpperCase())}
                error={errors?.rfc}
                required
                maxLength="13"
              />
            </div>

            <div>
              <Input
                label="Sitio Web"
                placeholder="Ej. https://www.empresa.com.mx"
                value={formData?.website}
                onChange={(e) => handleInputChange('website', e?.target?.value)}
              />
            </div>

            {/* Información de Estado */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="Settings" size={20} className="mr-2" />
                Estado y Relación
              </h3>
            </div>

            <div>
              <Select
                label="Estado"
                value={formData?.status}
                onChange={(value) => handleInputChange('status', value)}
                options={statusOptions?.map(status => ({ value: status, label: status }))}
                required
              />
            </div>

            <div>
              <Select
                label="Salud de la Relación"
                value={formData?.relationshipHealth}
                onChange={(value) => handleInputChange('relationshipHealth', value)}
                options={relationshipHealthOptions?.map(health => ({ value: health, label: health }))}
                required
              />
            </div>

            <div>
              <Input
                type="date"
                label="Cliente Desde"
                value={formData?.clientSince}
                onChange={(e) => handleInputChange('clientSince', e?.target?.value)}
                required
              />
            </div>

            <div>
              <Input
                type="date"
                label="Próximo Seguimiento"
                value={formData?.nextFollowUp}
                onChange={(e) => handleInputChange('nextFollowUp', e?.target?.value)}
              />
            </div>

            {/* Información Adicional */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="MapPin" size={20} className="mr-2" />
                Dirección
              </h3>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Dirección"
                placeholder="Ej. Av. Constitución 1234"
                value={formData?.address}
                onChange={(e) => handleInputChange('address', e?.target?.value)}
              />
            </div>

            <div>
              <Input
                label="Ciudad"
                placeholder="Ej. Monterrey"
                value={formData?.city}
                onChange={(e) => handleInputChange('city', e?.target?.value)}
              />
            </div>

            <div>
              <Input
                label="Estado"
                placeholder="Ej. Nuevo León"
                value={formData?.state}
                onChange={(e) => handleInputChange('state', e?.target?.value)}
              />
            </div>

            <div>
              <Input
                label="Código Postal"
                placeholder="Ej. 64000"
                value={formData?.postalCode}
                onChange={(e) => handleInputChange('postalCode', e?.target?.value)}
                maxLength="5"
              />
            </div>

            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="FileText" size={20} className="mr-2" />
                Notas Adicionales
              </h3>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Notas
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-foreground"
                  rows="4"
                  placeholder="Información adicional sobre el cliente..."
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
            {mode === 'edit' ? (
              <Button
                type="submit"
                variant="default"
                iconName="Save"
                iconPosition="left"
              >
                Guardar
              </Button>
            ) : (
              <Button
                type="submit"
                variant="default"
                iconName="Plus"
                iconPosition="left"
              >
                Agregar Cliente
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientModal;