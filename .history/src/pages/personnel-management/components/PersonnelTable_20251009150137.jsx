import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 🔹 Obtener empleados del backend
  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const response = await fetch('http://localhost:7071/api/empleados');
        if (!response.ok) {
          throw new Error('Error al obtener empleados');
        }
        const data = await response.json();
        setPersonnel(data);
      } catch (error) {
        console.error('❌ Error al cargar empleados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonnel();
  }, []);

  // 🔹 Manejo de ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 🔹 Ordenar empleados
  const sortedPersonnel = useMemo(() => {
    if (!sortConfig?.key) return personnel;

    return [...personnel].sort((a, b) => {
      const aValue = a?.[sortConfig?.key] ?? '';
      const bValue = b?.[sortConfig?.key] ?? '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [personnel, sortConfig]);

  // 🔹 Badges de estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      Activo: { bg: 'bg-success', text: 'text-success-foreground' },
      Inactivo: { bg: 'bg-error', text: 'text-error-foreground' },
      Suspendido: { bg: 'bg-warning', text: 'text-warning-foreground' },
    };
    const config = statusConfig[status] || statusConfig.Activo;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  // 🔹 Badges de cumplimiento
  const getComplianceBadge = (compliance) => {
    const complianceConfig = {
      Completo: { bg: 'bg-success', text: 'text-success-foreground', icon: 'CheckCircle' },
      Pendiente: { bg: 'bg-warning', text: 'text-warning-foreground', icon: 'Clock' },
      Vencido: { bg: 'bg-error', text: 'text-error-foreground', icon: 'AlertCircle' },
    };
    const config = complianceConfig[compliance] || complianceConfig.Pendiente;
    return (
      <span
        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
      >
        <Icon name={config.icon} size={12} />
        <span>{compliance}</span>
      </span>
    );
  };

  // 🔹 Header ordenable
  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-smooth"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <Icon
          name={
            sortConfig?.key === sortKey
              ? sortConfig?.direction === 'asc'
                ? 'ChevronUp'
                : 'ChevronDown'
              : 'ChevronsUpDown'
          }
          size={14}
        />
      </div>
    </th>
  );

  // 🔹 Loader o tabla
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-muted-foreground">
        <Icon name="Loader" className="animate-spin mr-2" size={18} />
        Cargando empleados...
      </div>
    );
  }

  // 🔹 Tabla principal
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Empleado
              </th>
              <SortableHeader label="Departamento" sortKey="department" />
              <SortableHeader label="Puesto" sortKey="position" />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estudios Médicos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                EPP
              </th>
              <SortableHeader label="Última Actualización" sortKey="lastUpdate" />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedPersonnel.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-muted-foreground">
                  No hay empleados registrados.
                </td>
              </tr>
            ) : (
              sortedPersonnel.map((employee) => (
                <tr key={employee?.id} className="hover:bg-muted/50 transition-smooth">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        <Image
                          src={employee?.avatar}
                          alt={employee?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{employee?.name}</div>
                        <div className="text-sm text-muted-foreground">{employee?.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {employee?.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {employee?.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(employee?.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getComplianceBadge(employee?.medicalCompliance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getComplianceBadge(employee?.ppeCompliance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {employee?.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedPersonnel.length === 0 ? (
          <div className="text-center text-muted-foreground">No hay empleados registrados.</div>
        ) : (
          sortedPersonnel.map((employee) => (
            <div key={employee?.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={employee?.avatar}
                      alt={employee?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{employee?.name}</h3>
                    <p className="text-xs text-muted-foreground">{employee?.employeeId}</p>
                  </div>
                </div>
                {getStatusBadge(employee?.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Departamento:</span>
                  <span className="text-foreground">{employee?.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Puesto:</span>
                  <span className="text-foreground">{employee?.position}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estudios Médicos:</span>
                  {getComplianceBadge(employee?.medicalCompliance)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">EPP:</span>
                  {getComplianceBadge(employee?.ppeCompliance)}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(employee)}
                  iconName="Eye"
                  iconSize={16}
                  className="flex-1"
                >
                  Ver Perfil
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PersonnelTable;
