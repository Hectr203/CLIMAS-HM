import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectStatusTable = () => {
  const [sortField, setSortField] = useState('priority');
  const [sortDirection, setSortDirection] = useState('desc');
  const navigate = useNavigate();

  const projects = [
    {
      id: 'PRJ-2024-001',
      client: 'Corporativo Plaza Central',
      phase: 'Instalación',
      department: 'Taller',
      priority: 'Alta',
      status: 'En Progreso',
      dueDate: '15/10/2024',
      manager: 'Carlos Mendoza'
    },
    {
      id: 'PRJ-2024-002',
      client: 'Hotel Marriott Guadalajara',
      phase: 'Mantenimiento',
      department: 'Proyectos',
      priority: 'Media',
      status: 'En Progreso',
      dueDate: '22/10/2024',
      manager: 'Ana García'
    },
    {
      id: 'PRJ-2024-003',
      client: 'Centro Comercial Galerías',
      phase: 'Diseño',
      department: 'Ventas',
      priority: 'Baja',
      status: 'Revisión',
      dueDate: '08/10/2024',
      manager: 'Roberto Silva'
    },
    {
      id: 'PRJ-2024-004',
      client: 'Oficinas Corporativas BBVA',
      phase: 'Instalación',
      department: 'Taller',
      priority: 'Alta',
      status: 'En Progreso',
      dueDate: '30/10/2024',
      manager: 'María López'
    },
    {
      id: 'PRJ-2024-005',
      client: 'Residencial Los Pinos',
      phase: 'Cierre',
      department: 'Administración',
      priority: 'Media',
      status: 'Finalización',
      dueDate: '05/10/2024',
      manager: 'Diego Ramírez'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-error text-error-foreground';
      case 'Media': return 'bg-warning text-warning-foreground';
      case 'Baja': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En Progreso': return 'bg-primary text-primary-foreground';
      case 'Revisión': return 'bg-warning text-warning-foreground';
      case 'Finalización': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department) {
      case 'Taller': return 'Wrench';
      case 'Proyectos': return 'FolderOpen';
      case 'Ventas': return 'Users';
      case 'Administración': return 'FileText';
      default: return 'Building2';
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/project-detail-gallery/${projectId}`);
  };

  const sortedProjects = [...projects]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Estado de Proyectos</h3>
            <p className="text-sm text-muted-foreground">Seguimiento en tiempo real de proyectos activos</p>
          </div>
          <Button variant="outline" iconName="Filter" iconPosition="left">
            Filtrar
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button 
                  onClick={() => handleSort('id')}
                  className="flex items-center space-x-2 hover:text-foreground transition-smooth"
                >
                  <span>Proyecto</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button 
                  onClick={() => handleSort('client')}
                  className="flex items-center space-x-2 hover:text-foreground transition-smooth"
                >
                  <span>Cliente</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Fase</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Departamento</th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <button 
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-2 hover:text-foreground transition-smooth"
                >
                  <span>Prioridad</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects?.map((project) => (
              <tr key={project?.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-foreground">{project?.id}</div>
                    <div className="text-sm text-muted-foreground">{project?.manager}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-foreground">{project?.client}</div>
                  <div className="text-sm text-muted-foreground">Vence: {project?.dueDate}</div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{project?.phase}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name={getDepartmentIcon(project?.department)} size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{project?.department}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project?.priority)}`}>
                    {project?.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project?.status)}`}>
                    {project?.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewProject(project?.id)}
                      title="Ir al proyecto"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectStatusTable;