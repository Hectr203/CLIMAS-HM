import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import PersonnelTable from './components/PersonnelTable';
import ComplianceDashboard from './components/ComplianceDashboard';
import PersonnelModal from './components/PersonnelModal';

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

  // Mock data (sin cambios)
  const mockPersonnel = [/* ...tu lista de empleados... */];
  const mockComplianceData = { /* ...tu data de cumplimiento... */ };

  // Filtrado
  const filteredPersonnel = mockPersonnel?.filter(employee => {
    return (
      (!filters?.search ||
        employee?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        employee?.employeeId?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        employee?.position?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      ) &&
      (!filters?.department || employee?.department === filters?.department) &&
      (!filters?.status || employee?.status === filters?.status) &&
      (!filters?.position || employee?.position === filters?.position) &&
      (!filters?.medicalCompliance || employee?.medicalCompliance === filters?.medicalCompliance) &&
      (!filters?.ppeCompliance || employee?.ppeCompliance === filters?.ppeCompliance)
    );
  });

  // Handlers
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

          {/* Contenido dinámico */}
          {activeView === 'personnel' ? (
            <PersonnelTable
              personnel={filteredPersonnel}
              filters={filters}
              onFilterChange={setFilters}
              onViewProfile={handleViewProfile}
              onEditPersonnel={handleEditPersonnel}
              onAssignPPE={handleAssignPPE}
            />
          ) : (
            <ComplianceDashboard
              complianceData={mockComplianceData}
              onViewDetails={(type) => console.log('Detalles:', type)}
              onScheduleTraining={() => console.log('Programar capacitación')}
            />
          )}

          {/* Modal de empleado */}
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
