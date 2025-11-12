import React from "react";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const FilterGastos = ({ filters, onFilterChange, onClearFilters, totalCount, filteredCount }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters || {}).some(v => v !== "");

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      {/* Buscador principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Buscar por proveedor.."
            value={filters?.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filtros adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Código */}
        <Input
          type="text"
          label="Código"
          placeholder="Ej. OC-2025-001"
          value={filters?.codigo || ""}
          onChange={(e) => handleFilterChange("codigo", e.target.value)}
        />

        {/* Fecha desde */}
        <Input
          type="date"
          label="Fecha desde"
          value={filters?.fechaDesde || ""}
          onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
        />

        {/* Fecha hasta */}
        <Input
          type="date"
          label="Fecha hasta"
          value={filters?.fechaHasta || ""}
          onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
        />
      </div>
      <div className="text-sm text-muted-foreground mt-2">
        Mostrando <strong>{filteredCount}</strong> de <strong>{totalCount}</strong> resultados
      </div>
    </div>
  );
};

export default FilterGastos;
