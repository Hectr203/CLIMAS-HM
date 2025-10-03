import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterToolbar = ({ onFilterChange, totalImages, filteredImages, selectedCount, onSelectAll }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    phase: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      category: '',
      phase: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    { value: 'material-reception', label: 'Recepción de Material' },
    { value: 'manufacturing', label: 'Fabricación' },
    { value: 'quality-control', label: 'Control de Calidad' },
    { value: 'documentation', label: 'Documentación' },
    { value: 'installation', label: 'Instalación' },
    { value: 'testing', label: 'Pruebas' },
    { value: 'training', label: 'Capacitación' },
    { value: 'completion', label: 'Finalización' },
    { value: 'new-upload', label: 'Nueva Imagen' }
  ];

  const phaseOptions = [
    { value: '', label: 'Todas las fases' },
    { value: 'planning', label: 'Planificación' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'on-hold', label: 'En Pausa' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por título, descripción o etiquetas..."
                value={filters?.search}
                onChange={(e) => handleFilterChange('search', e?.target?.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="min-w-48">
            <Select
              value={filters?.category}
              onValueChange={(value) => handleFilterChange('category', value)}
              options={categoryOptions}
            />
          </div>
          
          {/* Phase Filter */}
          <div className="min-w-40">
            <Select
              value={filters?.phase}
              onValueChange={(value) => handleFilterChange('phase', value)}
              options={phaseOptions}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            iconName="Filter"
            iconPosition="left"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            Filtros {hasActiveFilters && `(${Object.values(filters)?.filter(v => v !== '')?.length})`}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              iconName="X"
              iconPosition="left"
              onClick={clearFilters}
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha desde
              </label>
              <Input
                type="date"
                value={filters?.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha hasta
              </label>
              <Input
                type="date"
                value={filters?.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Filtros rápidos
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('dateFrom', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0])}
                >
                  Última semana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('category', 'quality-control')}
                >
                  Control de calidad
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('phase', 'completed')}
                >
                  Completados
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>
            Mostrando {filteredImages} de {totalImages} imágenes
          </span>
          {selectedCount > 0 && (
            <>
              <span>•</span>
              <span className="text-primary font-medium">
                {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            iconName={selectedCount === filteredImages ? "Square" : "CheckSquare"}
            iconPosition="left"
          >
            {selectedCount === filteredImages ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterToolbar;