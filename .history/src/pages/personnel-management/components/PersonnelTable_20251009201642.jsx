import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PersonnelTable = ({ personnel, onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPersonnel = React.useMemo(() => {
    if (!sortConfig?.key) return personnel;

    return [...personnel].sort((a, b) => {
      const aValue = a?.[sortConfig.key];
      const bValue = b?.[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [personnel, sortConfig]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      Activo: { bg: 'bg-green-100', text: 'text-green-700' },
      Inactivo: { bg: 'bg-red-100', text: 'text-red-700' },
      Suspendido: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    };
    const config = statusConfig[status] || statusConfig.Activo;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const getComplianceBadge = (compliance) => {
    const complianceConfig = {
      Completo: { bg: 'bg-green-100', text: 'text-green-700', icon: 'CheckCircle' },
      Pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'Clock' },
      Vencido: { bg: 'bg-red-100', text: 'text-red-700', icon: 'AlertCircle' },
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

  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
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

  return (
    <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
              <SortableHeader label="Departamento" sortKey="department" />
              <SortableHeader label="Puesto" sortKey="position" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudios Médicos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPP</th>
              <SortableHeader label="Última Actualización" sortKey="lastUpdate" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPersonnel.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      <Image src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.department}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{employee.position}</td>
                <td className="px-6 py-4">{getStatusBadge(employee.status)}</td>
                <td className="px-6 py-4">{getComplianceBadge(employee.medicalCompliance)}</td>
                <td className="px-6 py-4">{getComplianceBadge(employee.ppeCompliance)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{employee.lastUpdate}</td>
                <td className="px-6 py-4 flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onViewProfile(employee)} iconName="Eye">
                    Ver
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEditPersonnel(employee)} iconName="Edit">
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onAssignPPE(employee)} iconName="Shield">
                    EPP
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedPersonnel.map((employee) => (
          <div key={employee.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  <Image src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
                  <p className="text-xs text-gray-500">{employee.employeeId}</p>
                </div>
              </div>
              {getStatusBadge(employee.status)}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Departamento:</span>
                <span className="text-gray-900">{employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Puesto:</span>
                <span className="text-gray-900">{employee.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estudios Médicos:</span>
                {getComplianceBadge(employee.medicalCompliance)}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">EPP:</span>
                {getComplianceBadge(employee.ppeCompliance)}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onViewProfile(employee)} iconName="Eye" className="flex-1">
                Ver Perfil
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEditPersonnel(employee)} iconName="Edit">
                Editar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onAssignPPE(employee)} iconName="Shield">
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
