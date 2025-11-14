import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import usePerson from '../../../hooks/usePerson';

const PersonnelModal = ({ isOpen, onClose, employee, mode, onSave, error, openedFromEPP }) => {
  const [localError, setLocalError] = useState(null);
  const { createPerson, updatePersonByEmpleadoId } = usePerson();
  const { showSuccess } = useNotifications();
 
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hireDate: '',
    status: 'Activo',
    medicalStudies: {
      lastExam: '',
      nextExam: '',
      status: 'Pendiente',
      documents: []
    },
    ppe: {
      helmet: false,
      vest: false,
      boots: false,
      gloves: false,
      glasses: false,
      mask: false
    },
    certifications: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  // Secuencia de pasos
  const steps = ['general', 'medical', 'ppe', 'emergency'];
  const [step, setStep] = useState(openedFromEPP ? 2 : 0); // Si openedFromEPP, inicia en EPP

  // Si openedFromEPP, bloquear navegación y mostrar solo EPP
  const isEPPOnly = openedFromEPP === true;

  // 🔹 Cargar datos del empleado seleccionado al abrir el modal
  useEffect(() => {
    if (employee) {
      // Extraer el primer elemento si viene como arreglo
      const medicalStudies = Array.isArray(employee.examenesMedicos)
        ? employee.examenesMedicos[0] || { lastExam: '', nextExam: '', status: 'Pendiente', documents: [] }
        : employee.medicalStudies || { lastExam: '', nextExam: '', status: 'Pendiente', documents: [] };

      const ppe = Array.isArray(employee.equipos)
        ? employee.equipos[0] || { helmet: false, vest: false, boots: false, gloves: false, glasses: false, mask: false }
        : employee.ppe || { helmet: false, vest: false, boots: false, gloves: false, glasses: false, mask: false };

      const emergencyContact = Array.isArray(employee.contactoEmergencia)
        ? employee.contactoEmergencia[0] || { name: '', phone: '', relationship: '' }
        : employee.emergencyContact || { name: '', phone: '', relationship: '' };

      setFormData({
        name: employee.nombreCompleto || '',
        employeeId: employee.empleadoId || '',
        email: employee.email || '',
        phone: employee.telefono || '',
        department: employee.departamento || '',
        position: employee.puesto || '',
        hireDate: employee.fechaIngreso || '',
        status: employee.estado || 'Activo',
        medicalStudies,
        ppe,
        certifications: employee.certifications || [],
        emergencyContact
      });
    } else {
      // Si es creación, reinicia el formulario
      setFormData({
        name: '',
        employeeId: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        hireDate: '',
        status: 'Activo',
        medicalStudies: {
          lastExam: '',
          nextExam: '',
          status: 'Pendiente',
          documents: []
        },
        ppe: {
          helmet: false,
          vest: false,
          boots: false,
          gloves: false,
          glasses: false,
          mask: false
        },
        certifications: [],
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    }
    setStep(openedFromEPP ? 2 : 0);
  }, [employee, isOpen, openedFromEPP]);

  if (!isOpen) return null;

  // 🔹 Opciones de select
  const departmentOptions = [
    { value: 'Administración', label: 'Administración' },
    { value: 'Proyectos', label: 'Proyectos' },
    { value: 'Taller', label: 'Taller' },
    { value: 'Ventas', label: 'Ventas' },
    { value: 'Mantenimiento', label: 'Mantenimiento' }
  ];

  const positionOptions = [
    { value: 'Técnico HVAC', label: 'Técnico HVAC' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Ingeniero', label: 'Ingeniero' },
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Vendedor', label: 'Vendedor' },
    { value: 'Operario', label: 'Operario' }
  ];

  const statusOptions = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'Suspendido', label: 'Suspendido' }
  ];

  const medicalStatusOptions = [
    { value: 'Completo', label: 'Completo' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Vencido', label: 'Vencido' }
  ];

  const relationshipOptions = [
    { value: 'Cónyuge', label: 'Cónyuge' },
    { value: 'Padre/Madre', label: 'Padre/Madre' },
    { value: 'Hijo/Hija', label: 'Hijo/Hija' },
    { value: 'Hermano/Hermana', label: 'Hermano/Hermana' },
    { value: 'Otro', label: 'Otro' }
  ];

  // 🔹 Actualizar campos
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePPEChange = (item, checked) => {
    setFormData(prev => ({
      ...prev,
      ppe: {
        ...prev.ppe,
        [item]: checked
      }
    }));
  };

  // 🔹 Guardar nuevo empleado

  // (Ya está declarada al inicio, se elimina duplicado)

  const handleSave = async () => {
    setLocalError(null);
    try {
      const payload = {
        nombreCompleto: formData.name,
        email: formData.email,
        telefono: formData.phone,
        departamento: formData.department,
        puesto: formData.position,
        fechaIngreso: formData.hireDate,
        estado: formData.status,
        examenesMedicos: [formData.medicalStudies],
        equipos: [formData.ppe],
        contactoEmergencia: [formData.emergencyContact],
        certifications: formData.certifications ?? [],
      };

      console.log("Payload enviado:", payload);

      let result;
      if (mode === 'edit' && formData.employeeId) {
        result = await updatePersonByEmpleadoId(formData.employeeId, payload);
        showSuccess('Empleado actualizado correctamente ✅');
      } else {
        result = await createPerson({ ...payload, empleadoId: formData.employeeId, activo: true });
        showSuccess('Empleado registrado correctamente ✅');
      }

      if (onSave) onSave(result);
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      if (error?.status === 409 && error?.data?.error?.includes('correo')) {
        setLocalError(error);
      }
    }
  };


  // 🔹 Tabs del modal (solo para mostrar, deshabilitados)
  const tabs = [
  { id: 'general', label: 'Información General', icon: 'User' },
  { id: 'medical', label: 'Archivos', icon: 'FileText' },
  { id: 'ppe', label: 'EPP', icon: 'Shield' },
  { id: 'emergency', label: 'Contacto de Emergencia', icon: 'Phone' }
  ];

  // Traducción de EPP
  const ppeLabels = {
    helmet: 'Casco',
    vest: 'Chaleco',
    boots: 'Botas',
    gloves: 'Guantes',
    glasses: 'Gafas',
    mask: 'Mascarilla'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1050 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon
              name={
                openedFromEPP
                  ? 'Shield'
                  : mode === 'create'
                  ? 'UserPlus'
                  : mode === 'edit'
                  ? 'Edit'
                  : 'Eye'
              }
              size={24}
              className="text-primary"
            />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {openedFromEPP
                  ? 'Editar Equipo de Protección Personal'
                  : mode === 'create'
                  ? 'Nuevo Empleado'
                  : mode === 'edit'
                  ? 'Editar Empleado'
                  : 'Perfil del Empleado'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {openedFromEPP
                  ? 'Modificar información de EPP del empleado'
                  : mode === 'create'
                  ? 'Agregar nuevo empleado al sistema'
                  : mode === 'edit'
                  ? 'Modificar información del empleado'
                  : 'Ver detalles del empleado'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs: solo mostrar si no es flujo EPP */}
        {!isEPPOnly && (
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  disabled={mode === 'create'}
                  onClick={mode !== 'create' ? () => setStep(idx) : undefined}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                    step === idx
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground'
                  } ${mode === 'create' ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Contenido: solo mostrar EPP si es flujo EPP */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Información General */}
          {!isEPPOnly && step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  value={mode === 'view' ? (employee?.nombreCompleto ?? '') : formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="ID de Empleado"
                  value={mode === 'view' ? (employee?.empleadoId ?? '') : formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={mode === 'view' ? (employee?.email ?? '') : formData.email}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  required
                  disabled={mode === 'view'}
                />
                {(localError?.status === 409 && localError?.data?.error?.includes('correo')) && (
                  <span className="block text-xs text-red-600 mt-1">Este correo ya está registrado</span>
                )}
                <Input
                  label="Teléfono"
                  type="tel"
                  value={mode === 'view' ? (employee?.telefono ?? '') : formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      handleInputChange('phone', value);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.length !== 10) {
                      alert('El número de teléfono debe tener exactamente 10 dígitos.');
                    }
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="\d{10}"
                  placeholder="Ingresa 10 dígitos"
                  required
                  disabled={mode === 'view'}
                />
                <Select
                  label="Departamento"
                  options={departmentOptions}
                  value={mode === 'view' ? (employee?.departamento ?? '') : formData.department}
                  onChange={(value) => handleInputChange('department', value)}
                  disabled={mode === 'view'}
                />
                <Select
                  label="Puesto"
                  options={positionOptions}
                  value={mode === 'view' ? (employee?.puesto ?? '') : formData.position}
                  onChange={(value) => handleInputChange('position', value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Fecha de Ingreso"
                  type="date"
                  value={mode === 'view' ? (employee?.fechaIngreso ?? '') : formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Select
                  label="Estado"
                  options={statusOptions}
                  value={mode === 'view' ? (employee?.estado ?? '') : formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          )}

          {/* Estudios Médicos */}
          {!isEPPOnly && step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Último Examen Médico"
                  type="date"
                  value={mode === 'view' ? (employee?.medicalStudies?.lastExam ?? '') : formData.medicalStudies.lastExam}
                  onChange={(e) => handleInputChange('medicalStudies.lastExam', e.target.value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Próximo Examen Médico"
                  type="date"
                  value={mode === 'view' ? (employee?.medicalStudies?.nextExam ?? '') : formData.medicalStudies.nextExam}
                  onChange={(e) => handleInputChange('medicalStudies.nextExam', e.target.value)}
                  disabled={mode === 'view'}
                />
                <Select
                  label="Estado de Estudios Médicos"
                  options={medicalStatusOptions}
                  value={mode === 'view' ? (employee?.medicalStudies?.status ?? 'Pendiente') : formData.medicalStudies.status}
                  onChange={(value) => handleInputChange('medicalStudies.status', value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Documentos Médicos</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="FileText" size={16} />
                      <span className="text-sm text-foreground">Examen médico general</span>
                    </div>
                    <Button variant="ghost" size="sm" iconName="Download" iconSize={14}>
                      Descargar
                    </Button>
                  </div>
                  {mode !== 'view' && (
                    <Button variant="outline" size="sm" iconName="Upload" iconPosition="left" iconSize={14}>
                      Subir Documento
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EPP */}
          {isEPPOnly ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Equipo de Protección Personal</h4>
                  <div className="space-y-3">
                    <Checkbox
                      label="Casco de Seguridad"
                      checked={formData.ppe.helmet || false}
                      onChange={(e) => handlePPEChange('helmet', e.target.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Chaleco Reflectivo"
                      checked={formData.ppe.vest || false}
                      onChange={(e) => handlePPEChange('vest', e.target.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Botas de Seguridad"
                      checked={formData.ppe.boots || false}
                      onChange={(e) => handlePPEChange('boots', e.target.checked)}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Equipo Adicional</h4>
                  <div className="space-y-3">
                    <Checkbox
                      label="Guantes de Trabajo"
                      checked={formData.ppe.gloves || false}
                      onChange={(e) => handlePPEChange('gloves', e.target.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Gafas de Seguridad"
                      checked={formData.ppe.glasses || false}
                      onChange={(e) => handlePPEChange('glasses', e.target.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Mascarilla"
                      checked={formData.ppe.mask || false}
                      onChange={(e) => handlePPEChange('mask', e.target.checked)}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Equipo de Protección Personal</h4>
                    <div className="space-y-3">
                      <Checkbox
                        label="Casco de Seguridad"
                        checked={mode === 'view' ? (employee?.ppe?.helmet ?? false) : formData.ppe.helmet}
                        onChange={(e) => handlePPEChange('helmet', e.target.checked)}
                        disabled={mode === 'view'}
                      />
                      <Checkbox
                        label="Chaleco Reflectivo"
                        checked={mode === 'view' ? (employee?.ppe?.vest ?? false) : formData.ppe.vest}
                        onChange={(e) => handlePPEChange('vest', e.target.checked)}
                        disabled={mode === 'view'}
                      />
                      <Checkbox
                        label="Botas de Seguridad"
                        checked={mode === 'view' ? (employee?.ppe?.boots ?? false) : formData.ppe.boots}
                        onChange={(e) => handlePPEChange('boots', e.target.checked)}
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Equipo Adicional</h4>
                    <div className="space-y-3">
                      <Checkbox
                        label="Guantes de Trabajo"
                        checked={mode === 'view' ? (employee?.ppe?.gloves ?? false) : formData.ppe.gloves}
                        onChange={(e) => handlePPEChange('gloves', e.target.checked)}
                        disabled={mode === 'view'}
                      />
                      <Checkbox
                        label="Gafas de Seguridad"
                        checked={mode === 'view' ? (employee?.ppe?.glasses ?? false) : formData.ppe.glasses}
                        onChange={(e) => handlePPEChange('glasses', e.target.checked)}
                        disabled={mode === 'view'}
                      />
                      <Checkbox
                        label="Mascarilla"
                        checked={mode === 'view' ? (employee?.ppe?.mask ?? false) : formData.ppe.mask}
                        onChange={(e) => handlePPEChange('mask', e.target.checked)}
                        disabled={mode === 'view'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Contacto de Emergencia */}
          {!isEPPOnly && step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre del Contacto"
                  value={mode === 'view' ? (employee?.emergencyContact?.name ?? '') : formData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Teléfono de Contacto"
                  type="tel"
                  value={mode === 'view' ? (employee?.emergencyContact?.phone ?? '') : formData.emergencyContact.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Solo permitir números y limitar a 10 dígitos
                    const numericValue = value.replace(/\D/g, '').slice(0, 10);
                    handleInputChange('emergencyContact.phone', numericValue);
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Ingresa 10 dígitos"
                  description={
                    mode !== 'view' 
                      ? `${(formData.emergencyContact.phone || '').length}/10 dígitos`
                      : undefined
                  }
                  disabled={mode === 'view'}
                />
                <Select
                  label="Relación"
                  options={relationshipOptions}
                  value={mode === 'view' ? (employee?.emergencyContact?.relationship ?? '') : formData.emergencyContact.relationship}
                  onChange={(value) => handleInputChange('emergencyContact.relationship', value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode !== 'view' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {/* Botón Anterior: solo si no es flujo EPP y no estamos en el primer paso */}
            {!openedFromEPP && step > 0 && (
              <Button
                variant="secondary"
                onClick={() => setStep((prev) => prev - 1)}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Anterior
              </Button>
            )}
            {/* Botón especial Guardar EPP */}
            {openedFromEPP && step === 2 ? (
              <Button
                onClick={async () => {
                  setLocalError(null);
                  try {
                    // Solo actualiza EPP
                    const payload = {
                      ppe: formData.ppe
                    };
                    let result;
                    if (mode === 'edit' && formData.employeeId) {
                      result = await updatePersonByEmpleadoId(formData.employeeId, payload);
                      showSuccess('EPP actualizado correctamente ✅');
                    }
                    if (onSave) onSave(result);
                    onClose();
                  } catch (error) {
                    console.error("Error al guardar EPP:", error);
                    if (error?.status === 409 && error?.data?.error?.includes('correo')) {
                      setLocalError(error);
                    }
                  }
                }}
                iconName="Save"
                iconPosition="left"
                disabled={localError?.status === 409 && localError?.data?.error?.includes('correo')}
              >
                Guardar EPP
              </Button>
            ) : (
              step < steps.length - 1 ? (
                <Button
                  onClick={() => setStep((prev) => prev + 1)}
                  iconName="ArrowRight"
                  iconPosition="right"
                  disabled={localError?.status === 409 && localError?.data?.error?.includes('correo')}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    setLocalError(null);
                    try {
                      // Unificar todos los datos para guardar
                      const payload = {
                        nombreCompleto: formData.name,
                        empleadoId: formData.employeeId,
                        email: formData.email,
                        telefono: formData.phone,
                        departamento: formData.department,
                        puesto: formData.position,
                        fechaIngreso: formData.hireDate,
                        estado: formData.status,
                        medicalStudies: formData.medicalStudies,
                        ppe: formData.ppe,
                        certifications: formData.certifications,
                        emergencyContact: formData.emergencyContact
                      };
                      let result;
                      if (mode === 'edit' && formData.employeeId) {
                        result = await updatePersonByEmpleadoId(formData.employeeId, payload);
                        showSuccess('Empleado actualizado correctamente ✅');
                      } else {
                        result = await createPerson({ ...payload, activo: true });
                        showSuccess('Empleado registrado correctamente ✅');
                      }
                      if (onSave) onSave(result);
                      onClose();
                    } catch (error) {
                      console.error("Error al guardar:", error);
                      if (error?.status === 409 && error?.data?.error?.includes('correo')) {
                        setLocalError(error);
                      }
                    }
                  }}
                  iconName="Save"
                  iconPosition="left"
                  disabled={localError?.status === 409 && localError?.data?.error?.includes('correo')}
                >
                  {mode === 'create' ? 'Crear Empleado' : 'Guardar Cambios'}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelModal;