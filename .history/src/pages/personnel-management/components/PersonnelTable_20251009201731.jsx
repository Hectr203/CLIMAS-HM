import React, { useEffect, useState } from 'react';
import PersonnelTable from './components/PersonnelTable';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const PersonnelPage = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Función para obtener los empleados del endpoint
  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/empleados'); // Vite proxy redirige a http://localhost:7071/api/empleados
      if (!response.ok) throw new Error('Error al obtener empleados');

      const data = await response.json();

      // Si los campos vienen con nombres diferentes, aquí puedes adaptarlos
      const formatted = data.map((item) => ({
        id: item.id || item.idEmpleado || item.ID || 0,
        name: item.name || item.nombre || 'Sin nombre',
        employeeId: item.employeeId || item.clave || item.codigo || 'N/A',
        department: item.department || item.departamento || 'Sin departamento',
        position: item.position || item.puesto || 'Sin puesto',
        status: item.status || item.estado || 'Activo',
        medicalCompliance: item.medicalCompliance || item.estudios_medicos || 'Pendiente',
        ppeCompliance: item.ppeCompliance || item.epp || 'Pendiente',
        lastUpdate: item.lastUpdate || item.fecha_actualizacion || 'N/D',
        avatar: item.avatar || 'https://via.placeholder.com/80',
      }));

      setPersonnel(formatted);
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Llamar API al montar componente
  useEffect(() => {
    fetchPersonnel();
  }, []);

  // 🔹 Funciones para las acciones de los botones
  const handleViewProfile = (employee) => {
    console.log('👁️ Ver perfil de:', employee);
  };

  const handleEditPersonnel = (employee) => {
    console.log('✏️ Editar empleado:', employee);
  };

  const handleAssignPPE = (employee) => {
    console.log('🦺 Asignar EPP a:', employee);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Gestión de Personal</h1>
        <Button
          onClick={fetchPersonnel}
          variant="outline"
          iconName="RefreshCw"
          className="flex items-center space-x-2"
        >
          <Icon name="RefreshCw" size={16} />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* Tabla o carga */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin mr-2" />
          Cargando empleados...
        </div>
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
};

export default PersonnelPage;
