import React from 'react';
import Icon from '../../../components/AppIcon';

const UserTable = ({ users, onEditUser }) => (
  <div className="bg-card border border-border rounded-lg overflow-x-auto">
    <table className="min-w-full divide-y divide-border">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-normal">Nombre</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Correo</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dirección</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-smooth">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                {user.imagen && (
                  <img className="h-10 w-10 rounded-full mr-3" src={user.imagen} alt={user.nombre} />
                )}
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.nombre}</div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.rol}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.contacto || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.direccion || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                onClick={() => onEditUser(user)} 
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label={`Editar usuario ${user.nombre}`}
                title="Editar usuario"
              >
                <Icon name="Pencil" className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default UserTable;
