import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PersonnelTable = ({ onViewProfile, onEditPersonnel, onAssignPPE }) => {
  const [personnel, setPersonnel] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // ✅ Fetch para traer empleados
  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const response = await fetch('/api/empleados'); // proxy ya configurado
        if (!response.ok) throw new Error('Error al obtener empleados');
        const data = await response.json();
        setPersonnel(data);
      } catch (error) {
        console.error('❌ Error cargando empleados:', error);
      }
    };

    fetchPersonnel();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPersonnel = useMemo(() => {
    const sortableItems = [...personnel];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [personnel, sortConfig]);

  return (
    <div className="w-full overflow-x-auto bg-card rounded-lg border border-border shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50">
          <tr>
            <th
              onClick={() => handleSort('name')}
              className="px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
            >
              Nombre
            </th>
            <th
              onClick={() => handleSort('employeeId')}
              className="px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
            >
              ID Empleado
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Departamento</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Puesto</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedPersonnel.map((employee) => (
            <tr key={employee.id} className="border-t border-border hover:bg-muted/30 transition-smooth">
              <td className="px-4 py-3 flex items-center space-x-3">
                <Image
                  src={employee.avatar || '/default-avatar.png'}
                  alt={employee.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-foreground">{employee.name}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{employee.employeeId}</td>
              <td className="px-4 py-3 text-muted-foreground">{employee.department}</td>
              <td className="px-4 py-3 text-muted-foreground">{employee.position}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'Activo'
                      ? 'bg-green-100 text-green-700'
                      : employee.status === 'Inactivo'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {employee.status}
                </span>
              </td>
              <td className="px-4 py-3 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Eye"
                  iconSize={16}
                  onClick={() => onViewProfile(employee)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Edit"
                  iconSize={16}
                  onClick={() => onEditPersonnel(employee)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="Shield"
                  iconSize={16}
                  onClick={() => onAssignPPE(employee)}
                />
              </td>
            </tr>
          ))}

          {/* Si no hay empleados */}
          {sortedPersonnel.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted-foreground py-6">
                No hay empleados registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PersonnelTable;
