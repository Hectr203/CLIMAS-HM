import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientTable = ({ clients, onViewDetails, onEditClient, onViewProjects, onViewContracts }) => {
  const [sortField, setSortField] = useState('empresa');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedClients = [...clients]?.sort((a, b) => {
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-success text-success-foreground';
      case 'Inactivo':
        return 'bg-error text-error-foreground';
      case 'Pendiente':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'Excelente':
        return 'text-success';
      case 'Buena':
        return 'text-primary';
      case 'Regular':
        return 'text-warning';
      case 'Mala':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-smooth"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <Icon 
          name={sortField === field ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
          size={14} 
        />
      </div>
    </th>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <SortableHeader field="empresa">Empresa</SortableHeader>
              <SortableHeader field="contacto">Contacto</SortableHeader>
              <SortableHeader field="industria">Industria</SortableHeader>
              <SortableHeader field="ubicacionEmpre">Ubicación</SortableHeader>
              <SortableHeader field="estado">Estado</SortableHeader>
              <SortableHeader field="relacion">Relación</SortableHeader>
              <SortableHeader field="totalProjects">Proyectos</SortableHeader>
              <SortableHeader field="totalValue">Valor Total</SortableHeader>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedClients?.map((client) => (
              <tr key={client?.id || client?._id || client?.empresa} className="hover:bg-muted transition-smooth">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="Building2" size={16} color="white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-foreground">{String(client?.empresa || '')}</div>
                      <div className="text-sm text-muted-foreground">RFC: {String(client?.rfc || '')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{String(client?.contacto || '')}</div>
                  <div className="text-sm text-muted-foreground">{String(client?.email || '')}</div>
                  <div className="text-sm text-muted-foreground">{String(client?.telefono || '')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{String(client?.industria || '')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{String(client?.ubicacionEmpre || client?.ubicacion?.direccion || '')}</div>
                  <div className="text-xs text-muted-foreground">{String(client?.ubicacion?.ciudad || '')}, {String(client?.ubicacion?.estado || '')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client?.estado)}`}>
                    {String(client?.estado || '')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getHealthColor(client?.relacion)}`}>
                    {String(client?.relacion || '')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{Number(client?.totalProjects || 0)}</div>
                  <div className="text-xs text-muted-foreground">{Number(client?.activeContracts || 0)} contratos</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-success">
                    ${Number(client?.totalValue || 0).toLocaleString('es-MX')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProjects(client)}
                      title="Ver proyectos"
                    >
                      <Icon name="FolderOpen" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewContracts(client)}
                      title="Ver contratos"
                    >
                      <Icon name="FileText" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditClient(client)}
                      title="Editar cliente"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(client)}
                      title="Ver detalles"
                    >
                      <Icon name="Eye" size={16} />
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

export default ClientTable;