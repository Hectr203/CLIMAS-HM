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
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // 🔹 Opciones de selects
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

  // 🔹 Manejar cambios en inputs
  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
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

  // 🔹 Manejar cambios en EPP
  const handlePPEChange = (item, checked) => {
    setFormData(prev => ({
      ...prev,
      ppe: {
        ...prev.ppe,
        [item]: checked
      }
    }));
  };

  // 🔹 Guardar empleado en el endpoint
const handleSave = async () => {
  try {
    // 🔹 Mapeamos los nombres de tu frontend a los que el backend espera
    const payload = {
      nombreCompleto: formData.name?.trim(),
      empleadoId: String(formData.employeeId || "").trim(),
      email: formData.email?.trim().toLowerCase(),
      telefono: formData.phone?.replace(/\D/g, ""), // solo dígitos
      fechaIngreso: formData.hireDate,
      departamento: formData.department || null,
      puesto: formData.position || null,
      estado: formData.status || "Activo",
    };

    // 🔹 Validaciones previas (para evitar errores tontos)
    if (!payload.nombreCompleto || !payload.empleadoId || !payload.email || !payload.telefono || !payload.fechaIngreso) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!/^\d{10}$/.test(payload.telefono)) {
      alert("El teléfono debe tener exactamente 10 dígitos (México).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      alert("Por favor ingresa un correo electrónico válido.");
      return;
    }

    // 🔹 Llamada al backend
    const response = await fetch("http://localhost:7071/api/empleados/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 🔹 Manejo de errores HTTP
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error HTTP ${response.status}:`, text);

      if (response.status === 400) {
        alert("Datos inválidos o campos faltantes. Verifica la información.");
      } else if (response.status === 409) {
        alert("El empleado ya existe (correo o teléfono duplicado).");
      } else {
        alert("Ocurrió un error al guardar el empleado ❌");
      }
      return;
    }

    // 🔹 Si todo salió bien
    const newEmployee = await response.json();
    console.log("✅ Empleado creado exitosamente:", newEmployee);

    alert("Empleado creado correctamente ✅");

    if (onSave) onSave(newEmployee);
    if (onClose) onClose();

  } catch (error) {
    console.error("❌ Error al guardar empleado:", error);
    alert("Error al guardar empleado ❌. Revisa la consola para más detalles.");
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
        
        {/* 🔹 Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon
              name={mode === 'create' ? 'UserPlus' : mode === 'edit' ? 'Edit' : 'Eye'}
              size={24}
              className="text-primary"
            />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'create' ? 'Nuevo Empleado' : mode === 'edit' ? 'Editar Empleado' : 'Perfil del Empleado'}
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

        {/* 🔹 Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
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

        {/* 🔹 Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre Completo" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} disabled={mode === 'view'} required />
                <Input label="ID de Empleado" value={formData.employeeId} onChange={e => handleInputChange('employeeId', e.target.value)} disabled={mode === 'view'} required />
                <Input label="Correo Electrónico" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} disabled={mode === 'view'} required />
                <Input label="Teléfono" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} disabled={mode === 'view'} required />
                <Select label="Departamento" options={departmentOptions} value={formData.department} onChange={value => handleInputChange('department', value)} disabled={mode === 'view'} />
                <Select label="Puesto" options={positionOptions} value={formData.position} onChange={value => handleInputChange('position', value)} disabled={mode === 'view'} />
                <Input label="Fecha de Ingreso" type="date" value={formData.hireDate} onChange={e => handleInputChange('hireDate', e.target.value)} disabled={mode === 'view'} />
                <Select label="Estado" options={statusOptions} value={formData.status} onChange={value => handleInputChange('status', value)} disabled={mode === 'view'} />
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Último Examen Médico" type="date" value={formData.medicalStudies.lastExam || ''} onChange={e => handleInputChange('medicalStudies.lastExam', e.target.value)} disabled={mode === 'view'} />
                <Input label="Próximo Examen Médico" type="date" value={formData.medicalStudies.nextExam || ''} onChange={e => handleInputChange('medicalStudies.nextExam', e.target.value)} disabled={mode === 'view'} />
                <Select label="Estado de Estudios Médicos" options={medicalStatusOptions} value={formData.medicalStudies.status || 'Pendiente'} onChange={value => handleInputChange('medicalStudies.status', value)} disabled={mode === 'view'} />
              </div>
            </div>
          )}

          {activeTab === 'ppe' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Checkbox label="Casco de Seguridad" checked={formData.ppe.helmet} onChange={e => handlePPEChange('helmet', e.target.checked)} disabled={mode === 'view'} />
                  <Checkbox label="Chaleco Reflectivo" checked={formData.ppe.vest} onChange={e => handlePPEChange('vest', e.target.checked)} disabled={mode === 'view'} />
                  <Checkbox label="Botas de Seguridad" checked={formData.ppe.boots} onChange={e => handlePPEChange('boots', e.target.checked)} disabled={mode === 'view'} />
                  <Checkbox label="Guantes de Trabajo" checked={formData.ppe.gloves} onChange={e => handlePPEChange('gloves', e.target.checked)} disabled={mode === 'view'} />
                  <Checkbox label="Gafas de Seguridad" checked={formData.ppe.glasses} onChange={e => handlePPEChange('glasses', e.target.checked)} disabled={mode === 'view'} />
                  <Checkbox label="Mascarilla" checked={formData.ppe.mask} onChange={e => handlePPEChange('mask', e.target.checked)} disabled={mode === 'view'} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre del Contacto" value={formData.emergencyContact.name} onChange={e => handleInputChange('emergencyContact.name', e.target.value)} disabled={mode === 'view'} />
                <Input label="Teléfono de Contacto" type="tel" value={formData.emergencyContact.phone} onChange={e => handleInputChange('emergencyContact.phone', e.target.value)} disabled={mode === 'view'} />
                <Select label="Relación" options={relationshipOptions} value={formData.emergencyContact.relationship} onChange={value => handleInputChange('emergencyContact.relationship', value)} disabled={mode === 'view'} />
              </div>
            </div>
          )}
        </div>

        {/* 🔹 Footer */}
        {mode !== 'view' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} iconName="Save" iconPosition="left" iconSize={16}>
              {isSaving ? 'Guardando...' : mode === 'create' ? 'Crear Empleado' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelModal;
