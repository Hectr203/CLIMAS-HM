import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import usePerson from '../../../hooks/usePerson';
import FilterToolbar from './FilterToolbar';

const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const { persons, loading, error, getPersons } = usePerson();

  // 🔹 Estados
  const [sortConfig, setSortConfig] = useState({ key: 'nombreCompleto', direction: 'asc' });
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

  useEffect(() => {
    getPersons();
  }, []);

  // 🔹 Manejo de cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
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

  // 🔹 Filtrar empleados según los filtros activos
  const filteredPersonnel = useMemo(() => {
    return (persons || []).filter(emp => {
      const searchTerm = filters.search.toLowerCase();

      const matchesSearch =
        !filters.search ||
        emp.nombreCompleto?.toLowerCase().includes(searchTerm) ||
        emp.empleadoId?.toLowerCase().includes(searchTerm) ||
        emp.puesto?.toLowerCase().includes(searchTerm);

      const matchesDepartment =
        !filters.department || emp.departamento === filters.department;

      const matchesStatus =
        !filters.status || emp.estado === filters.status;

      const matchesPosition =
        !filters.position || emp.puesto === filters.position;

      // 🔹 Ejemplo: si tu backend tiene datos de cumplimiento médico/EPP, cámbialos
      const matchesMedical =
        !filters.medicalCompliance ||
        (filters.medicalCompliance === 'Completo' && emp.estado === 'Activo') ||
        (filters.medicalCompliance === 'Pendiente' && emp.estado !== 'Activo');

      const matchesPPE =
        !filters.ppeCompliance ||
        (filters.ppeCompliance === 'Completo' && emp.estado === 'Activo') ||
        (filters.ppeCompliance === 'Pendiente' && emp.estado !== 'Activo');

      const matchesHireDateFrom =
        !filters.hireDateFrom || new Date(emp.fechaIngreso) >= new Date(filters.hireDateFrom);

      const matchesHireDateTo =
        !filters.hireDateTo || new Date(emp.fechaIngreso) <= new Date(filters.hireDateTo);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesPosition &&
        matchesMedical &&
        matchesPPE &&
        matchesHireDateFrom &&
        matchesHireDateTo
      );
    });
  }, [persons, filters]);

  // 🔹 Ordenar resultados filtrados
  const sortedPersonnel = useMemo(() => {
    const sorted = [...filteredPersonnel];
    if (!sortConfig.key) return sorted;
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredPersonnel, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status) => {
    const config = {
      'Activo': { bg: 'bg-success', text: 'text-success-foreground' },
      'Inactivo': { bg: 'bg-error', text: 'text-error-foreground' },
      'Suspendido': { bg: 'bg-warning', text: 'text-warning-foreground' },
    }[status] || { bg: 'bg-muted', text: 'text-muted-foreground' };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const getComplianceBadge = (status) => {
    const config = {
      'Completo': { bg: 'bg-success', text: 'text-success-foreground', icon: 'CheckCircle' },
      'Pendiente': { bg: 'bg-warning', text: 'text-warning-foreground', icon: 'Clock' },
      'Vencido': { bg: 'bg-error', text: 'text-error-foreground', icon: 'AlertCircle' },
    }[status] || { bg: 'bg-muted', text: 'text-muted-foreground', icon: 'Clock' };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon name={config.icon} size={12} />
        <span>{status}</span>
      </span>
    );
  };

  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-smooth"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <Icon
          name={
            sortConfig.key === sortKey
              ? sortConfig.direction === 'asc'
                ? 'ChevronUp'
                : 'ChevronDown'
              : 'ChevronsUpDown'
          }
          size={14}
        />
      </div>
    </th>
  );

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <Icon name="Loader2" className="animate-spin mr-2" size={18} />
        <span className="text-muted-foreground">Cargando empleados...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-error">
        <Icon name="AlertCircle" className="inline-block mr-2" size={18} />
        Error al cargar los empleados: {error.userMessage || error.message}
      </div>
    );

  // ✅ Código corregido:
return (
  <div className="space-y-6">
    {/* ✅ Eliminamos el FilterToolbar duplicado */}

    {/* 🔹 Tabla */}
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Empleado</th>
              <SortableHeader label="Departamento" sortKey="departamento" />
              <SortableHeader label="Puesto" sortKey="puesto" />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estudios Médicos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">EPP</th>
              <SortableHeader label="Última Actualización" sortKey="fechaIngreso" />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedPersonnel.map(emp => (
              <tr key={emp.id} className="hover:bg-muted/50 transition-smooth">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image src={emp.foto || '/default-avatar.png'} alt={emp.nombreCompleto} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{emp.nombreCompleto}</div>
                      <div className="text-sm text-muted-foreground">{emp.empleadoId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{emp.departamento || '-'}</td>
                <td className="px-6 py-4 text-sm">{emp.puesto || '-'}</td>
                <td className="px-6 py-4">{getStatusBadge(emp.estado)}</td>
                <td className="px-6 py-4">{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</td>
                <td className="px-6 py-4">{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{emp.fechaIngreso}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onViewProfile(emp)} iconName="Eye" iconSize={16}>Ver</Button>
                    <Button variant="ghost" size="sm" onClick={() => onEditPersonnel(emp)} iconName="Edit" iconSize={16}>Editar</Button>
                    <Button variant="ghost" size="sm" onClick={() => onAssignPPE(emp)} iconName="Shield" iconSize={16}>EPP</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

};

export default PersonnelTable;
