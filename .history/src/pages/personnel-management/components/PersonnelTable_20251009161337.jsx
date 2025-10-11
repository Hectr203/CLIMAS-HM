import React, { useEffect, useState } from 'react';
import PersonnelTable from './PersonnelTable';
import PersonnelModal from './PersonnelModal';

const PersonnelPage = () => {
  const [personnel, setPersonnel] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view' | 'edit' | 'create'

  // ✅ Traer empleados del backend
  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/empleados'); // Usa el proxy de Vite
      if (!response.ok) throw new Error('Error al obtener empleados');
      const data = await response.json();
      setPersonnel(data); // Asegúrate que data sea un array
    } catch (error) {
      console.error('❌ Error al cargar empleados:', error);
      alert('No se pudieron cargar los empleados. Revisa la consola.');
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  // Funciones para el modal
  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditPersonnel = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAssignPPE = (employee) => {
    // Aquí puedes abrir otro modal o componente para asignar EPP
    alert(`Asignar EPP a ${employee.name}`);
  };

  const handleSave = (updatedEmployee) => {
    // Actualizar la tabla después de guardar
    setPersonnel(prev => {
      const exists = prev.find(e => e.id === updatedEmployee.id);
      if (exists) {
        return prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
      }
      return [...prev, updatedEmployee];
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => { setSelectedEmployee(null); setModalMode('create'); setModalOpen(true); }}
        >
          Nuevo Empleado
        </button>
      </div>

      <PersonnelTable
        personnel={personnel}
        onViewProfile={handleViewProfile}
        onEditPersonnel={handleEditPersonnel}
        onAssignPPE={handleAssignPPE}
      />

      {modalOpen && (
        <PersonnelModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employee={selectedEmployee}
          mode={modalMode}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default PersonnelPage;
