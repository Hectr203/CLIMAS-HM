import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import usePerson from '../../../hooks/usePerson';

const PersonnelTable = ({ filters, onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const { persons, loading, error, getPersons } = usePerson();
  const [sortConfig, setSortConfig] = useState({ key: 'nombreCompleto', direction: 'asc' });

  // 🔹 Cargar empleados
  useEffect(() => {
    getPersons();
  }, []);

  // 🔹 Aplicar filtros
  const filteredPersonnel = useMemo(() => {
    if (!persons) return [];

    return persons.filter((emp) => {
      const search = filters.search?.toLowerCase() || '';
      const matchesSearch =
        emp.nombreCompleto?.toLowerCase().includes(search) ||
        emp.empleadoId?.toLowerCase().includes(search);

      const matchesDept = filters.department ? emp.departamento === filters.department : true;
      const matchesStatus = filters.status ? emp.estado === filters.status : true;
      const matchesPosition = filters.position ? emp.puesto === filters.position : true;
      const matchesMed = filters.medicalCompliance
        ? (emp.estado === 'Activo' ? 'Completo' : 'Pendiente') === filters.medicalCompliance
        : true;
      const matchesPPE = filters.ppeCompliance
        ? (emp.estado === 'Activo' ? 'Completo' : 'Pendiente') === filters.ppeCompliance
        : true;

      // 🔹 Filtro por rango de fechas
      const from = filters.hireDateFrom ? new Date(filters.hireDateFrom) : null;
      const to = filters.hireDateTo ? new Date(filters.hireDateTo) : null;
      const empDate = emp.fechaIngreso ? new Date(emp.fechaIngreso) : null;

      const matchesDate =
        (!from || (empDate && empDate >= from)) &&
        (!to || (empDate && empDate <= to));

      return (
        matchesSearch &&
        matchesDept &&
        matchesStatus &&
        matchesPosition &&
        matchesMed &&
        matchesPPE &&
        matchesDate
      );
    });
  }, [persons, filters]);

  // 🔹 Ordenamiento
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

  // 🔹 Orden visual del header
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 🔹 Badges
  const getStatusBadge = (status) => {
    const config = {
      Activo: { bg: 'bg-green-100', text: 'text-green-700' },
      Inactivo: { bg: 'bg-red-100', text: 'text-red-700' },
      Suspendido: { bg: 'bg-orange-100', text: 'text-orange-700' },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const getComplianceBadge = (status) => {
    const config = {
      Completo: { bg: 'bg-green-100', text: 'text-green-700', icon: 'CheckCircle' },
      Pendiente: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'Clock' },
      Vencido: { bg: 'bg-red-100', text: 'text-red-700', icon: 'AlertCircle' },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'Clock' };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon name={config.icon} size={12} />
        <span>{status}</span>
      </span>
    );
  };

  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-colors"
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

  // 🔹 Estados vacíos
  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <Icon name="Loader2" className="animate-spin mr-2" size={18} />
        <span className="text-muted-foreground">Cargando empleados...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        <Icon name="AlertCircle" className="inline-block mr-2" size={18} />
        Error al cargar los empleados: {error.userMessage || error.message}
      </div>
    );

  if (!sortedPersonnel?.length)
    return (
      <div className="text-center py-10 text-muted-foreground italic">
        <Icon name="UserX" className="inline-block mr-2" size={18} />
        No se encontraron empleados con los filtros aplicados.
      </div>
    );

  // 🔹 Render principal
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* 🖥️ Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empleado</th>
              <SortableHeader label="Departamento" sortKey="departamento" />
              <SortableHeader label="Puesto" sortKey="puesto" />
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Est. Médicos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">EPP</th>
              <SortableHeader label="Fecha Ingreso" sortKey="fechaIngreso" />
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedPersonnel.map((emp) => (
              <tr key={emp.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <Image src={emp.foto || '/default-avatar.png'} alt={emp.nombreCompleto} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{emp.nombreCompleto}</div>
                    <div className="text-xs text-muted-foreground">{emp.empleadoId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{emp.departamento || '-'}</td>
                <td className="px-6 py-4 text-sm">{emp.puesto || '-'}</td>
                <td className="px-6 py-4">{getStatusBadge(emp.estado)}</td>
                <td className="px-6 py-4">{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</td>
                <td className="px-6 py-4">{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{emp.fechaIngreso || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onViewProfile(emp)} iconName="Eye" iconSize={16}>Ver</Button>
                    <Button variant="ghost" size="sm" onClick={() => onEditPersonnel(emp)} iconName="Edit3" iconSize={16}>Editar</Button>
                    <Button variant="ghost" size="sm" onClick={() => onAssignPPE(emp)} iconName="Shield" iconSize={16}>EPP</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Móvil */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedPersonnel.map((emp) => (
          <div key={emp.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image src={emp.foto || '/default-avatar.png'} alt={emp.nombreCompleto} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{emp.nombreCompleto}</h3>
                  <p className="text-xs text-muted-foreground">{emp.empleadoId}</p>
                </div>
              </div>
              {getStatusBadge(emp.estado)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Depto:</span><span>{emp.departamento || '-'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Puesto:</span><span>{emp.puesto || '-'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Médicos:</span>{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">EPP:</span>{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onViewProfile(emp)} iconName="Eye" iconSize={16} className="flex-1">Perfil</Button>
              <Button variant="ghost" size="sm" onClick={() => onEditPersonnel(emp)} iconName="Edit3" iconSize={16}>Editar</Button>
              <Button variant="ghost" size="sm" onClick={() => onAssignPPE(emp)} iconName="Shield" iconSize={16}>EPP</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonnelTable;
