import React, { useEffect, useState } from "react";
import { Eye, Pencil, HardHat } from "lucide-react";
import DataTable from "../../../components/DataTable";
import FilterToolbar from "../../../components/FilterToolbar";
import { getEmpleados } from "../../../data/Empleados";

const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const [filters, setFilters] = useState({
    puesto: "",
    area: "",
    antiguedad: "",
  });

  const [personnelData, setPersonnelData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // ✅ Cargar los empleados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEmpleados();
        setPersonnelData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error al obtener empleados:", error);
      }
    };
    fetchData();
  }, []);

  // ✅ Filtros dinámicos
  useEffect(() => {
    let data = [...personnelData];

    if (filters.puesto) {
      data = data.filter((p) =>
        p.puesto?.toLowerCase().includes(filters.puesto.toLowerCase())
      );
    }

    if (filters.area) {
      data = data.filter((p) =>
        p.area?.toLowerCase().includes(filters.area.toLowerCase())
      );
    }

    if (filters.antiguedad) {
      data = data.filter((p) =>
        p.antiguedad?.toString().includes(filters.antiguedad.toString())
      );
    }

    setFilteredData(data);
  }, [filters, personnelData]);

  // ✅ Definición de columnas
  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Área", selector: (row) => row.area, sortable: true },
    { name: "Puesto", selector: (row) => row.puesto, sortable: true },
    { name: "Antigüedad", selector: (row) => `${row.antiguedad} años` },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onViewProfile(row)}
            title="Ver perfil"
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onEditPersonnel(row)}
            title="Editar"
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onAssignPPE(row)}
            title="Asignar EPP"
            className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition"
          >
            <HardHat className="w-4 h-4 text-green-600" />
          </button>
        </div>
      ),
    },
  ];

  // ✅ Render final: solo un FilterToolbar
  return (
    <div className="space-y-6">
      {/* 🔹 Barra de filtros (solo una vez) */}
      <FilterToolbar filters={filters} setFilters={setFilters} />

      {/* 🔹 Tabla principal */}
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        noDataMessage="No se encontraron empleados con los filtros seleccionados."
      />
    </div>
  );
};

export default PersonnelTable;
