import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import usePerson from '../../../hooks/usePerson';

const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const { persons, loading, error, getPersons } = usePerson();
  const [sortConfig, setSortConfig] = useState({ key: 'nombreCompleto', direction: 'asc' });

  // 🔹 Cargar empleados al montar
  useEffect(() => {
    getPersons();
  }, []);

  // 🔹 Ordenar datos
  const sortedPersonnel = useMemo(() => {
    const sorted = [...(persons || [])];
    if (!sortConfig.key) return sorted;
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [persons, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 🔹 Badges de estado
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

  if (loading) return (
    <div className="flex justify-center items-center py-10">
      <Icon name="Loader2" className="animate-spin mr-2" size={18} />
      <span className="text-muted-foreground">Cargando empleados...</span>
    </div>
  );

  if (error) return (
    <div className="text-center py-10 text-error">
      <Icon name="AlertCircle" className="inline-block mr-2" size={18} />
      Error al cargar los empleados: {error.userMessage || error.message}
    </div>
  );

  if (!sortedPersonnel?.length) return (
    <div className="text-center py-10 text-muted-foreground">
      <Icon name="UserX" className="inline-block mr-2" size={18} />
      No hay empleados registrados.
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Tabla Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Empleado</th>
              <SortableHeader label="Departamento" sortKey="departamento" />
              <SortableHeader label="Puestuees" sortKey="puesto" />
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">{emp.departamento || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{emp.puesto || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(emp.estado)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{emp.fechaIngreso}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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

      {/* Vista Móvil */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedPersonnel.map(emp => (
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
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Departamento:</span><span>{emp.departamento || '-'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Puesto:</span><span>{emp.puesto || '-'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estudios Médicos:</span>{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">EPP:</span>{getComplianceBadge(emp.estado === 'Activo' ? 'Completo' : 'Pendiente')}</div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onViewProfile(emp)} iconName="Eye" iconSize={16} className="flex-1">Ver Perfil</Button>
              <Button variant="ghost" size="sm" onClick={() => onEditPersonnel(emp)} iconName="Edit" iconSize={16}>Editar</Button>
              <Button variant="ghost" size="sm" onClick={() => onAssignPPE(emp)} iconName="Shield" iconSize={16}>EPP</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonnelTable;
