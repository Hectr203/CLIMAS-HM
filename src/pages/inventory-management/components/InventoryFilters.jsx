import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InventoryFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  onExport,
  totalItems,
  filteredItems 
}) => {
  const categoryOptions = [
    { value: '', label: 'Todas las Categorías' },
    { value: 'hvac-equipment', label: 'Equipos HVAC' },
    { value: 'refrigeration', label: 'Refrigeración' },
    { value: 'electrical', label: 'Componentes Eléctricos' },
    { value: 'plumbing', label: 'Plomería' },
    { value: 'tools', label: 'Herramientas' },
    { value: 'safety', label: 'Seguridad' },
    { value: 'consumables', label: 'Consumibles' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'in-stock', label: 'En Stock' },
    { value: 'low-stock', label: 'Stock Bajo' },
    { value: 'out-of-stock', label: 'Agotado' },
    { value: 'reserved', label: 'Reservado' }
  ];

  const supplierOptions = [
    { value: '', label: 'Todos los Proveedores' },
    { value: 'carrier', label: 'Carrier México' },
    { value: 'trane', label: 'Trane Climatización' },
    { value: 'york', label: 'York International' },
    { value: 'lennox', label: 'Lennox Industries' },
    { value: 'daikin', label: 'Daikin México' },
    { value: 'rheem', label: 'Rheem Manufacturing' }
  ];

  const locationOptions = [
    { value: '', label: 'Todas las Ubicaciones' },
    { value: 'warehouse-main', label: 'Almacén Principal' },
    { value: 'warehouse-secondary', label: 'Almacén Secundario' },
    { value: 'workshop', label: 'Taller' },
    { value: 'field-storage', label: 'Almacén de Campo' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtros de Inventario</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Filtros Activos
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredItems} de {totalItems} artículos
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconSize={16}
          >
            Exportar
          </Button>
        </div>
      </div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Buscar por código, descripción o especificaciones..."
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
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Select
          label="Categoría"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
          placeholder="Seleccionar categoría"
        />

        <Select
          label="Estado de Stock"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Seleccionar estado"
        />

        <Select
          label="Proveedor"
          options={supplierOptions}
          value={filters?.supplier}
          onChange={(value) => handleFilterChange('supplier', value)}
          placeholder="Seleccionar proveedor"
          searchable
        />

        <Select
          label="Ubicación"
          options={locationOptions}
          value={filters?.location}
          onChange={(value) => handleFilterChange('location', value)}
          placeholder="Seleccionar ubicación"
        />
      </div>
      {/* Stock Level Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            type="number"
            label="Stock Mínimo"
            placeholder="0"
            value={filters?.minStock}
            onChange={(e) => handleFilterChange('minStock', e?.target?.value)}
            min="0"
          />
        </div>
        <div>
          <Input
            type="number"
            label="Stock Máximo"
            placeholder="1000"
            value={filters?.maxStock}
            onChange={(e) => handleFilterChange('maxStock', e?.target?.value)}
            min="0"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            iconName="X"
            iconSize={16}
            className="w-full"
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters?.quickFilter === 'low-stock' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('quickFilter', 
            filters?.quickFilter === 'low-stock' ? '' : 'low-stock'
          )}
          iconName="AlertTriangle"
          iconSize={16}
        >
          Stock Bajo
        </Button>
        
        <Button
          variant={filters?.quickFilter === 'out-of-stock' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('quickFilter', 
            filters?.quickFilter === 'out-of-stock' ? '' : 'out-of-stock'
          )}
          iconName="AlertCircle"
          iconSize={16}
        >
          Agotado
        </Button>
        
        <Button
          variant={filters?.quickFilter === 'reserved' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('quickFilter', 
            filters?.quickFilter === 'reserved' ? '' : 'reserved'
          )}
          iconName="Lock"
          iconSize={16}
        >
          Reservado
        </Button>
        
        <Button
          variant={filters?.quickFilter === 'recent' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleFilterChange('quickFilter', 
            filters?.quickFilter === 'recent' ? '' : 'recent'
          )}
          iconName="Clock"
          iconSize={16}
        >
          Recién Agregados
        </Button>
      </div>
    </div>
  );
};

export default InventoryFilters;