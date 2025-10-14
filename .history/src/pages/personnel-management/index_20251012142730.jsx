import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';

import Button from '../../components/ui/Button';
import PersonnelTable from './components/PersonnelTable';
import FilterToolbar from './components/FilterToolbar';
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

  // Mock personnel data
  const mockPersonnel = [
    {
      id: 1,
      name: "Carlos Rodríguez",
      employeeId: "EMP-001",
      email: "carlos.rodriguez@aireflowpro.com",
      phone: "+52 55 1234 5678",
      department: "Proyectos",
      position: "Técnico HVAC",
      status: "Activo",
      hireDate: "2023-01-15",
      lastUpdate: "28/09/2024",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      medicalCompliance: "Completo",
      ppeCompliance: "Completo",
      medicalStudies: {
        lastExam: "2024-03-15",
        nextExam: "2025-03-15",
        status: "Completo"
      },
      ppe: {
        helmet: true,
        vest: true,
        boots: true,
        gloves: true,
        glasses: true,
        mask: false
      },
      emergencyContact: {
        name: "María Rodríguez",
        phone: "+52 55 9876 5432",
        relationship: "Cónyuge"
      }
    },
    {
      id: 2,
      name: "Ana García",
      employeeId: "EMP-002",
      email: "ana.garcia@aireflowpro.com",
      phone: "+52 55 2345 6789",
      department: "Administración",
      position: "Administrador",
      status: "Activo",
      hireDate: "2022-08-20",
      lastUpdate: "27/09/2024",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      medicalCompliance: "Vencido",
      ppeCompliance: "Pendiente",
      medicalStudies: {
        lastExam: "2023-08-20",
        nextExam: "2024-08-20",
        status: "Vencido"
      },
      ppe: {
        helmet: false,
        vest: true,
        boots: false,
        gloves: false,
        glasses: true,
        mask: false
      },
      emergencyContact: {
        name: "Luis García",
        phone: "+52 55 8765 4321",
        relationship: "Padre/Madre"
      }
    },
    {
      id: 3,
      name: "Miguel Torres",
      employeeId: "EMP-003",
      email: "miguel.torres@aireflowpro.com",
      phone: "+52 55 3456 7890",
      department: "Taller",
      position: "Supervisor",
      status: "Activo",
      hireDate: "2021-11-10",
      lastUpdate: "29/09/2024",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      medicalCompliance: "Pendiente",
      ppeCompliance: "Completo",
      medicalStudies: {
        lastExam: "2024-01-10",
        nextExam: "2025-01-10",
        status: "Pendiente"
      },
      ppe: {
        helmet: true,
        vest: true,
        boots: true,
        gloves: true,
        glasses: true,
        mask: true
      },
      emergencyContact: {
        name: "Carmen Torres",
        phone: "+52 55 7654 3210",
        relationship: "Cónyuge"
      }
    },
    {
      id: 4,
      name: "Laura Martínez",
      employeeId: "EMP-004",
      email: "laura.martinez@aireflowpro.com",
      phone: "+52 55 4567 8901",
      department: "Ventas",
      position: "Vendedor",
      status: "Activo",
      hireDate: "2023-05-03",
      lastUpdate: "26/09/2024",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      medicalCompliance: "Completo",
      ppeCompliance: "Completo",
      medicalStudies: {
        lastExam: "2024-05-03",
        nextExam: "2025-05-03",
        status: "Completo"
      },
      ppe: {
        helmet: false,
        vest: true,
        boots: false,
        gloves: false,
        glasses: true,
        mask: false
      },
      emergencyContact: {
        name: "Pedro Martínez",
        phone: "+52 55 6543 2109",
        relationship: "Hermano/Hermana"
      }
    },
    {
      id: 5,
      name: "Roberto Sánchez",
      employeeId: "EMP-005",
      email: "roberto.sanchez@aireflowpro.com",
      phone: "+52 55 5678 9012",
      department: "Mantenimiento",
      position: "Operario",
      status: "Suspendido",
      hireDate: "2022-02-14",
      lastUpdate: "25/09/2024",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      medicalCompliance: "Vencido",
      ppeCompliance: "Vencido",
      medicalStudies: {
        lastExam: "2023-02-14",
        nextExam: "2024-02-14",
        status: "Vencido"
      },
      ppe: {
        helmet: true,
        vest: false,
        boots: true,
        gloves: false,
        glasses: false,
        mask: false
      },
      emergencyContact: {
        name: "Isabel Sánchez",
        phone: "+52 55 5432 1098",
        relationship: "Cónyuge"
      }
    },
    {
      id: 6,
      name: "Patricia López",
      employeeId: "EMP-006",
      email: "patricia.lopez@aireflowpro.com",
      phone: "+52 55 6789 0123",
      department: "Proyectos",
      position: "Ingeniero",
      status: "Activo",
      hireDate: "2021-09-07",
      lastUpdate: "30/09/2024",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      medicalCompliance: "Completo",
      ppeCompliance: "Completo",
      medicalStudies: {
        lastExam: "2024-09-07",
        nextExam: "2025-09-07",
        status: "Completo"
      },
      ppe: {
        helmet: true,
        vest: true,
        boots: true,
        gloves: true,
        glasses: true,
        mask: true
      },
      emergencyContact: {
        name: "Fernando López",
        phone: "+52 55 4321 0987",
        relationship: "Padre/Madre"
      }
    }
  ];

  // Mock compliance data
  const mockComplianceData = {
    totalEmployees: 45,
    overallCompliance: 78,
    upcomingExpirations: 8,
    medicalStudies: {
      total: 45,
      expired: 3,
      pending: 7,
      complete: 35
    },
    ppe: {
      total: 45,
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
        title: "Estudios médicos vencidos",
        description: "3 empleados tienen estudios médicos vencidos que requieren atención inmediata",
        date: "30/09/2024",
        priority: "critical",
        type: "medical"
      },
      {
        id: 2,
        title: "EPP pendiente de asignación",
        description: "3 empleados necesitan asignación de equipo de protección personal",
        date: "29/09/2024",
        priority: "warning",
        type: "ppe"
      },
      {
        id: 3,
        title: "Capacitaciones programadas",
        description: "8 empleados tienen capacitaciones programadas para la próxima semana",
        date: "28/09/2024",
        priority: "good",
        type: "training"
      }
    ]
  };

  // Filter personnel based on current filters
  // ✅ Filtro corregido
const filteredPersonnel = mockPersonnel.filter((employee) => {
  const search = filters.search?.toLowerCase() || "";

  const matchesSearch =
    employee.name.toLowerCase().includes(search) ||
    employee.employeeId.toLowerCase().includes(search) ||
    employee.position.toLowerCase().includes(search) ||
    employee.department.toLowerCase().includes(search);

  const matchesDepartment = !filters.department || employee.department === filters.department;
  const matchesStatus = !filters.status || employee.status === filters.status;
  const matchesPosition = !filters.position || employee.position === filters.position;
  const matchesMedical = !filters.medicalCompliance || employee.medicalCompliance === filters.medicalCompliance;
  const matchesPPE = !filters.ppeCompliance || employee.ppeCompliance === filters.ppeCompliance;

  // ✅ Filtro de fechas de contratación
  const fromDate = filters.hireDateFrom ? new Date(filters.hireDateFrom) : null;
  const toDate = filters.hireDateTo ? new Date(filters.hireDateTo) : null;
  const hireDate = new Date(employee.hireDate);

  const matchesHireDate =
    (!fromDate || hireDate >= fromDate) &&
    (!toDate || hireDate <= toDate);

  return (
    matchesSearch &&
    matchesDepartment &&
    matchesStatus &&
    matchesPosition &&
    matchesMedical &&
    matchesPPE &&
    matchesHireDate
  );
});


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
    // Here you would typically save to your backend
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
    // Here you would implement export functionality
  };

  const handleViewComplianceDetails = (type) => {
    console.log('Viewing compliance details for:', type);
    // Here you would navigate to detailed compliance view
  };

  const handleScheduleTraining = () => {
    console.log('Scheduling training...');
    // Here you would open training scheduling interface
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header 
          onMenuToggle={handleMobileMenuToggle}
          isMenuOpen={mobileMenuOpen}
        />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      } lg:pt-0 pt-16`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* Header */}
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

          {/* Content */}
          {activeView === 'personnel' ? (
            <div className="space-y-6">
              <FilterToolbar
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearFilters}
                onExportData={handleExportData}
                totalCount={mockPersonnel?.length}
                filteredCount={filteredPersonnel?.length}
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

          {/* Personnel Modal */}
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