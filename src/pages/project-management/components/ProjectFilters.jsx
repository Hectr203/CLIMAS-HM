import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProjectFilters = ({ onFiltersChange, totalProjects, filteredProjects }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    dateRange: '',
    clientType: '',
    priority: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'planning', label: 'Planificación' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'on-hold', label: 'En Pausa' },
    { value: 'review', label: 'En Revisión' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const departmentOptions = [
    { value: '', label: 'Todos los Departamentos' },
    { value: 'sales', label: 'Ventas' },
    { value: 'engineering', label: 'Ingeniería' },
    { value: 'installation', label: 'Instalación' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'administration', label: 'Administración' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Todas las Fechas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'quarter', label: 'Este Trimestre' },
    { value: 'year', label: 'Este Año' }
  ];

  const clientTypeOptions = [
    { value: '', label: 'Todos los Clientes' },
    { value: 'residential', label: 'Residencial' },
    { value: 'commercial', label: 'Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'government', label: 'Gubernamental' }
  ];

  const priorityOptions = [
    { value: '', label: 'Todas las Prioridades' },
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      department: '',
      dateRange: '',
      clientType: '',
      priority: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Filtros de Proyectos</h3>
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredProjects} de {totalProjects} proyectos
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              iconName="X"
              iconPosition="left"
            >
              Limpiar Filtros
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            {isExpanded ? 'Menos Filtros' : 'Más Filtros'}
          </Button>
        </div>
      </div>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Buscar por nombre de proyecto, cliente, código..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="pl-10"
          />
          <Icon 
            name="Search" 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>
      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <Select
          label="Estado"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
          className="w-full"
        />
        <Select
          label="Departamento"
          options={departmentOptions}
          value={filters?.department}
          onChange={(value) => handleFilterChange('department', value)}
          className="w-full"
        />
        <Select
          label="Fecha"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          className="w-full"
        />
        <Select
          label="Tipo de Cliente"
          options={clientTypeOptions}
          value={filters?.clientType}
          onChange={(value) => handleFilterChange('clientType', value)}
          className="w-full"
        />
        <Select
          label="Prioridad"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
          className="w-full"
        />
        <div className="flex items-end">
          <Button
            variant="outline"
            size="default"
            iconName="Download"
            iconPosition="left"
            className="w-full"
          >
            Exportar
          </Button>
        </div>
      </div>
      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Presupuesto Mínimo"
              type="number"
              placeholder="$0"
              className="w-full"
            />
            <Input
              label="Presupuesto Máximo"
              type="number"
              placeholder="$999,999"
              className="w-full"
            />
            <Input
              label="Fecha de Inicio"
              type="date"
              className="w-full"
            />
            <Input
              label="Fecha de Finalización"
              type="date"
              className="w-full"
            />
          </div>
        </div>
      )}
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {Object.entries(filters)?.map(([key, value]) => {
            if (!value) return null;
            
            let displayValue = value;
            if (key === 'status') displayValue = statusOptions?.find(opt => opt?.value === value)?.label || value;
            if (key === 'department') displayValue = departmentOptions?.find(opt => opt?.value === value)?.label || value;
            if (key === 'dateRange') displayValue = dateRangeOptions?.find(opt => opt?.value === value)?.label || value;
            if (key === 'clientType') displayValue = clientTypeOptions?.find(opt => opt?.value === value)?.label || value;
            if (key === 'priority') displayValue = priorityOptions?.find(opt => opt?.value === value)?.label || value;

            return (
              <div
                key={key}
                className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
              >
                <span>{displayValue}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;