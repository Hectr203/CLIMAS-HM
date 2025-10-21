import React, { useEffect, useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import useProyect from '../../../hooks/useProyect';
const FilterControls = ({ onFiltersChange, onExport, onReset }) => {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    category: '',
    department: '',
    status: '',
    project: '',
    amountMin: '',
    amountMax: '',
    searchTerm: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const { getProyectos, proyectos } = useProyect();

  // Cargar proyectos desde el hook
  useEffect(() => {
    getProyectos().catch(() => {});
  }, [getProyectos]);

  // Notificar filtros iniciales al padre
  useEffect(() => {
    onFiltersChange?.(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ==============================
     OPCIONES DE SELECT
  ============================== */
  const dateRangeOptions = [
    { value: 'all', label: 'Sin filtro' },
    { value: 'today', label: 'Hoy' },
    { value: 'thisWeek', label: 'Esta Semana' },
    { value: 'thisMonth', label: 'Este Mes' },
    { value: 'lastMonth', label: 'Mes Anterior' },
    { value: 'thisQuarter', label: 'Este Trimestre' },
    { value: 'thisYear', label: 'Este Año' },
    { value: 'custom', label: 'Rango Personalizado' }
  ];

  const categoryOptions = [
    { value: '', label: 'Todas las Categorías' },
    { value: 'Viajes', label: 'Viajes' },
    { value: 'Materiales', label: 'Materiales' },
    { value: 'Nómina', label: 'Nómina' },
    { value: 'Proveedores', label: 'Proveedores' },
    { value: 'Equipos', label: 'Equipos' },
    { value: 'Servicios', label: 'Servicios' }
  ];

  const departmentOptions = [
    { value: '', label: 'Todos los Departamentos' },
    { value: 'Administración', label: 'Administración' },
    { value: 'Proyectos', label: 'Proyectos' },
    { value: 'Ventas', label: 'Ventas' },
    { value: 'Taller', label: 'Taller' },
    { value: 'Operaciones', label: 'Operaciones' }
  ];

  // 🔹 Estado: solo Pendiente y Autorizado
  const statusOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Autorizado', label: 'Autorizado' }
  ];

  // 🔹 Proyectos cargados dinámicamente
  const projectOptions = useMemo(() => {
    const base = [{ value: '', label: 'Todos los Proyectos' }];
    const seen = new Set();

    const list = Array.isArray(proyectos) ? proyectos : [];
    const opts = list
      .map((p) => {
        const id =
          p?.id ?? p?._id ?? p?.proyectoId ?? p?.codigo ?? p?.code ?? null;

        const nombre =
          p?.nombreProyecto ??
          p?.nombre ??
          p?.name ??
          p?.titulo ??
          p?.descripcion ??
          '';

        const codigo =
          p?.codigo ?? p?.code ?? p?.clave ?? p?.projectCode ?? '';

        const value = codigo || id;
        if (!value) return null;
        if (seen.has(value)) return null;
        seen.add(value);

        // 👇 solo muestra el nombre del proyecto, sin código
        return { value, label: nombre || value };
      })
      .filter(Boolean);

    return base.concat(opts);
  }, [proyectos]);

  /* ==============================
     MANEJADORES
  ============================== */
  const handleFilterChange = (key, value) => {
    let next = { ...filters, [key]: value };

    if (key === 'dateRange' && value !== 'custom') {
      next.startDate = '';
      next.endDate = '';
    }

    if (key === 'amountMin' || key === 'amountMax') {
      const raw = String(value ?? '');
      next[key] = raw === '' ? '' : isNaN(Number(raw)) ? '' : raw;
    }

    setFilters(next);
    onFiltersChange?.(next);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: 'all',
      startDate: '',
      endDate: '',
      category: '',
      department: '',
      status: '',
      project: '',
      amountMin: '',
      amountMax: '',
      searchTerm: ''
    };
    setFilters(resetFilters);
    onReset?.(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'dateRange') return value !== 'all';
      return value !== '';
    }).length;
  };

  /* ==============================
     RENDER
  ============================== */
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* 🔍 Buscador y botón de filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar gastos, proveedores, proyectos..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e?.target?.value)}
              className="pl-10"
            />
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            iconName={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            Filtros Avanzados
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Rango de Fechas"
          options={dateRangeOptions}
          value={filters.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />

        <Select
          label="Categoría"
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        <Select
          label="Estado"
          options={statusOptions}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        <Select
          label="Proyecto"
          options={projectOptions}
          value={filters.project}
          onChange={(value) => handleFilterChange('project', value)}
          searchable
        />
      </div>

      {/* Filtro de fechas personalizadas */}
      {filters.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <Input
            type="date"
            label="Fecha Inicio"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
          />
          <Input
            type="date"
            label="Fecha Fin"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
          />
        </div>
      )}

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t border-border pt-4 space-y-4">
          <h4 className="text-sm font-medium text-foreground">Filtros Avanzados</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Departamento"
              options={departmentOptions}
              value={filters.department}
              onChange={(value) => handleFilterChange('department', value)}
            />

            <Input
              type="number"
              label="Monto Mínimo (MXN)"
              placeholder="0.00"
              value={filters.amountMin}
              onChange={(e) => handleFilterChange('amountMin', e?.target?.value)}
            />

            <Input
              type="number"
              label="Monto Máximo (MXN)"
              placeholder="999999.99"
              value={filters.amountMax}
              onChange={(e) => handleFilterChange('amountMax', e?.target?.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {getActiveFiltersCount()} filtro{getActiveFiltersCount() !== 1 ? 's' : ''} activo{getActiveFiltersCount() !== 1 ? 's' : ''}
            </div>
            <Button
              variant="ghost"
              onClick={handleReset}
              iconName="RotateCcw"
              iconPosition="left"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
