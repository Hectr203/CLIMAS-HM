import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import PersonnelTable from './components/PersonnelTable';
import FilterToolbar from './components/FilterToolbar';
import ComplianceDashboard from './components/ComplianceDashboard';
import PersonnelModal from './components/PersonnelModal';
import usePerson from '../../hooks/usePerson'; // 🔹 se mantiene tu hook real

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

  // ✅ Usamos tu hook real
  const { persons, loading, error, getPersons } = usePerson();

  useEffect(() => {
    getPersons(); // 🔹 carga los empleados al montar
  }, []);

  // ✅ Filtrar empleados obtenidos del hook
  const filteredPersonnel = useMemo(() => {
    if (!persons) return [];

    return persons.filter((employee) => {
      const matchSearch =
        !filters.search ||
        employee?.nombreCompleto?.toLowerCase()?.includes(filters.search.toLowerCase()) ||
        employee?.empleadoId?.toLowerCase()?.includes(filters.search.toLowerCase()) ||
        employee?.puesto?.toLowerCase()?.includes(filters.search.toLowerCase());

      const matchDept =
        !filters.department || employee?.departamento === filters.department;

      const matchStatus =
        !filters.status || (employee?.activo ? 'Activo' : 'Inactivo') === filters.status;

      const matchPosition =
        !filters.position || employee?.puesto === filters.position;

      const matchMedical =
        !filters.medicalCompliance || employee?.cumplimientoMedico === filters.medicalCompliance;

      const matchPPE =
        !filters.ppeCompliance || employee?.cumplimientoEPP === filters.ppeCompliance;

      return matchSearch && matchDept && matchStatus && matchPosition && matchMedical && matchPPE;
    });
  }, [persons, filters]);

  // 🔹 Acciones de UI (no cambian)
  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditPersonnel = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreatePersonnel = () => {
    setSelectedEmployee(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleAssignPPE = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSavePersonnel = (personnelData) => {
    console.log('Saving personnel:', personnelData);
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
    console.log('Exporting personnel data...');
  };

  const handleViewComplianceDetails = (type) => {
    console.log('Viewing compliance details for:', type);
  };

  const handleScheduleTraining = () => {
    console.log('Scheduling training...');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // ✅ Datos de cumplimiento (mock, solo para dashboard)
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
        description: '3 empleados tienen estudios médicos vencidos que requieren atención inmediata',
        date: '30/09/2024',
        priority: 'critical',
        type: 'medical'
      },
      {
        id: 2,
        title: 'EPP pendiente de asignación',
        description: '3 empleados necesitan asignación de equipo de protección personal',
        date: '29/09/2024',
        priority: 'warning',
        type: 'ppe'
      },
      {
        id: 3,
        title: 'Capacitaciones programadas',
        description: '8 empleados tienen capacitaciones programadas para la próxima semana',
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
        } lg:pt-0 pt-16`}
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
                <Button
                  variant={activeView === 'compliance' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('compliance')}
                  iconName="Shield"
                  iconPosition="left"
                  iconSize={16}
                >
                  Cumplimiento
                </Button>
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

          {/* Contenido principal */}
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
                personnel={filteredPersonnel} // 🔹 filtrados ya desde aquí
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

          {/* Modal de personal */}
          <PersonnelModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            employee={selectedEmployee}
            mode={modalMode}
            onSave={handleSavePersonnel}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonnelManagement;
