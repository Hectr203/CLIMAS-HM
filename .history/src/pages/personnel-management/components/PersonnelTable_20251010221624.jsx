import React, { useState, useMemo } from 'react';
import FilterToolbar from './components/FilterToolbar';
import PersonnelTable from './components/PersonnelTable';
import usePerson from '../../hooks/usePerson'; // Ajusta la ruta según tu estructura

const PersonnelView = () => {
  const { persons, loading, error, getPersons } = usePerson();

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

  // 🔍 Aplicar filtros
  const filteredPersonnel = useMemo(() => {
    if (!persons) return [];

    return persons.filter((emp) => {
      // 🔸 Normalizar strings
      const search = filters.search.toLowerCase();
      const name = emp.nombreCompleto?.toLowerCase() || '';
      const id = emp.empleadoId?.toLowerCase() || '';
      const position = emp.puesto?.toLowerCase() || '';

      // 🔎 Búsqueda general
      const matchesSearch =
        !filters.search ||
        name.includes(search) ||
        id.includes(search) ||
        position.includes(search);

      // 📂 Filtros exactos
      const matchesDepartment = !filters.department || emp.departamento === filters.department;
      const matchesStatus = !filters.status || emp.estado === filters.status;
      const matchesPosition = !filters.position || emp.puesto === filters.position;

      // 🩺 Simulamos cumplimiento (dependerá de tu lógica real)
      const matchesMedical =
        !filters.medicalCompliance ||
        (filters.medicalCompliance === 'Completo' && emp.estado === 'Activo') ||
        (filters.medicalCompliance === 'Pendiente' && emp.estado !== 'Activo');

      const matchesPPE =
        !filters.ppeCompliance ||
        (filters.ppeCompliance === 'Completo' && emp.estado === 'Activo') ||
        (filters.ppeCompliance === 'Pendiente' && emp.estado !== 'Activo');

      // 📅 Fechas de ingreso
      const hireDate = emp.fechaIngreso ? new Date(emp.fechaIngreso) : null;
      const from = filters.hireDateFrom ? new Date(filters.hireDateFrom) : null;
      const to = filters.hireDateTo ? new Date(filters.hireDateTo) : null;

      const matchesFrom = !from || (hireDate && hireDate >= from);
      const matchesTo = !to || (hireDate && hireDate <= to);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesPosition &&
        matchesMedical &&
        matchesPPE &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [persons, filters]);

  // 🧹 Limpiar filtros
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

  // 📤 Exportar datos
  const handleExportData = () => {
    console.log('Exportando empleados filtrados:', filteredPersonnel);
    // Aquí podrías crear un archivo CSV o Excel si quieres
  };

  return (
    <div className="p-6 space-y-6">
      {/* Barra de filtros */}
      <FilterToolbar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        onExportData={handleExportData}
        totalCount={persons?.length || 0}
        filteredCount={filteredPersonnel?.length || 0}
      />

      {/* Tabla de empleados */}
      <PersonnelTable
        onViewProfile={(emp) => console.log('Ver perfil:', emp)}
        onEditPersonnel={(emp) => console.log('Editar empleado:', emp)}
        onAssignPPE={(emp) => console.log('Asignar EPP:', emp)}
        persons={filteredPersonnel} // 👈 Aquí pasamos la lista filtrada
        loading={loading}
        error={error}
        getPersons={getPersons}
      />
    </div>
  );
};

export default PersonnelView;
