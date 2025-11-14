import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import PersonnelTable from './components/PersonnelTable';
import FilterToolbar from './components/FilterToolbar';
import ComplianceDashboard from './components/ComplianceDashboard';
import AddEmployeeModal from './components/AddEmployeeModal';
import EditEmployeeModal from './components/EditEmployeeModal';
import EditEPPModal from './components/EditEPPModal';
import ViewEmployeeModal from './components/ViewEmployeeModal';
import usePerson from '../../hooks/usePerson'; 

const PersonnelManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('personnel');
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    position: '',
    medicalCompliance: '',
    ppeCompliance: '',
    hireDateFrom: '',
    hireDateTo: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialStep, setInitialStep] = useState(0); // 0: general, 1: medical, 2: ppe, 3: emergency
  const [openedFromEPP, setOpenedFromEPP] = useState(false);

  // ✅ Hook original
  const { persons, loading, error, getPersons } = usePerson();

  useEffect(() => {
    getPersons(); // cargar empleados
  }, []);

  // ✅ Lógica de filtrado robusta
  const filteredPersonnel = useMemo(() => {
  if (!persons) return [];

  return persons.filter((employee) => {
    const searchTerm = filters.search?.toLowerCase().trim() || '';

    const matchSearch =
      !searchTerm ||
      employee?.nombreCompleto?.toLowerCase()?.includes(searchTerm) ||
      employee?.empleadoId?.toLowerCase()?.includes(searchTerm) ||
      employee?.puesto?.toLowerCase()?.includes(searchTerm);

    const matchDept =
      !filters.department ||
      employee?.departamento?.toLowerCase() === filters.department.toLowerCase();

    const matchStatus =
      !filters.status ||
      employee?.estado?.toLowerCase() === filters.status.toLowerCase();

    const matchPosition =
      !filters.position ||
      employee?.puesto?.toLowerCase() === filters.position.toLowerCase();

    // ❌ Eliminamos o comentamos estos porque NO existen en tu base
    // const matchMedical =
    //   !filters.medicalCompliance ||
    //   employee?.cumplimientoMedico?.toLowerCase() ===
    //     filters.medicalCompliance.toLowerCase();

    // const matchPPE =
    //   !filters.ppeCompliance ||
    //   employee?.cumplimientoEPP?.toLowerCase() ===
    //     filters.ppeCompliance.toLowerCase();

    const matchHireDateFrom =
      !filters.hireDateFrom ||
      new Date(employee?.fechaIngreso) >= new Date(filters.hireDateFrom);

    const matchHireDateTo =
      !filters.hireDateTo ||
      new Date(employee?.fechaIngreso) <= new Date(filters.hireDateTo);

    return (
      matchSearch &&
      matchDept &&
      matchStatus &&
      matchPosition &&
      matchHireDateFrom &&
      matchHireDateTo
    );
  });
}, [persons, filters]);

  // ✅ Acciones UI
  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('view');
    setInitialStep(0);
    setOpenedFromEPP(false);
    setIsModalOpen(true);
  };

  const handleEditPersonnel = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setInitialStep(0);
    setOpenedFromEPP(false);
    setIsModalOpen(true);
  };

  const handleCreatePersonnel = () => {
    setSelectedEmployee(null);
    setModalMode('create');
    setInitialStep(0);
    setOpenedFromEPP(false);
    setIsModalOpen(true);
  };

  const handleAssignPPE = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setInitialStep(2); // Abrir directamente en el paso de EPP
    setOpenedFromEPP(true);
    setIsModalOpen(true);
  };

  // Eliminar duplicados: las funciones ya están arriba con initialStep

  const handleSavePersonnel = async (personnelData) => {
  try {
    // Si tienes create/update dentro del hook usePerson, puedes llamarlos así:
    // await savePerson(personnelData);  // Ejemplo: si existe esa función

    // 👇 Pero para asegurar que la tabla se actualiza:
    await getPersons(); // 🔄 Refresca la lista actualizada desde el backend

    setIsModalOpen(false); // Cierra el modal
    setSelectedEmployee(null);
    setModalMode(null);

  } catch (err) {
    console.error("Error al guardar el empleado:", err);
  }
};


  const handleClearFilters = () => {
    setFilters({
      search: '',
      department: '',
      status: '',
      position: '',
      medicalCompliance: '',
      ppeCompliance: '',
      hireDateFrom: '',
      hireDateTo: ''
    });
  };

  const handleExportData = () => {
    if (!filteredPersonnel || filteredPersonnel.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar los datos para exportar con TODOS los campos disponibles
    const dataToExport = filteredPersonnel.map(emp => {
      // Extraer datos de objetos anidados
      const medicalStudies = Array.isArray(emp.examenesMedicos) && emp.examenesMedicos[0] 
        ? emp.examenesMedicos[0] 
        : emp.medicalStudies || {};
      
      const ppe = Array.isArray(emp.equipos) && emp.equipos[0]
        ? emp.equipos[0]
        : emp.ppe || {};
      
      const emergencyContact = Array.isArray(emp.contactoEmergencia) && emp.contactoEmergencia[0]
        ? emp.contactoEmergencia[0]
        : emp.emergencyContact || {};

      return {
        'Nombre Completo': emp.nombreCompleto || '',
        'ID Empleado': emp.empleadoId || '',
        'Departamento': emp.departamento || '',
        'Puesto': emp.puesto || '',
        'Estado': emp.estado || '',
        'Estudios Médicos': medicalStudies.status || (emp.estado === 'Activo' ? 'Completo' : 'Pendiente'),
        'EPP': emp.estado === 'Activo' ? 'Completo' : 'Pendiente',
        'Fecha de Ingreso': emp.fechaIngreso || '',
        'Email': emp.email || '',
        'Teléfono': emp.telefono || '',
        'Dirección': emp.direccion || '',
        'Fecha de Nacimiento': emp.fechaNacimiento || '',
        'NSS': emp.nss || '',
        'CURP': emp.curp || '',
        'RFC': emp.rfc || '',
        'Último Examen Médico': medicalStudies.lastExam || '',
        'Próximo Examen Médico': medicalStudies.nextExam || '',
        'Casco': ppe.helmet ? 'Sí' : 'No',
        'Chaleco': ppe.vest ? 'Sí' : 'No',
        'Botas': ppe.boots ? 'Sí' : 'No',
        'Guantes': ppe.gloves ? 'Sí' : 'No',
        'Lentes': ppe.glasses ? 'Sí' : 'No',
        'Mascarilla': ppe.mask ? 'Sí' : 'No',
        'Contacto de Emergencia': emergencyContact.name || '',
        'Teléfono de Emergencia': emergencyContact.phone || '',
        'Relación con Contacto': emergencyContact.relationship || ''
      };
    });

    // Convertir a CSV
    const headers = Object.keys(dataToExport[0]);
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar comillas y envolver en comillas si contiene comas
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ].join('\n');

    // Crear el archivo y descargarlo
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `personal_${fecha}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewComplianceDetails = (type) => {
  // console.log eliminado
  };

  const handleScheduleTraining = () => {
  // console.log eliminado
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // ✅ Mock dashboard data
  const mockComplianceData = {
    totalEmployees: persons?.length || 0,
    overallCompliance: 78,
    upcomingExpirations: 8,
    medicalStudies: {
      total: persons?.length || 0,
      expired: 3,
      pending: 7,
      complete: 35
    },
    ppe: {
      total: persons?.length || 0,
      assigned: 42,
      pending: 3
    },
    training: {
      pending: 12,
      scheduled: 8,
      completed: 25
    },
    documents: {
      missing: 5,
      pending: 8,
      complete: 32
    },
    alerts: [
      {
        id: 1,
        title: 'Estudios médicos vencidos',
        description:
          '3 empleados tienen estudios médicos vencidos que requieren atención inmediata',
        date: '30/09/2024',
        priority: 'critical',
        type: 'medical'
      },
      {
        id: 2,
        title: 'EPP pendiente de asignación',
        description:
          '3 empleados necesitan asignación de equipo de protección personal',
        date: '29/09/2024',
        priority: 'warning',
        type: 'ppe'
      },
      {
        id: 3,
        title: 'Capacitaciones programadas',
        description:
          '8 empleados tienen capacitaciones programadas para la próxima semana',
        date: '28/09/2024',
        priority: 'good',
        type: 'training'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      </div>

      {/* Header móvil */}
      <div className="lg:hidden">
        <Header onMenuToggle={handleMobileMenuToggle} isMenuOpen={mobileMenuOpen} />
      </div>

      {/* Contenido principal */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        } lg:pt-0`}
      >
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* Encabezado */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Personal</h1>
              <p className="text-muted-foreground mt-2">
                Administración integral de recursos humanos, estudios médicos y EPP
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-card border border-border rounded-lg p-1">
                <Button
                  variant={activeView === 'personnel' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('personnel')}
                  iconName="Users"
                  iconPosition="left"
                  iconSize={16}
                >
                  Personal
                </Button>
                {/* TODO: Habilitar cuando se implemente cumplimiento */}
                {/* <Button
                  variant={activeView === 'compliance' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('compliance')}
                  iconName="Shield"
                  iconPosition="left"
                  iconSize={16}
                >
                  Cumplimiento
                </Button> */}
              </div>

              <Button
                onClick={handleCreatePersonnel}
                iconName="UserPlus"
                iconPosition="left"
                iconSize={16}
              >
                Nuevo Empleado
              </Button>
            </div>
          </div>

          {/* Vista principal */}
          {activeView === 'personnel' ? (
            <div className="space-y-6">
              <FilterToolbar
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearFilters}
                onExportData={handleExportData}
                totalCount={persons?.length || 0}
                filteredCount={filteredPersonnel?.length || 0}
              />

              <PersonnelTable
  personnel={filteredPersonnel}
  onViewProfile={handleViewProfile}
  onEditPersonnel={handleEditPersonnel}
  onAssignPPE={handleAssignPPE}
/>

            </div>
          ) : (
            <ComplianceDashboard
              complianceData={mockComplianceData}
              onViewDetails={handleViewComplianceDetails}
              onScheduleTraining={handleScheduleTraining}
            />
          )}

          {/* Modales */}
          <AddEmployeeModal
            isOpen={isModalOpen && modalMode === 'create'}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEmployee(null);
              setModalMode(null);
              setInitialStep(0);
              setOpenedFromEPP(false);
            }}
            onSave={handleSavePersonnel}
          />
          
          <EditEmployeeModal
            isOpen={isModalOpen && modalMode === 'edit' && !openedFromEPP}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEmployee(null);
              setModalMode(null);
              setInitialStep(0);
              setOpenedFromEPP(false);
            }}
            employee={selectedEmployee}
            onSave={handleSavePersonnel}
          />
          
          <EditEPPModal
            isOpen={isModalOpen && modalMode === 'edit' && openedFromEPP}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEmployee(null);
              setModalMode(null);
              setInitialStep(0);
              setOpenedFromEPP(false);
            }}
            employee={selectedEmployee}
            onSave={handleSavePersonnel}
          />
          
          <ViewEmployeeModal
            isOpen={isModalOpen && modalMode === 'view'}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEmployee(null);
              setModalMode(null);
              setInitialStep(0);
              setOpenedFromEPP(false);
            }}
            employee={selectedEmployee}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonnelManagement;
