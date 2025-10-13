import React, { useEffect, useState, useMemo } from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import usePerson from '../../../hooks/usePerson';

/**
 * Componente principal que integra filtros y tabla de personal.
 */
const FilterToolbar = () => {
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

  useEffect(() => {
    getPersons();
  }, []);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
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
    console.log('Exportando empleados filtrados...');
  };

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

  const departmentOptions = [
    { value: '', label: 'Todos los Departamentos' },
    { value: 'Administración', label: 'Administración' },
    { value: 'Proyectos', label: 'Proyectos' },
    { value: 'Taller', label: 'Taller' },
    { value: 'Ventas', label: 'Ventas' },
    { value: 'Mantenimiento', label: 'Mantenimiento' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'Suspendido', label: 'Suspendido' }
  ];

  const complianceOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'Completo', label: 'Completo' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Vencido', label: 'Vencido' }
  ];

  const positionOptions = [
    { value: '', label: 'Todos los Puestos' },
    { value: 'Técnico HVAC', label: 'Técnico HVAC' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Ingeniero', label: 'Ingeniero' },
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Vendedor', label: 'Vendedor' },
    { value: 'Operario', label: 'Operario' }
  ];

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      {/* 🧭 Barra de búsqueda y acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Buscar por nombre, ID o puesto..."
            value={filters.search}
            onChange={(e) =>
              handleFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExportData}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
          >
            Exportar
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={16}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* 🎛️ Controles de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select
          label="Departamento"
          options={departmentOptions}
          value={filters.department}
          onChange={(value) =>
            handleFilterChange({ ...filters, department: value })
          }
        />

        <Select
          label="Estado"
          options={statusOptions}
          value={filters.status}
          onChange={(value) => handleFilterChange({ ...filters, status: value })}
        />

        <Select
          label="Puesto"
          options={positionOptions}
          value={filters.position}
          onChange={(value) =>
            handleFilterChange({ ...filters, position: value })
          }
        />

        <Select
          label="Estudios Médicos"
          options={complianceOptions}
          value={filters.medicalCompliance}
          onChange={(value) =>
            handleFilterChange({ ...filters, medicalCompliance: value })
          }
        />
      </div>

      {/* 📆 Filtros adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Select
          label="EPP"
          options={complianceOptions}
          value={filters.ppeCompliance}
          onChange={(value) =>
            handleFilterChange({ ...filters, ppeCompliance: value })
          }
        />

        <Input
          type="date"
          label="Fecha de Ingreso Desde"
          value={filters.hireDateFrom}
          onChange={(e) =>
            handleFilterChange({ ...filters, hireDateFrom: e.target.value })
          }
        />

        <Input
          type="date"
          label="Fecha de Ingreso Hasta"
          value={filters.hireDateTo}
          onChange={(e) =>
            handleFilterChange({ ...filters, hireDateTo: e.target.value })
          }
        />
      </div>

      {/* 📊 Resumen de resultados */}
      <div className="flex items-center justify-between pt-4 border-t border-border mb-6">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredPersons.length} de {persons.length} empleados
          </span>
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={16} />
              <span>Filtros activos</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-muted-foreground">Completo</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-muted-foreground">Pendiente</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <span className="text-muted-foreground">Vencido</span>
          </div>
        </div>
      </div>

      {/* 🧍 Tabla de resultados */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-muted-foreground">Cargando empleados...</p>
        ) : filteredPersons.length > 0 ? (
          <table className="w-full text-sm border-t border-border">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 px-3">Nombre</th>
                <th className="py-2 px-3">Puesto</th>
                <th className="py-2 px-3">Departamento</th>
                <th className="py-2 px-3">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersons.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                  <td className="py-2 px-3">{p.nombreCompleto}</td>
                  <td className="py-2 px-3">{p.puesto}</td>
                  <td className="py-2 px-3">{p.departamento}</td>
                  <td className="py-2 px-3">{p.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-muted-foreground py-6">
            No hay empleados disponibles.
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterToolbar;
