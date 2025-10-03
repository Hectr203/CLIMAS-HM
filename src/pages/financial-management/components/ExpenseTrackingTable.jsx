import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpenseTrackingTable = ({ expenses, onApprove, onReject, onViewDetails }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExpenses = [...expenses]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'amount') {
      aValue = parseFloat(aValue?.replace(/[^0-9.-]+/g, ''));
      bValue = parseFloat(bValue?.replace(/[^0-9.-]+/g, ''));
    }

    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pendiente': { bg: 'bg-warning', text: 'text-warning-foreground', icon: 'Clock' },
      'Aprobado': { bg: 'bg-success', text: 'text-success-foreground', icon: 'CheckCircle' },
      'Rechazado': { bg: 'bg-error', text: 'text-error-foreground', icon: 'XCircle' },
      'En Revisión': { bg: 'bg-secondary', text: 'text-secondary-foreground', icon: 'Eye' }
    };

    const config = statusConfig?.[status] || statusConfig?.['Pendiente'];

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        <Icon name={config?.icon} size={12} />
        <span>{status}</span>
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      'Viajes': 'Plane',
      'Materiales': 'Package',
      'Nómina': 'Users',
      'Proveedores': 'Building2',
      'Equipos': 'Wrench',
      'Servicios': 'Settings'
    };

    return categoryIcons?.[category] || 'DollarSign';
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Fecha</span>
                  <Icon 
                    name={sortField === 'date' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Categoría</span>
                  <Icon 
                    name={sortField === 'category' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Descripción</span>
                  <Icon 
                    name={sortField === 'description' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Monto</span>
                  <Icon 
                    name={sortField === 'amount' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Estado</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Proyecto</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-sm font-medium text-foreground">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedExpenses?.map((expense) => (
              <tr key={expense?.id} className="hover:bg-muted/50 transition-smooth">
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">{expense?.date}</div>
                  <div className="text-xs text-muted-foreground">{expense?.time}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Icon name={getCategoryIcon(expense?.category)} size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{expense?.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">{expense?.description}</div>
                  {expense?.vendor && (
                    <div className="text-xs text-muted-foreground">Proveedor: {expense?.vendor}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">{expense?.amount}</div>
                  {expense?.currency && expense?.currency !== 'MXN' && (
                    <div className="text-xs text-muted-foreground">{expense?.currency}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(expense?.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">{expense?.project}</div>
                  <div className="text-xs text-muted-foreground">{expense?.projectCode}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(expense)}
                      iconName="Eye"
                      iconSize={14}
                    >
                      Ver
                    </Button>
                    {expense?.status === 'Pendiente' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => onApprove(expense?.id)}
                          iconName="Check"
                          iconSize={14}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onReject(expense?.id)}
                          iconName="X"
                          iconSize={14}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
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

export default ExpenseTrackingTable;