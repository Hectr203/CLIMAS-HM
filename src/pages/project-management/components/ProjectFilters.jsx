import React, { useState } from 'react';
import { Search, X, ChevronUp, ChevronDown, Download } from 'lucide-react';

/* =========================
   UI básicos (con mejoras)
========================= */

const Button = ({
  children,
  variant = 'default',
  size = 'default',
  onClick,
  iconName,
  iconPosition,
  className = '',
  disabled = false,
  type = 'button',
  title,
}) => {
  const Icon =
    iconName === 'X'
      ? X
      : iconName === 'ChevronUp'
      ? ChevronUp
      : iconName === 'ChevronDown'
      ? ChevronDown
      : iconName === 'Download'
      ? Download
      : null;

  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors';
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-sm',
  };
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {Icon && iconPosition === 'left' && <Icon size={16} className="mr-2" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} className="ml-2" />}
    </button>
  );
};

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
    </div>
  );
};

const Select = ({ label, options, value, onChange, className = '' }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/* =========================
   ProjectFilters principal
========================= */

const ProjectFilters = ({
  onFiltersChange,
  totalProjects,
  filteredProjects,
  onExport, // callback que viene del padre para exportar
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    dateRange: '',
    clientType: '',
    priority: '',
    minBudget: '',
    maxBudget: '',
    startDate: '',
    endDate: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'Todos los Estados' },
    { value: 'planning', label: 'Planificación' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'on-hold', label: 'En Pausa' }, // <- importante
    { value: 'review', label: 'En Revisión' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  const departmentOptions = [
    { value: '', label: 'Todos los Departamentos' },
    { value: 'sales', label: 'Ventas' },
    { value: 'engineering', label: 'Ingeniería' },
    { value: 'installation', label: 'Instalación' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'administration', label: 'Administración' },
  ];

  const dateRangeOptions = [
    { value: '', label: 'Todas las Fechas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'quarter', label: 'Este Trimestre' },
    { value: 'year', label: 'Este Año' },
  ];


  const priorityOptions = [
    { value: '', label: 'Todas las Prioridades' },
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const cleared = {
      search: '',
      status: '',
      department: '',
      dateRange: '',
      clientType: '',
      priority: '',
      minBudget: '',
      maxBudget: '',
      startDate: '',
      endDate: '',
    };
    setFilters(cleared);
    onFiltersChange?.(cleared);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const handleExportClick = () => {
    if (!onExport) return;
    if (!filteredProjects || filteredProjects <= 0) {
      alert('No hay proyectos para exportar con los filtros actuales.');
      return;
    }
    onExport(); // el padre exporta lo que ya está filtrado/visible
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">
            Filtros de Proyectos
          </h3>
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
            placeholder="Buscar por nombre de proyecto, código..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
          <Search
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
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          className="w-full"
        />

        <Select
          label="Departamento"
          options={departmentOptions}
          value={filters.department}
          onChange={(value) => handleFilterChange('department', value)}
          className="w-full"
        />

        <Select
          label="Fecha"
          options={dateRangeOptions}
          value={filters.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          className="w-full"
        />


        <Select
          label="Prioridad"
          options={priorityOptions}
          value={filters.priority}
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
            onClick={handleExportClick}
            disabled={!filteredProjects}
            title={
              filteredProjects
                ? 'Exportar proyectos filtrados'
                : 'No hay resultados para exportar'
            }
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
              value={filters.minBudget}
              onChange={(e) => handleFilterChange('minBudget', e.target.value)}
              className="w-full"
            />

            <Input
              label="Presupuesto Máximo"
              type="number"
              placeholder="$999,999"
              value={filters.maxBudget}
              onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
              className="w-full"
            />

            <Input
              label="Fecha de Inicio"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full"
            />

            <Input
              label="Fecha de Finalización"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Active Filters pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>

          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;

            // etiquetas amigables
            let displayValue = value;
            if (key === 'status')
              displayValue =
                statusOptions.find((opt) => opt.value === value)?.label ||
                value;
            if (key === 'department')
              displayValue =
                departmentOptions.find((opt) => opt.value === value)?.label ||
                value;
            if (key === 'dateRange')
              displayValue =
                dateRangeOptions.find((opt) => opt.value === value)?.label ||
                value;
            if (key === 'clientType')
              displayValue =
                clientTypeOptions.find((opt) => opt.value === value)?.label ||
                value;
            if (key === 'priority')
              displayValue =
                priorityOptions.find((opt) => opt.value === value)?.label ||
                value;
            if (key === 'minBudget' || key === 'maxBudget')
              displayValue = `$${value}`;

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
                  <X size={12} />
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

/* ==========================================
   Función de filtrado para el componente padre
   (YA CON OPCIÓN A IMPLEMENTADA)
========================================== */

// Función auxiliar para normalizar texto (sin acentos, minúsculas)
const normalizeText = (text) => {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Función auxiliar para obtener estado canónico
// Mapea estados del backend (español) a valores del filtro (inglés)
const getCanonicalEstado = (estado) => {
  const v = normalizeText(estado);
  if (v.includes('planific') || v === 'planning') return 'planning';
  if (v.includes('en proceso') || v.includes('progress') || v === 'in-progress') return 'in-progress';
  if (v.includes('pausa') || v.includes('hold') || v === 'on-hold') return 'on-hold';
  if (v.includes('revision') || v.includes('review') || v === 'review') return 'review';
  if (v.includes('complet') || v === 'completed') return 'completed';
  if (v.includes('cancel') || v === 'cancelled') return 'cancelled';
  return v;
};

export const applyProjectFilters = (projects, filters) => {
  let filtered = Array.isArray(projects) ? [...projects] : [];

  // Búsqueda por nombre, código o cliente
  if (filters?.search) {
    const searchTerm = normalizeText(filters.search);
    filtered = filtered.filter(
      (project) =>
        normalizeText(project?.nombre || project?.nombreProyecto || project?.name || '')?.includes(searchTerm) ||
        normalizeText(project?.codigo || project?.code || '')?.includes(searchTerm) ||
        normalizeText(project?.cliente?.nombre || project?.client?.name || project?.cliente || '')?.includes(searchTerm)
    );
  }

  // Filtro por estado
  if (filters?.status) {
    filtered = filtered.filter((project) => {
      const estadoProyecto = project?.estado || project?.status || '';
      const estadoCanonico = getCanonicalEstado(estadoProyecto);
      const targetCanonico = getCanonicalEstado(filters.status);
      
      // Caso especial "En Pausa" (on-hold)
      if (targetCanonico === 'on-hold' || filters.status === 'on-hold') {
        return estadoCanonico === 'on-hold' || 
               normalizeText(estadoProyecto).includes('pausa') ||
               normalizeText(estadoProyecto).includes('hold') ||
               normalizeText(estadoProyecto).includes('suspend') ||
               normalizeText(estadoProyecto).includes('detenid');
      }
      
      return estadoCanonico === targetCanonico;
    });
  }

  // Filtro por departamento
  if (filters?.department) {
    const deptMap = {
      'sales': 'Ventas',
      'engineering': 'Ingeniería',
      'installation': 'Instalación',
      'maintenance': 'Mantenimiento',
      'administration': 'Administración',
      'operations': 'Operaciones',
      'projects': 'Proyectos',
      'taller': 'Taller',
      'maintenance': 'Mantenimiento',
      'administration': 'Administración',
      'operations': 'Operaciones',
      'projects': 'Proyectos',
      'taller': 'Taller',
      'maintenance': 'Mantenimiento',
    };
    const deptTarget = deptMap[filters.department] || filters.department;
    filtered = filtered.filter(
      (project) =>
        normalizeText(project?.departamento || '') === normalizeText(deptTarget)
    );
  }

  // Filtro por tipo de cliente
  if (filters?.clientType) {
    filtered = filtered.filter(
      (project) => project?.cliente?.type === filters.clientType || project?.client?.type === filters.clientType
    );
  }

  // Filtro por prioridad
  if (filters?.priority) {
    const priorityMap = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    const priorityTarget = priorityMap[filters.priority] || filters.priority;
    filtered = filtered.filter(
      (project) =>
        normalizeText(project?.prioridad || '') === normalizeText(priorityTarget)
    );
  }

  // Filtro por rango de fechas
  if (filters?.dateRange) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter((project) => {
      const fechaInicio = project?.cronograma?.fechaInicio || project?.startDate;
      if (!fechaInicio) return false;
      const startDate = new Date(fechaInicio);
      if (isNaN(startDate.getTime())) return false;

      switch (filters.dateRange) {
        case 'today':
          return startDate.toDateString() === today.toDateString();
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return startDate >= weekAgo && startDate <= now;
        }
        case 'month':
          return (
            startDate.getMonth() === now.getMonth() &&
            startDate.getFullYear() === now.getFullYear()
          );
        case 'quarter': {
          const quarter = Math.floor(now.getMonth() / 3);
          const projectQuarter = Math.floor(startDate.getMonth() / 3);
          return (
            projectQuarter === quarter &&
            startDate.getFullYear() === now.getFullYear()
          );
        }
        case 'year':
          return startDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }

  // Filtro por rango de presupuesto
  if (filters?.minBudget) {
    const minBudget = Number(filters.minBudget);
    filtered = filtered.filter((project) => {
      const presupuesto = Number(project?.presupuesto?.total || project?.totalPresupuesto || project?.budget || 0);
      return presupuesto >= minBudget;
    });
  }

  if (filters?.maxBudget) {
    const maxBudget = Number(filters.maxBudget);
    filtered = filtered.filter((project) => {
      const presupuesto = Number(project?.presupuesto?.total || project?.totalPresupuesto || project?.budget || 0);
      return presupuesto <= maxBudget;
    });
  }

  // Filtro por fecha de inicio exacta (>=)
  if (filters?.startDate) {
    const filterStartDate = new Date(filters.startDate);
    filtered = filtered.filter((project) => {
      const fechaInicio = project?.cronograma?.fechaInicio || project?.startDate;
      if (!fechaInicio) return false;
      const projectStartDate = new Date(fechaInicio);
      return !isNaN(projectStartDate.getTime()) && projectStartDate >= filterStartDate;
    });
  }

  // Filtro por fecha de fin exacta (<=)
  if (filters?.endDate) {
    const filterEndDate = new Date(filters.endDate);
    filtered = filtered.filter((project) => {
      const fechaFin = project?.cronograma?.fechaFin || project?.endDate;
      if (!fechaFin) return false;
      const projectEndDate = new Date(fechaFin);
      return !isNaN(projectEndDate.getTime()) && projectEndDate <= filterEndDate;
    });
  }

  return filtered;
};
