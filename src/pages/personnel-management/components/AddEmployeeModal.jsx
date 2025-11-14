import React, { useState } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import usePerson from '../../../hooks/usePerson';
import { 
  departmentOptions, 
  positionOptions, 
  statusOptions, 
  medicalStatusOptions, 
  relationshipOptions 
} from './personnelConstants';

const AddEmployeeModal = ({ isOpen, onClose, onSave }) => {
  const [localError, setLocalError] = useState(null);
  const { createPerson } = usePerson();
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

  const [step, setStep] = useState(0);
  const steps = ['general', 'medical', 'ppe', 'emergency'];

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

  const handleSave = async () => {
    setLocalError(null);
    try {
      const payload = {
        nombreCompleto: formData.name,
        empleadoId: formData.employeeId,
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
        activo: true
      };

      const result = await createPerson(payload);
      showSuccess('Empleado registrado correctamente ✅');

      if (onSave) onSave(result);
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      if (error?.status === 409 && error?.data?.error?.includes('correo')) {
        setLocalError(error);
      }
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'Información General', icon: 'User' },
    { id: 'medical', label: 'Archivos', icon: 'FileText' },
    { id: 'ppe', label: 'EPP', icon: 'Shield' },
    { id: 'emergency', label: 'Contacto de Emergencia', icon: 'Phone' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1050 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="UserPlus" size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Nuevo Empleado</h2>
              <p className="text-sm text-muted-foreground">Agregar nuevo empleado al sistema</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs - deshabilitados durante creación */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                disabled={true}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth cursor-not-allowed opacity-60 ${
                  step === idx
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Información General */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                <Input
                  label="ID de Empleado"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  required
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  required
                />
                {(localError?.status === 409 && localError?.data?.error?.includes('correo')) && (
                  <span className="block text-xs text-red-600 mt-1">Este correo ya está registrado</span>
                )}
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
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
                />
                <Select
                  label="Departamento"
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(value) => handleInputChange('department', value)}
                />
                <Select
                  label="Puesto"
                  options={positionOptions}
                  value={formData.position}
                  onChange={(value) => handleInputChange('position', value)}
                />
                <Input
                  label="Fecha de Ingreso"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  required
                />
                <Select
                  label="Estado"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                />
              </div>
            </div>
          )}

          {/* Estudios Médicos */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Último Examen Médico"
                  type="date"
                  value={formData.medicalStudies.lastExam}
                  onChange={(e) => handleInputChange('medicalStudies.lastExam', e.target.value)}
                />
                <Input
                  label="Próximo Examen Médico"
                  type="date"
                  value={formData.medicalStudies.nextExam}
                  onChange={(e) => handleInputChange('medicalStudies.nextExam', e.target.value)}
                />
                <Select
                  label="Estado de Estudios Médicos"
                  options={medicalStatusOptions}
                  value={formData.medicalStudies.status}
                  onChange={(value) => handleInputChange('medicalStudies.status', value)}
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
                  <Button variant="outline" size="sm" iconName="Upload" iconPosition="left" iconSize={14}>
                    Subir Documento
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* EPP */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Equipo de Protección Personal</h4>
                  <div className="space-y-3">
                    <Checkbox
                      label="Casco de Seguridad"
                      checked={formData.ppe.helmet || false}
                      onChange={(e) => handlePPEChange('helmet', e.target.checked)}
                    />
                    <Checkbox
                      label="Chaleco Reflectivo"
                      checked={formData.ppe.vest || false}
                      onChange={(e) => handlePPEChange('vest', e.target.checked)}
                    />
                    <Checkbox
                      label="Botas de Seguridad"
                      checked={formData.ppe.boots || false}
                      onChange={(e) => handlePPEChange('boots', e.target.checked)}
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
                    />
                    <Checkbox
                      label="Gafas de Seguridad"
                      checked={formData.ppe.glasses || false}
                      onChange={(e) => handlePPEChange('glasses', e.target.checked)}
                    />
                    <Checkbox
                      label="Mascarilla"
                      checked={formData.ppe.mask || false}
                      onChange={(e) => handlePPEChange('mask', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contacto de Emergencia */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre del Contacto"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                />
                <Input
                  label="Teléfono de Contacto"
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                />
                <Select
                  label="Relación"
                  options={relationshipOptions}
                  value={formData.emergencyContact.relationship}
                  onChange={(value) => handleInputChange('emergencyContact.relationship', value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {step > 0 && (
            <Button
              variant="secondary"
              onClick={() => setStep((prev) => prev - 1)}
              iconName="ArrowLeft"
              iconPosition="left"
              disabled={localError?.status === 409 && localError?.data?.error?.includes('correo')}
            >
              Anterior
            </Button>
          )}
          {step < steps.length - 1 ? (
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
              onClick={handleSave}
              iconName="Save"
              iconPosition="left"
              disabled={localError?.status === 409 && localError?.data?.error?.includes('correo')}
            >
              Crear Empleado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;

