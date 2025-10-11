import React, { useState, useEffect } from "react";
import PersonnelTable from "./components/PersonnelTable";
import Button from "../../components/ui/Button";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Obtener los empleados desde el backend
  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:7071/api/empleados", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener empleados: ${response.statusText}`);
      }

      const data = await response.json();
      setPersonnel(data); // 👈 Guardamos los datos en el estado
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ejecutar al cargar el componente
  useEffect(() => {
    fetchPersonnel();
  }, []);

  // ✅ Callbacks para acciones
  const handleViewProfile = (employee) => {
    console.log("Ver perfil de:", employee);
  };

  const handleEditPersonnel = (employee) => {
    console.log("Editar empleado:", employee);
  };

  const handleAssignPPE = (employee) => {
    console.log("Asignar EPP a:", employee);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">
          Gestión de Personal
        </h2>
        <Button onClick={fetchPersonnel} variant="primary">
          Actualizar lista
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando empleados...</p>
      ) : (
        <PersonnelTable
          personnel={personnel}
          onViewProfile={handleViewProfile}
          onEditPersonnel={handleEditPersonnel}
          onAssignPPE={handleAssignPPE}
        />
      )}
    </div>
  );
}
