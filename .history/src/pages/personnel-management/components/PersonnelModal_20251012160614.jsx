import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import usePerson from '../../../hooks/usePerson';

const PersonnelModal = ({ isOpen, onClose, employee, mode, onSave }) => {
  const { createPerson } = usePerson();

  // 🔹 Estado inicial del formulario
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

  const [activeTab, setActiveTab] = useState('general');

  // 🔹 Cargar datos del empleado seleccionado al abrir el modal
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.nombreCompleto || '',
        employeeId: employee.empleadoId || '',
        email: employee.email || '',
        phone: employee.telefono || '',
        department: employee.departamento || '',
        position: employee.puesto || '',
        hireDate: employee.fechaIngreso || '',
        status: employee.estado || 'Activo',
        medicalStudies: employee.medicalStudies || {
          lastExam: '',
          nextExam: '',
          status: 'Pendiente',
          documents: []
        },
        ppe: employee.ppe || {
          helmet: false,
          vest: false,
          boots: false,
          gloves: false,
          glasses: false,
          mask: false
        },
        certifications: employee.certifications || [],
        emergencyContact: employee.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
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
  }, [employee, isOpen]);

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
        activo: true
      };

      console.log('Enviando empleado:', payload);

      const result = await createPerson(payload);

      console.log('Empleado creado:', result);
      alert('Empleado registrado exitosamente');

      if (onSave) onSave(result);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Hubo un error al guardar el empleado. Revisa la consola.');
    }
  };

  // 🔹 Tabs del modal
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
            <Icon
              name={
                mode === 'create'
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
                {mode === 'create'
                  ? 'Nuevo Empleado'
                  : mode === 'edit'
                  ? 'Editar Empleado'
                  : 'Perfil del Empleado'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'create'
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

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  value={formData.name}
                  onChange={(e) =>
                    handleInputChange('name', e.target.value)
                  }
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="ID de Empleado"
                  value={formData.employeeId}
                  onChange={(e) =>
                    handleInputChange('employeeId', e.target.value)
                  }
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange('email', e.target.value)
                  }
                  required
                  disabled={mode === 'view'}
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange('phone', e.target.value)
                  }
                  required
                  disabled={mode === 'view'}
                />
                <Select
                  label="Departamento"
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(value) =>
                    handleInputChange('department', value)
                  }
                  disabled={mode === 'view'}
                />
                <Select
                  label="Puesto"
                  options={positionOptions}
                  value={formData.position}
                  onChange={(value) =>
                    handleInputChange('position', value)
                  }
                  disabled={mode === 'view'}
                />
                <Input
                  label="Fecha de Ingreso"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) =>
                    handleInputChange('hireDate', e.target.value)
                  }
                  required
                  disabled={mode === 'view'}
                />
                <Select
                  label="Estado"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) =>
                    handleInputChange('status', value)
                  }
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
                  value={formData.medicalStudies.lastExam || ''}
                  onChange={(e) =>
                    handleInputChange('medicalStudies.lastExam', e.target.value)
                  }
                  disabled={mode === 'view'}
                />
                <Input
                  label="Próximo Examen Médico"
                  type="date"
                  value={formData.medicalStudies.nextExam || ''}
                  onChange={(e) =>
                    handleInputChange('medicalStudies.nextExam', e.target.value)
                  }
                  disabled={mode === 'view'}
                />
                <Select
                  label="Estado de Estudios Médicos"
                  options={medicalStatusOptions}
                  value={formData.medicalStudies.status || 'Pendiente'}
                  onChange={(value) =>
                    handleInputChange('medicalStudies.status', value)
                  }
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          )}

          {activeTab === 'ppe' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Equipo de Protección Personal
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(formData.ppe).map((key) => (
                      <Checkbox
                        key={key}
                        label={
                          key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/([A-Z])/g, ' $1')
                        }
                        checked={formData.ppe[key]}
                        onChange={(e) =>
                          handlePPEChange(key, e.target.checked)
                        }
                        disabled={mode === 'view'}
                      />
                    ))}
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
                  value={formData.emergencyContact.name || ''}
                  onChange={(e) =>
                    handleInputChange('emergencyContact.name', e.target.value)
                  }
                  disabled={mode === 'view'}
                />
                <Input
                  label="Teléfono de Contacto"
                  type="tel"
                  value={formData.emergencyContact.phone || ''}
                  onChange={(e) =>
                    handleInputChange('emergencyContact.phone', e.target.value)
                  }
                  disabled={mode === 'view'}
                />
                <Select
                  label="Relación"
                  options={relationshipOptions}
                  value={formData.emergencyContact.relationship || ''}
                  onChange={(value) =>
                    handleInputChange('emergencyContact.relationship', value)
                  }
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
            <Button onClick={handleSave} iconName="Save" iconPosition="left">
              {mode === 'create' ? 'Crear Empleado' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelModal;
