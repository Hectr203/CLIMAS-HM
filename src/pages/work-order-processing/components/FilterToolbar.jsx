import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import usePerson from "../../../hooks/usePerson";

const FilterToolbar = ({ onFiltersChange, totalCount, filteredCount }) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    technician: "",
    priority: "",
    project: "",
    dateRange: "",
  });

  const { getPersonsByDepartment, departmentPersons, loading: loadingPersons } = usePerson();

  // Cargar técnicos de Taller y Mantenimiento al montar el componente
  useEffect(() => {
    getPersonsByDepartment("Taller,Mantenimiento");
  }, []);

  const statusOptions = [
    { value: "", label: "Todos los Estados" },
    { value: "Pendiente", label: "Pendiente" },
    { value: "En Progreso", label: "En Progreso" },
    { value: "Completada", label: "Completada" },
    { value: "En Pausa", label: "En Pausa" },
    { value: "Cancelada", label: "Cancelada" },
  ];

  const priorityOptions = [
    { value: "", label: "Todas las Prioridades" },
    { value: "Crítica", label: "Crítica" },
    { value: "Alta", label: "Alta" },
    { value: "Media", label: "Media" },
    { value: "Baja", label: "Baja" },
  ];

  const projectOptions = [
  { value: "", label: "Todos los Proyectos" },
  { value: "Instalación", label: "Instalación" },
  { value: "Mantenimiento Preventivo", label: "Mantenimiento Preventivo" },
  { value: "Mantenimiento Correctivo", label: "Mantenimiento Correctivo" },
  { value: "Inspección", label: "Inspección" },
];

  const dateRangeOptions = [
    { value: "", label: "Todas las Fechas" },
    { value: "today", label: "Hoy" },
    { value: "week", label: "Esta Semana" },
    { value: "month", label: "Este Mes" },
    { value: "overdue", label: "Vencidas" },
  ];

  // Generar opciones de técnicos dinámicamente
  const technicianOptions = loadingPersons
    ? [{ value: "", label: "Cargando técnicos..." }]
    : Array.isArray(departmentPersons) && departmentPersons.length > 0
    ? [
        { value: "", label: "Todos los Técnicos" },
        ...departmentPersons.map((p) => ({
          value: p.nombreCompleto,
          label: `${p.nombreCompleto} - ${p.departamento || ""}`,
        })),
      ]
    : [{ value: "", label: "No hay técnicos disponibles" }];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      status: "",
      technician: "",
      priority: "",
      project: "",
      dateRange: "",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some((value) => value !== "");

  // 🔹 Generar mensaje dinámico de "sin resultados"
  const getNoResultsMessage = () => {
    if (filteredCount > 0) return null;

    if (filters.search)
      return `No se encontraron resultados para "${filters.search}"`;
    if (filters.status)
      return `No se encontraron órdenes con estado "${filters.status}"`;
    if (filters.priority)
      return `No se encontraron órdenes con prioridad "${filters.priority}"`;
    if (filters.technician)
      return `No se encontraron órdenes asignadas a "${filters.technician}"`;
    if (filters.project)
      return `No se encontraron órdenes del proyecto "${filters.project}"`;
    if (filters.dateRange)
      return `No se encontraron órdenes en el rango de fechas seleccionado`;

    return "No hay órdenes registradas actualmente.";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Órdenes de Trabajo</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
  {totalCount === 0 ? (
    <span>No hay órdenes registradas</span>
  ) : filteredCount === 0 ? (
    <span>No se encontraron resultados</span>
  ) : filteredCount === totalCount ? (
    <span>Mostrando todas las {totalCount} órdenes</span>
  ) : (
    <span>
      Mostrando {filteredCount} de {totalCount} órdenes
    </span>
  )}
  {hasActiveFilters && (
    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
      Filtros activos
    </span>
  )}
</div>

        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Buscar */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar por número de orden..."
              value={filters?.search}
              onChange={(e) => handleFilterChange("search", e?.target?.value)}
              className="pl-10"
            />
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>

        {/* Estado */}
        <Select
          placeholder="Estado"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange("status", value)}
        />

        {/* Prioridad */}
        <Select
          placeholder="Prioridad"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange("priority", value)}
        />

        {/* Técnico */}
        <Select
          placeholder="Técnico"
          options={technicianOptions}
          value={filters?.technician}
          onChange={(value) => handleFilterChange("technician", value)}
          searchable
          loading={loadingPersons}
        />

        {/* Proyecto */}
        <Select
          placeholder="Proyecto"
          options={projectOptions}
          value={filters?.project}
          onChange={(value) => handleFilterChange("project", value)}
          searchable
        />
      </div>

      {/* Rango de fechas y botón limpiar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-border">
        <Select
          placeholder="Rango de fechas"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange("dateRange", value)}
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

      {/* Mensaje dinámico cuando no hay resultados */}
      {filteredCount === 0 && (
        <div className="mt-4 flex items-center text-sm text-muted-foreground italic">
          <Icon name="SearchX" size={16} className="mr-2" />
          {getNoResultsMessage()}
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;
