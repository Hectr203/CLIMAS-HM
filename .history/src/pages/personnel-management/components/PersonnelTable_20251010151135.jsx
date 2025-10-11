import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import personService from '../../../services/personService';

/**
 * Tabla de Personal (Empleados)
 * Carga empleados desde el backend y permite ver, editar o asignar EPP.
 */
const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const [personnel, setPersonnel] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** 🔹 Cargar datos desde /empleados */
  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📡 Solicitando empleados desde /empleados...');
        const result = await personService.getPersons();

        console.log('📥 Respuesta backend:', result);

        // Estructura esperada: { success: true, data: [...] }
        const dataArray = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        const mapped = dataArray.map((emp) => ({
          id: emp.id || emp._id,
          name: emp.nombreCompleto || `${emp.nombre || ''} ${emp.apellido || ''}`.trim(),
          employeeId: emp.empleadoId || emp.claveEmpleado || '—',
          department: emp.departamento || 'Sin asignar',
          position: emp.puesto || 'Sin asignar',
          status: emp.estado || 'Activo',
          email: emp.email || '—',
          phone: emp.telefono || '—',
          avatar: emp.avatar || '/default-avatar.png',
          lastUpdate: emp.updatedAt
            ? new Date(emp.updatedAt).toLocaleDateString()
            : '—',
          medicalCompliance:
            emp.estado === 'Activo' ? 'Completo' : 'Pendiente',
          ppeCompliance:
            emp.estado === 'Activo' ? 'Completo' : 'Pendiente',
        }));

        setPersonnel(mapped);
      } catch (err) {
        console.error('❌ Error al cargar empleados:', err);
        setError(err.userMessage || err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonnel();
  }, []);

  /** 🔹 Ordenamiento de columnas */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /** 🔹 Aplicar ordenamiento */
  const sortedPersonnel = useMemo(() => {
    if (!sortConfig.key) return personnel;
    return [...personnel].sort((a, b) => {
      const aValue = a?.[sortConfig.key] ?? '';
      const bValue = b?.[sortConfig.key] ?? '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [personnel, sortConfig]);

  /** 🔹 Badge de estado */
  const getStatusBadge = (status) => {
    const statusConfig = {
      Activo: { bg: 'bg-success', text: 'text-success-foreground' },
      Inactivo: { bg: 'bg-error', text: 'text-error-foreground' },
      Suspendido: { bg: 'bg-warning', text: 'text-warning-foreground' },
    };
    const config = statusConfig[status] || statusConfig.Activo;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
      >
        {status}
      </span>
    );
  };

  /** 🔹 Badge de cumplimiento */
  const getComplianceBadge = (compliance) => {
    const complianceConfig = {
      Completo: {
        bg: 'bg-success',
        text: 'text-success-foreground',
        icon: 'CheckCircle',
      },
      Pendiente: {
        bg: 'bg-warning',
        text: 'text-warning-foreground',
        icon: 'Clock',
      },
      Vencido: {
        bg: 'bg-error',
        text: 'text-error-foreground',
        icon: 'AlertCircle',
      },
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

  /** 🔹 Encabezado con icono de ordenamiento */
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

  /** 🔹 Estados visuales */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Icon name="Loader2" className="animate-spin mr-2" size={18} />
        <span className="text-muted-foreground">Cargando empleados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-error">
        <Icon name="AlertCircle" className="inline-block mr-2" size={18} />
        Error al cargar los empleados: {error}
      </div>
    );
  }

  if (!sortedPersonnel.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Icon name="UserX" className="inline-block mr-2" size={18} />
        No hay empleados registrados.
      </div>
    );
  }

  /** 🔹 Render principal */
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Tabla Desktop */}
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
              <SortableHeader
                label="Última Actualización"
                sortKey="lastUpdate"
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
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

      {/* Vista móvil */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedPersonnel.map((employee) => (
          <div
            key={employee.id}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {employee.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {employee.employeeId}
                  </p>
                </div>
              </div>
              {getStatusBadge(employee.status)}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departamento:</span>
                <span>{employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Puesto:</span>
                <span>{employee.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Estudios Médicos:
                </span>
                {getComplianceBadge(employee.medicalCompliance)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">EPP:</span>
                {getComplianceBadge(employee.ppeCompliance)}
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
        ))}
      </div>
    </div>
  );
};

export default PersonnelTable;

