import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FilterToolbar from './components/FilterToolbar';
import PersonnelTable from './components/PersonnelTable';
import ComplianceDashboard from './components/ComplianceDashboard';
import PersonnelModal from './components/PersonnelModal';
import Button from '../../components/ui/Button';

const PersonnelManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Estado de filtros (controlado aquí)
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

  // 🔹 Manejar cambios de filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // 🔹 Limpiar filtros
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

  const handleExportData = () => {
    console.log('Exportando datos filtrados desde PersonnelManagement...');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <Breadcrumb items={['Panel', 'Gestión de Personal']} />

          {/* 🔍 Solo una barra de filtros aquí */}
          <FilterToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onExportData={handleExportData}
          />

          {/* 📊 Tablero de cumplimiento (opcional) */}
          <ComplianceDashboard />

          {/* 🧾 Tabla que recibe los filtros desde arriba */}
          <PersonnelTable
            filters={filters}
            onViewProfile={(emp) => setSelectedEmployee(emp)}
            onEditPersonnel={(emp) => {
              setSelectedEmployee(emp);
              setModalOpen(true);
            }}
            onAssignPPE={(emp) => console.log('Asignar EPP a:', emp)}
          />

          {/* 🧍 Modal de empleado */}
          <PersonnelModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            employee={selectedEmployee}
            mode="edit"
            onSave={() => setModalOpen(false)}
          />
        </main>
      </div>
    </div>
  );
};

export default PersonnelManagement;
