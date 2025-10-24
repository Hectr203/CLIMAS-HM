import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterToolbar = ({ onFiltersChange, totalCount, filteredCount }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    technician: '',
    priority: '',
    project: '',
    dateRange: ''
  });

  const statusOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En Progreso', label: 'En Progreso' },
    { value: 'Completada', label: 'Completada' },
    { value: 'En Pausa', label: 'En Pausa' },
    { value: 'Cancelada', label: 'Cancelada' }
  ];

  const priorityOptions = [
    { value: '', label: 'Todas las Prioridades' },
    { value: 'Crítica', label: 'Crítica' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' }
  ];

  const technicianOptions = [
    { value: '', label: 'Todos los Técnicos' },
    { value: 'Carlos Mendoza', label: 'Carlos Mendoza' },
    { value: 'Ana García', label: 'Ana García' },
    { value: 'Roberto Silva', label: 'Roberto Silva' },
    { value: 'María López', label: 'María López' },
    { value: 'Diego Ramírez', label: 'Diego Ramírez' }
  ];

  const projectOptions = [
    { value: '', label: 'Todos los Proyectos' },
    { value: 'HVAC-2024-001', label: 'Torre Corporativa ABC' },
    { value: 'HVAC-2024-002', label: 'Centro Comercial Plaza Norte' },
    { value: 'HVAC-2024-003', label: 'Hospital General San José' },
    { value: 'HVAC-2024-004', label: 'Edificio Residencial Vista Mar' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Todas las Fechas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'overdue', label: 'Vencidas' }
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
      technician: '',
      priority: '',
      project: '',
      dateRange: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Órdenes de Trabajo</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Mostrando {filteredCount} de {totalCount} órdenes</span>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Filtros activos
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar por número de orden, proyecto..."
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

        <Select
          placeholder="Estado"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        <Select
          placeholder="Prioridad"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
        />

        <Select
          placeholder="Técnico"
          options={technicianOptions}
          value={filters?.technician}
          onChange={(value) => handleFilterChange('technician', value)}
          searchable
        />

        <Select
          placeholder="Proyecto"
          options={projectOptions}
          value={filters?.project}
          onChange={(value) => handleFilterChange('project', value)}
          searchable
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-border">
        <Select
          placeholder="Rango de fechas"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          className="sm:w-48"
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            iconName="X"
            iconSize={16}
          >
            Limpiar Filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterToolbar;