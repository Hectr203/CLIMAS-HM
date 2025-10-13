import React, { useState, useMemo } from 'react';
import FilterToolbar from './components/FilterToolbar';
import PersonnelTable from './components/PersonnelTable';
import usePerson from '../../hooks/usePerson';

const PersonnelPage = () => {
  const { persons, loading, error } = usePerson();
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

  // 📦 Aplica los filtros aquí (esto es lo único que conecta ambos)
  const filteredPersons = useMemo(() => {
    return persons.filter((person) => {
      const matchesSearch =
        person.nombreCompleto.toLowerCase().includes(filters.search.toLowerCase()) ||
        person.empleadoId.toLowerCase().includes(filters.search.toLowerCase()) ||
        person.puesto.toLowerCase().includes(filters.search.toLowerCase());

      const matchesDepartment =
        !filters.department || person.departamento === filters.department;
      const matchesStatus = !filters.status || person.estado === filters.status;
      const matchesPosition =
        !filters.position || person.puesto === filters.position;
      const matchesMedical =
        !filters.medicalCompliance || person.estudioMedico === filters.medicalCompliance;
      const matchesPPE =
        !filters.ppeCompliance || person.estadoEpp === filters.ppeCompliance;

      const matchesDate =
        (!filters.hireDateFrom ||
          new Date(person.fechaIngreso) >= new Date(filters.hireDateFrom)) &&
        (!filters.hireDateTo ||
          new Date(person.fechaIngreso) <= new Date(filters.hireDateTo));

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesPosition &&
        matchesMedical &&
        matchesPPE &&
        matchesDate
      );
    });
  }, [persons, filters]);

  return (
    <div>
      {/* 🔍 Filtros arriba */}
      <FilterToolbar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={() =>
          setFilters({
            search: '',
            department: '',
            status: '',
            position: '',
            medicalCompliance: '',
            ppeCompliance: '',
            hireDateFrom: '',
            hireDateTo: ''
          })
        }
        onExportData={() => console.log('Exportar datos')}
        totalCount={persons.length}
        filteredCount={filteredPersons.length}
      />

      {/* 👇 Tu tabla abajo, mostrando los resultados filtrados */}
      <PersonnelTable
        personnel={filteredPersons}
        loading={loading}
        onViewProfile={(person) => console.log('Ver perfil', person)}
        onEditPersonnel={(person) => console.log('Editar', person)}
        onAssignPPE={(person) => console.log('Asignar EPP', person)}
      />
    </div>
  );
};

export default PersonnelPage;
