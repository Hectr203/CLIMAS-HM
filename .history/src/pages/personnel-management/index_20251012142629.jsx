import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import FilterToolbar from './components/FilterToolbar';
import PersonnelTable from './components/PersonnelTable';
import ComplianceDashboard from './components/ComplianceDashboard';
import PersonnelModal from './components/PersonnelModal';
import usePerson from '../../../hooks/usePerson';

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
    hireDateTo: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { persons, loading, error, getPersons } = usePerson();

  useEffect(() => {
    getPersons();
  }, []);

  // 🔹 Filtrado centralizado aquí
  const filteredPersonnel = useMemo(() => {
    if (!persons) return [];
    return persons.filter((emp) => {
      const matchesSearch =
        !filters.search ||
        emp.nombreCompleto?.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.empleadoId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.puesto?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesDepartment =
        !filters.department || emp.departamento === filters.department;

      const matchesStatus = !filters.status || emp.estado === filters.status;

      const matchesPosition =
        !filters.position || emp.puesto === filters.position;

      // Simulaciones de cumplimiento
      const simulatedMedical = emp.estado === 'Activo' ? 'Completo' : 'Pendiente';
      const simulatedPPE = emp.estado === 'Activo' ? 'Completo' : 'Pendiente';

      const matchesMedical =
        !filters.medicalCompliance ||
        simulatedMedical === filters.medicalCompliance;

      const matchesPPE =
        !filters.ppeCompliance || simulatedPPE === filters.ppeCompliance;

      const matchesDateFrom =
        !filters.hireDateFrom ||
        new Date(emp.fechaIngreso) >= new Date(filters.hireDateFrom);

      const matchesDateTo =
        !filters.hireDateTo ||
        new Date(emp.fechaIngreso) <= new Date(filters.hireDateTo);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesPosition &&
        matchesMedical &&
        matchesPPE &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [persons, filters]);

  // 🔹 Handlers
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
      hireDateTo: '',
    });
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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

          {/* Contenido dinámico */}
          {activeView === 'personnel' ? (
            <div className="space-y-6">
              <FilterToolbar
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearFilters}
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
              complianceData={{}}
              onViewDetails={(type) => console.log('Detalles:', type)}
              onScheduleTraining={() => console.log('Programar capacitación')}
            />
          )}

          {/* Modal */}
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
