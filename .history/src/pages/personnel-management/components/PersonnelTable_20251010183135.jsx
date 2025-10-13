import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import usePerson from '../../../hooks/usePerson';

/**
 * Tabla de personal con opciones para ver, editar y asignar EPP
 */
const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const { persons, loading, error, getPersons } = usePerson();
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  // Cargar empleados al iniciar el componente
  useEffect(() => {
    getPersons();
  }, []);

  // Ordenar la lista de empleados
  const sortedPersonnel = useMemo(() => {
    if (!persons) return [];
    const sorted = [...persons];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
    return sorted;
  }, [persons, sortConfig]);

  // Cambiar criterio de orden
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 text-gray-600">
        <Icon name="loader" className="animate-spin mr-2" /> Cargando empleados...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        ❌ Error al cargar empleados: {error.userMessage || error.message}
      </div>
    );
  }

  if (!sortedPersonnel.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay empleados registrados todavía.
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th
              className="px-4 py-3 text-left cursor-pointer"
              onClick={() => handleSort('nombre')}
            >
              Nombre
              {sortConfig.key === 'nombre' && (
                <Icon
                  name={sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                  className="inline-block ml-1 w-4 h-4"
                />
              )}
            </th>
            <th className="px-4 py-3 text-left">Puesto</th>
            <th className="px-4 py-3 text-left">Área</th>
            <th className="px-4 py-3 text-left">Correo</th>
            <th className="px-4 py-3 text-left">Teléfono</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="text-gray-800">
          {sortedPersonnel.map((emp) => (
            <tr
              key={emp.id || emp._id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-2 flex items-center gap-3">
                <Image
                  src={emp.foto || '/default-avatar.png'}
                  alt={emp.nombre}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                {emp.nombre || 'Sin nombre'}
              </td>
              <td className="px-4 py-2">{emp.puesto || '-'}</td>
              <td className="px-4 py-2">{emp.area || '-'}</td>
              <td className="px-4 py-2">{emp.correo || '-'}</td>
              <td className="px-4 py-2">{emp.telefono || '-'}</td>
              <td className="px-4 py-2 flex justify-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Ver perfil"
                  onClick={() => onViewProfile(emp)}
                >
                  <Icon name="eye" className="w-5 h-5 text-blue-500" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  title="Editar empleado"
                  onClick={() => onEditPersonnel(emp)}
                >
                  <Icon name="edit" className="w-5 h-5 text-green-500" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  title="Asignar EPP"
                  onClick={() => onAssignPPE(emp)}
                >
                  <Icon name="hard-hat" className="w-5 h-5 text-yellow-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonnelTable;
