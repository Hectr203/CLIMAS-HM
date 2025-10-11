import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';


const PersonnelModal = ({ isOpen, onClose, employee, mode, onSave }) => {
  const [formData, setFormData] = useState(employee || {
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

  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

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

  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev?.[parent],
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
        ...prev?.ppe,
        [item]: checked
      }
    }));
  };

const handleSave = async () => {
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
      activo: true,
    };

    console.log("Enviando correcta", payload);

    const response = await fetch("/api/empleados/crear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error backend:", errorText);
      throw new Error("Error al registrar el empleado");
    }

    const result = await response.json();
    console.log("✅ Empleado creado:", result);

    alert("Empleado registrado exitosamente");

    if (onSave) onSave(result.data);
    onClose();
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    alert("Hubo un error al guardar el empleado. Revisa la consola.");
  }
};



  const tabs = [
    { id: 'general', label: 'Información General', icon: 'User' },
    { id: 'medical', label: 'Estudios Médicos', icon: 'Heart' },
    { id: 'ppe', label: 'EPP', icon: 'Shield' },
    { id: 'emergency', label: 'Contacto de Emergencia', icon: 'Phone' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1050 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name={mode === 'create' ? 'UserPlus' : mode === 'edit' ? 'Edit' : 'Eye'} size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'create' ? 'Nuevo Empleado' : mode === 'edit' ? 'Editar Empleado' : 'Perfil del Empleado'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'create' ? 'Agregar nuevo empleado al sistema' : 
                 mode === 'edit' ? 'Modificar información del empleado' : 
                 'Ver detalles del empleado'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  value={formData?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="ID de Empleado"
                  value={formData?.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e?.target?.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData?.email}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData?.phone}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Select
                  label="Departamento"
                  options={departmentOptions}
                  value={formData?.department}
                  onChange={(value) => handleInputChange('department', value)}
                  disabled={mode === 'view'}
                />
                <Select
                  label="Puesto"
                  options={positionOptions}
                  value={formData?.position}
                  onChange={(value) => handleInputChange('position', value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Fecha de Ingreso"
                  type="date"
                  value={formData?.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e?.target?.value)}
                  required
                  disabled={mode === 'view'}
                />
                <Select
                  label="Estado"
                  options={statusOptions}
                  value={formData?.status}
                  onChange={(value) => handleInputChange('status', value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Último Examen Médico"
                  type="date"
                  value={formData?.medicalStudies?.lastExam || ''}
                  onChange={(e) => handleInputChange('medicalStudies.lastExam', e?.target?.value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Próximo Examen Médico"
                  type="date"
                  value={formData?.medicalStudies?.nextExam || ''}
                  onChange={(e) => handleInputChange('medicalStudies.nextExam', e?.target?.value)}
                  disabled={mode === 'view'}
                />
                <Select
                  label="Estado de Estudios Médicos"
                  options={medicalStatusOptions}
                  value={formData?.medicalStudies?.status || 'Pendiente'}
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

          {activeTab === 'ppe' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Equipo de Protección Personal</h4>
                  <div className="space-y-3">
                    <Checkbox
                      label="Casco de Seguridad"
                      checked={formData?.ppe?.helmet || false}
                      onChange={(e) => handlePPEChange('helmet', e?.target?.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Chaleco Reflectivo"
                      checked={formData?.ppe?.vest || false}
                      onChange={(e) => handlePPEChange('vest', e?.target?.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Botas de Seguridad"
                      checked={formData?.ppe?.boots || false}
                      onChange={(e) => handlePPEChange('boots', e?.target?.checked)}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Equipo Adicional</h4>
                  <div className="space-y-3">
                    <Checkbox
                      label="Guantes de Trabajo"
                      checked={formData?.ppe?.gloves || false}
                      onChange={(e) => handlePPEChange('gloves', e?.target?.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Gafas de Seguridad"
                      checked={formData?.ppe?.glasses || false}
                      onChange={(e) => handlePPEChange('glasses', e?.target?.checked)}
                      disabled={mode === 'view'}
                    />
                    <Checkbox
                      label="Mascarilla"
                      checked={formData?.ppe?.mask || false}
                      onChange={(e) => handlePPEChange('mask', e?.target?.checked)}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre del Contacto"
                  value={formData?.emergencyContact?.name || ''}
                  onChange={(e) => handleInputChange('emergencyContact.name', e?.target?.value)}
                  disabled={mode === 'view'}
                />
                <Input
                  label="Teléfono de Contacto"
                  type="tel"
                  value={formData?.emergencyContact?.phone || ''}
                  onChange={(e) => handleInputChange('emergencyContact.phone', e?.target?.value)}
                  disabled={mode === 'view'}
                />
                <Select
                  label="Relación"
                  options={relationshipOptions}
                  value={formData?.emergencyContact?.relationship || ''}
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
            <Button onClick={handleSave} iconName="Save" iconPosition="left" iconSize={16}>
              {mode === 'create' ? 'Crear Empleado' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelModal;