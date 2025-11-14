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
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [fullEmployeeData, setFullEmployeeData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { createPerson, updatePersonByEmpleadoId, getPersonByEmpleadoId } = usePerson();
  const { showSuccess, showError } = useNotifications();
 
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

  // 🔹 Función helper para cargar datos del empleado en el formulario
  const loadEmployeeData = (emp) => {
    if (!emp) return;

    // Extraer medicalStudies: priorizar objeto medicalStudies, luego array examenesMedicos
    let medicalStudies = { lastExam: '', nextExam: '', status: 'Pendiente', documents: [] };
    if (emp.medicalStudies && typeof emp.medicalStudies === 'object' && !Array.isArray(emp.medicalStudies)) {
      medicalStudies = {
        lastExam: emp.medicalStudies.lastExam || '',
        nextExam: emp.medicalStudies.nextExam || '',
        status: emp.medicalStudies.status || 'Pendiente',
        documents: emp.medicalStudies.documents || []
      };
    } else if (Array.isArray(emp.examenesMedicos) && emp.examenesMedicos.length > 0) {
      medicalStudies = emp.examenesMedicos[0];
    }

    // Extraer ppe: priorizar objeto ppe, luego array equipos
    let ppe = { helmet: false, vest: false, boots: false, gloves: false, glasses: false, mask: false };
    if (emp.ppe && typeof emp.ppe === 'object' && !Array.isArray(emp.ppe)) {
      ppe = {
        helmet: emp.ppe.helmet || false,
        vest: emp.ppe.vest || false,
        boots: emp.ppe.boots || false,
        gloves: emp.ppe.gloves || false,
        glasses: emp.ppe.glasses || false,
        mask: emp.ppe.mask || false
      };
    } else if (Array.isArray(emp.equipos) && emp.equipos.length > 0) {
      ppe = emp.equipos[0];
    }

    // Extraer contacto de emergencia: priorizar objeto emergencyContact, luego array contactoEmergencia
    let emergencyContact = { name: '', phone: '', relationship: '' };
    if (emp.emergencyContact && typeof emp.emergencyContact === 'object' && !Array.isArray(emp.emergencyContact)) {
      emergencyContact = {
        name: emp.emergencyContact.name || '',
        phone: emp.emergencyContact.phone || '',
        relationship: emp.emergencyContact.relationship || ''
      };
    } else if (Array.isArray(emp.contactoEmergencia) && emp.contactoEmergencia.length > 0) {
      emergencyContact = emp.contactoEmergencia[0];
    }

    setFormData({
      name: emp.nombreCompleto || '',
      employeeId: emp.empleadoId || '',
      email: emp.email || '',
      phone: emp.telefono || '',
      department: emp.departamento || '',
      position: emp.puesto || '',
      hireDate: emp.fechaIngreso || '',
      status: emp.estado || 'Activo',
      medicalStudies,
      ppe,
      certifications: emp.certifications || [],
      emergencyContact
    });
  };

  // 🔹 Cargar datos del empleado seleccionado al abrir el modal
  useEffect(() => {
    // Solo cargar datos cuando el modal esté abierto
    if (!isOpen) return;

    // Si es modo view y tenemos empleadoId, obtener datos completos del backend
    if (mode === 'view' && employee?.empleadoId) {
      setLoadingEmployee(true);
      getPersonByEmpleadoId(employee.empleadoId)
        .then((fullData) => {
          if (fullData) {
            setFullEmployeeData(fullData);
            loadEmployeeData(fullData);
          } else {
            // Si no se obtienen datos completos, usar los datos del empleado pasado como prop
            loadEmployeeData(employee);
          }
        })
        .catch((err) => {
          console.error("Error al obtener datos completos del empleado:", err);
          // En caso de error, usar los datos del empleado pasado como prop
          loadEmployeeData(employee);
        })
        .finally(() => {
          setLoadingEmployee(false);
        });
    } else if (employee) {
      // Para modo edit o create, usar los datos del empleado pasado como prop
      loadEmployeeData(employee);
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
  }, [employee, isOpen, openedFromEPP, mode]);

  if (!isOpen) return null;

  // 🔹 Funciones helper para extraer datos de forma consistente
  // Priorizan objetos sobre arrays cuando los arrays están vacíos
  
  const getMedicalStudies = (emp) => {
    if (!emp) return { lastExam: '', nextExam: '', status: 'Pendiente', documents: [] };
    if (emp.medicalStudies && typeof emp.medicalStudies === 'object' && !Array.isArray(emp.medicalStudies)) {
      return emp.medicalStudies;
    }
    if (Array.isArray(emp.examenesMedicos) && emp.examenesMedicos.length > 0) {
      return emp.examenesMedicos[0];
    }
    return { lastExam: '', nextExam: '', status: 'Pendiente', documents: [] };
  };

  const getPPE = (emp) => {
    if (!emp) return { helmet: false, vest: false, boots: false, gloves: false, glasses: false, mask: false };
    if (emp.ppe && typeof emp.ppe === 'object' && !Array.isArray(emp.ppe)) {
      return emp.ppe;
    }
    if (Array.isArray(emp.equipos) && emp.equipos.length > 0) {
      return emp.equipos[0];
    }
    return { helmet: false, vest: false, boots: false, gloves: false, glasses: false, mask: false };
  };

  const getEmergencyContact = (emp) => {
    if (!emp) return { name: '', phone: '', relationship: '' };
    if (emp.emergencyContact && typeof emp.emergencyContact === 'object' && !Array.isArray(emp.emergencyContact)) {
      return emp.emergencyContact;
    }
    if (Array.isArray(emp.contactoEmergencia) && emp.contactoEmergencia.length > 0) {
      return emp.contactoEmergencia[0];
    }
    return { name: '', phone: '', relationship: '' };
  };

  // En modo view, usar formData (cargado con datos completos del backend)
  // En modo edit/create, siempre usar formData
  const displayedMedicalStudies = formData.medicalStudies || getMedicalStudies(fullEmployeeData || employee);
  const displayedPPE = formData.ppe || getPPE(fullEmployeeData || employee);
  const displayedEmergencyContact = formData.emergencyContact || getEmergencyContact(fullEmployeeData || employee);
  
  // Para mostrar en modo view, usar fullEmployeeData si está disponible, sino employee
  const displayedEmployee = mode === 'view' ? (fullEmployeeData || employee) : employee;

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
    // Limpiar error de validación cuando el usuario modifica el campo
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

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

  // 🔹 Validar campos requeridos
  const validateRequiredFields = () => {
    const errors = {};
    const requiredFields = {
      name: 'Nombre Completo',
      employeeId: 'ID de Empleado',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      hireDate: 'Fecha de Ingreso'
    };

    // Validar cada campo requerido
    Object.keys(requiredFields).forEach(field => {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = `${requiredFields[field]} es requerido`;
      }
    });

    // Validar formato de email solo si el campo tiene valor
    if (formData.email && formData.email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'El correo electrónico no tiene un formato válido';
      }
    }

    // Validar teléfono (debe tener 10 dígitos) solo si el campo tiene valor
    if (formData.phone && formData.phone.trim() !== '') {
      if (formData.phone.length !== 10) {
        errors.phone = 'El teléfono debe tener exactamente 10 dígitos';
      }
    }

    setValidationErrors(errors);
    
    // Retornar los errores para usarlos inmediatamente
    if (Object.keys(errors).length > 0) {
      // Mostrar mensaje de error con los campos faltantes
      const missingFields = Object.values(errors).join(', ');
      showError(`Por favor completa los siguientes campos requeridos: ${missingFields}`);
    }
    
    return Object.keys(errors).length === 0;
  };

  // 🔹 Guardar nuevo empleado

  // (Ya está declarada al inicio, se elimina duplicado)

  const handleSave = async () => {
    setLocalError(null);
    setValidationErrors({});
    
    // Validar campos requeridos antes de guardar
    if (!validateRequiredFields()) {
      return;
    }

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
      
      // Extraer mensaje de error
      let errorMessage = 'Error al guardar el empleado';
      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Si es error 400 con campos faltantes, actualizar errores de validación
      if (error?.status === 400 && error?.data?.error) {
        const errorText = error.data.error;
        
        // Si el mensaje contiene "Campos requeridos faltantes", extraer los campos
        if (errorText.includes('Campos requeridos faltantes:')) {
          const fieldsText = errorText.split('Campos requeridos faltantes:')[1]?.trim() || '';
          const missingFields = fieldsText.split(',').map(f => f.trim());
          
          // Mapear nombres de campos del servidor a nombres de campos del formulario
          const fieldMapping = {
            'nombreCompleto': 'name',
            'empleadoId': 'employeeId',
            'email': 'email',
            'telefono': 'phone',
            'fechaIngreso': 'hireDate'
          };
          
          const fieldLabels = {
            'nombreCompleto': 'Nombre Completo',
            'empleadoId': 'ID de Empleado',
            'email': 'Correo Electrónico',
            'telefono': 'Teléfono',
            'fechaIngreso': 'Fecha de Ingreso'
          };
          
          // Crear objeto de errores de validación
          const serverErrors = {};
          missingFields.forEach(field => {
            const formField = fieldMapping[field];
            if (formField) {
              serverErrors[formField] = `${fieldLabels[field]} es requerido`;
            }
          });
          
          setValidationErrors(serverErrors);
        }
      }
      
      // Mostrar notificación de error (se limpia automáticamente después de 7 segundos)
      showError(errorMessage);
      
      // Si es error 409 relacionado con correo, también guardarlo en localError para mostrar en el campo
      if (error?.status === 409 && error?.data?.error?.includes('correo')) {
        setLocalError(error);
      } else if (error?.status === 409 && error?.data?.error?.includes('teléfono')) {
        // Si es error de teléfono, también podemos limpiar el campo o mostrar mensaje
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
          {loadingEmployee && (
            <div className="flex justify-center items-center py-10">
              <Icon name="Loader2" className="animate-spin mr-2" size={18} />
              <span className="text-muted-foreground">Cargando datos del empleado...</span>
            </div>
          )}
          
          {!loadingEmployee && (
            <>
              {/* Información General */}
              {!isEPPOnly && step === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="Nombre Completo"
                        value={mode === 'view' ? (displayedEmployee?.nombreCompleto ?? '') : formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        disabled={mode === 'view'}
                      />
                      {validationErrors.name && (
                        <span className="block text-xs text-red-600 mt-1">{validationErrors.name}</span>
                      )}
                    </div>
                    <div>
                      <Input
                        label="ID de Empleado"
                        value={mode === 'view' ? (displayedEmployee?.empleadoId ?? '') : formData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        required
                        disabled={mode === 'view'}
                      />
                      {validationErrors.employeeId && (
                        <span className="block text-xs text-red-600 mt-1">{validationErrors.employeeId}</span>
                      )}
                    </div>
                    <div>
                      <Input
                        label="Correo Electrónico"
                        type="email"
                        value={mode === 'view' ? (displayedEmployee?.email ?? '') : formData.email}
                        onChange={(e) => {
                          handleInputChange('email', e.target.value);
                          // Limpiar error cuando el usuario modifica el correo
                          if (localError) setLocalError(null);
                        }}
                        required
                        disabled={mode === 'view'}
                      />
                      {validationErrors.email && (
                        <span className="block text-xs text-red-600 mt-1">{validationErrors.email}</span>
                      )}
                      {(localError?.status === 409 && localError?.data?.error?.includes('correo')) && (
                        <span className="block text-xs text-red-600 mt-1">Este correo ya está registrado</span>
                      )}
                    </div>
                    <div>
                      <Input
                        label="Teléfono"
                        type="tel"
                        value={mode === 'view' ? (displayedEmployee?.telefono ?? '') : formData.phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Solo permitir números y limitar a 10 dígitos
                          const numericValue = value.replace(/\D/g, '').slice(0, 10);
                          handleInputChange('phone', numericValue);
                          // Limpiar error cuando el usuario modifica el teléfono
                          if (localError) setLocalError(null);
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
                        description={
                          mode !== 'view' 
                            ? `${(formData.phone || '').length}/10 dígitos`
                            : undefined
                        }
                        required
                        disabled={mode === 'view'}
                      />
                      {validationErrors.phone && (
                        <span className="block text-xs text-red-600 mt-1">{validationErrors.phone}</span>
                      )}
                    </div>
                    <Select
                      label="Departamento"
                      options={departmentOptions}
                      value={mode === 'view' ? (displayedEmployee?.departamento ?? '') : formData.department}
                      onChange={(value) => handleInputChange('department', value)}
                      disabled={mode === 'view'}
                    />
                    <Select
                      label="Puesto"
                      options={positionOptions}
                      value={mode === 'view' ? (displayedEmployee?.puesto ?? '') : formData.position}
                      onChange={(value) => handleInputChange('position', value)}
                      disabled={mode === 'view'}
                    />
                    <div>
                      <Input
                        label="Fecha de Ingreso"
                        type="date"
                        value={mode === 'view' ? (displayedEmployee?.fechaIngreso ?? '') : formData.hireDate}
                        onChange={(e) => handleInputChange('hireDate', e.target.value)}
                        required
                        disabled={mode === 'view'}
                      />
                      {validationErrors.hireDate && (
                        <span className="block text-xs text-red-600 mt-1">{validationErrors.hireDate}</span>
                      )}
                    </div>
                    <Select
                      label="Estado"
                      options={statusOptions}
                      value={mode === 'view' ? (displayedEmployee?.estado ?? '') : formData.status}
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
                      value={displayedMedicalStudies?.lastExam || ''}
                      onChange={(e) => handleInputChange('medicalStudies.lastExam', e.target.value)}
                      disabled={mode === 'view'}
                    />
                    <Input
                      label="Próximo Examen Médico"
                      type="date"
                      value={displayedMedicalStudies?.nextExam || ''}
                      onChange={(e) => handleInputChange('medicalStudies.nextExam', e.target.value)}
                      disabled={mode === 'view'}
                    />
                    <Select
                      label="Estado de Estudios Médicos"
                      options={medicalStatusOptions}
                      value={displayedMedicalStudies?.status || 'Pendiente'}
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
                          checked={displayedPPE?.helmet || false}
                          onChange={(e) => handlePPEChange('helmet', e.target.checked)}
                          disabled={mode === 'view'}
                        />
                        <Checkbox
                          label="Chaleco Reflectivo"
                          checked={displayedPPE?.vest || false}
                          onChange={(e) => handlePPEChange('vest', e.target.checked)}
                          disabled={mode === 'view'}
                        />
                        <Checkbox
                          label="Botas de Seguridad"
                          checked={displayedPPE?.boots || false}
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
                          checked={displayedPPE?.gloves || false}
                          onChange={(e) => handlePPEChange('gloves', e.target.checked)}
                          disabled={mode === 'view'}
                        />
                        <Checkbox
                          label="Gafas de Seguridad"
                          checked={displayedPPE?.glasses || false}
                          onChange={(e) => handlePPEChange('glasses', e.target.checked)}
                          disabled={mode === 'view'}
                        />
                        <Checkbox
                          label="Mascarilla"
                          checked={displayedPPE?.mask || false}
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
                            checked={displayedPPE?.helmet || false}
                            onChange={(e) => handlePPEChange('helmet', e.target.checked)}
                            disabled={mode === 'view'}
                          />
                          <Checkbox
                            label="Chaleco Reflectivo"
                            checked={displayedPPE?.vest || false}
                            onChange={(e) => handlePPEChange('vest', e.target.checked)}
                            disabled={mode === 'view'}
                          />
                          <Checkbox
                            label="Botas de Seguridad"
                            checked={displayedPPE?.boots || false}
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
                            checked={displayedPPE?.gloves || false}
                            onChange={(e) => handlePPEChange('gloves', e.target.checked)}
                            disabled={mode === 'view'}
                          />
                          <Checkbox
                            label="Gafas de Seguridad"
                            checked={displayedPPE?.glasses || false}
                            onChange={(e) => handlePPEChange('glasses', e.target.checked)}
                            disabled={mode === 'view'}
                          />
                          <Checkbox
                            label="Mascarilla"
                            checked={displayedPPE?.mask || false}
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
                      value={displayedEmergencyContact?.name || ''}
                      onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                      disabled={mode === 'view'}
                    />
                    <Input
                      label="Teléfono de Contacto"
                      type="tel"
                      value={displayedEmergencyContact?.phone || ''}
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
                      value={displayedEmergencyContact?.relationship || ''}
                      onChange={(value) => handleInputChange('emergencyContact.relationship', value)}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>
              )}
            </>
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
                    
                    // Extraer mensaje de error
                    let errorMessage = 'Error al guardar el EPP';
                    if (error?.data?.error) {
                      errorMessage = error.data.error;
                    } else if (error?.data?.message) {
                      errorMessage = error.data.message;
                    } else if (error?.message) {
                      errorMessage = error.message;
                    }
                    
                    // Mostrar notificación de error (se limpia automáticamente después de 7 segundos)
                    showError(errorMessage);
                    
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
                    setValidationErrors({});
                    
                    // Validar campos requeridos antes de guardar
                    if (!validateRequiredFields()) {
                      return;
                    }

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
                      
                      // Extraer mensaje de error
                      let errorMessage = 'Error al guardar el empleado';
                      if (error?.data?.error) {
                        errorMessage = error.data.error;
                      } else if (error?.data?.message) {
                        errorMessage = error.data.message;
                      } else if (error?.message) {
                        errorMessage = error.message;
                      }
                      
                      // Si es error 400 con campos faltantes, actualizar errores de validación
                      if (error?.status === 400 && error?.data?.error) {
                        const errorText = error.data.error;
                        
                        // Si el mensaje contiene "Campos requeridos faltantes", extraer los campos
                        if (errorText.includes('Campos requeridos faltantes:')) {
                          const fieldsText = errorText.split('Campos requeridos faltantes:')[1]?.trim() || '';
                          const missingFields = fieldsText.split(',').map(f => f.trim());
                          
                          // Mapear nombres de campos del servidor a nombres de campos del formulario
                          const fieldMapping = {
                            'nombreCompleto': 'name',
                            'empleadoId': 'employeeId',
                            'email': 'email',
                            'telefono': 'phone',
                            'fechaIngreso': 'hireDate'
                          };
                          
                          const fieldLabels = {
                            'nombreCompleto': 'Nombre Completo',
                            'empleadoId': 'ID de Empleado',
                            'email': 'Correo Electrónico',
                            'telefono': 'Teléfono',
                            'fechaIngreso': 'Fecha de Ingreso'
                          };
                          
                          // Crear objeto de errores de validación
                          const serverErrors = {};
                          missingFields.forEach(field => {
                            const formField = fieldMapping[field];
                            if (formField) {
                              serverErrors[formField] = `${fieldLabels[field]} es requerido`;
                            }
                          });
                          
                          setValidationErrors(serverErrors);
                        }
                      }
                      
                      // Mostrar notificación de error (se limpia automáticamente después de 7 segundos)
                      showError(errorMessage);
                      
                      // Si es error 409 relacionado con correo, también guardarlo en localError para mostrar en el campo
                      if (error?.status === 409 && error?.data?.error?.includes('correo')) {
                        setLocalError(error);
                      } else if (error?.status === 409 && error?.data?.error?.includes('teléfono')) {
                        // Si es error de teléfono, también podemos limpiar el campo o mostrar mensaje
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