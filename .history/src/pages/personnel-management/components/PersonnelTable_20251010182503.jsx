import React, { useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import usePerson from '../../../hooks/usePerson';

const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const { persons, getPersons, loading, error } = usePerson();

  useEffect(() => {
    console.log("📡 Cargando empleados desde usePerson...");
    getPersons();
  }, []);

  // 🔹 Mapeo de datos a formato visual
  const personnel = useMemo(() => {
    return persons.map((emp) => ({
      id: emp.id,
      name: emp.nombreCompleto,
      employeeId: emp.empleadoId,
      department: emp.departamento,
      position: emp.puesto,
      status: emp.estado,
      email: emp.email,
      phone: emp.telefono,
      avatar: emp.avatar || '/default-avatar.png',
      lastUpdate: emp.updatedAt
        ? new Date(emp.updatedAt).toLocaleDateString()
        : '—',
      medicalCompliance:
        emp.estado === 'Activo' ? 'Completo' : 'Pendiente',
      ppeCompliance:
        emp.estado === 'Activo' ? 'Completo' : 'Pendiente',
    }));
  }, [persons]);

  // 🔹 Ordenamiento
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const sortedPersonnel = useMemo(() => {
    if (!sortConfig.key) return personnel;
    return [...personnel].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [personnel, sortConfig]);

  // 🔹 UI Helpers
  const getStatusBadge = (status) => {
    const map = {
      Activo: 'bg-success text-success-foreground',
      Inactivo: 'bg-error text-error-foreground',
      Suspendido: 'bg-warning text-warning-foreground',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          map[status] || map['Activo']
        }`}
      >
        {status}
      </span>
    );
  };

  const getComplianceBadge = (value) => {
    const map = {
      Completo: {
        bg: 'bg-success text-success-foreground',
        icon: 'CheckCircle',
      },
      Pendiente: {
        bg: 'bg-warning text-warning-foreground',
        icon: 'Clock',
      },
      Vencido: {
        bg: 'bg-error text-error-foreground',
        icon: 'AlertCircle',
      },
    };
    const cfg = map[value] || map['Pendiente'];
    return (
      <span
        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${cfg.bg}`}
      >
        <Icon name={cfg.icon} size={12} />
        <span>{value}</span>
      </span>
    );
  };

  // 🔹 UI principal
  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <Icon name="Loader2" className="animate-spin mr-2" size={18} />
        <span className="text-muted-foreground">
          Cargando empleados...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-error">
        <Icon name="AlertCircle" className="inline-block mr-2" size={18} />
        Error al cargar empleados
      </div>
    );

  if (!sortedPersonnel.length)
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Icon name="UserX" className="inline-block mr-2" size={18} />
        No hay empleados registrados.
      </div>
    );

  // 🔹 Renderizado completo
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Empleado
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase"
                onClick={() => handleSort('department')}
              >
                Departamento
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase"
                onClick={() => handleSort('position')}
              >
                Puesto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Estudios Médicos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                EPP
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase"
                onClick={() => handleSort('lastUpdate')}
              >
                Última Actualización
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedPersonnel.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-muted/50 transition-smooth"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {employee.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {employee.employeeId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{employee.department}</td>
                <td className="px-6 py-4 text-sm">{employee.position}</td>
                <td className="px-6 py-4">{getStatusBadge(employee.status)}</td>
                <td className="px-6 py-4">
                  {getComplianceBadge(employee.medicalCompliance)}
                </td>
                <td className="px-6 py-4">
                  {getComplianceBadge(employee.ppeCompliance)}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {employee.lastUpdate}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile(employee)}
                      iconName="Eye"
                      iconSize={16}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPersonnel(employee)}
                      iconName="Edit"
                      iconSize={16}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAssignPPE(employee)}
                      iconName="Shield"
                      iconSize={16}
                    >
                      EPP
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonnelTable;
