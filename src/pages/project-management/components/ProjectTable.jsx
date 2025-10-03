import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ProjectTable = ({ projects, onProjectSelect, onStatusUpdate, onBulkAction, onImageUpload, isUploadingImage, selectedImage }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => 
      prev?.includes(projectId) 
        ? prev?.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects?.length === projects?.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects?.map(p => p?.id));
    }
  };

  const toggleRowExpansion = (projectId) => {
    setExpandedRows(prev => 
      prev?.includes(projectId)
        ? prev?.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'review': 'bg-purple-100 text-purple-800',
      'completed': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors?.[priority] || 'text-gray-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const sortedProjects = [...projects]?.sort((a, b) => {
    if (sortConfig?.key) {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      
      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const handleImageUpload = async (project) => {
    try {
      // Create file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = false;
      
      // Handle file selection
      fileInput.onchange = async (event) => {
        const file = event?.target?.files?.[0];
        
        if (file) {
          // Validate file type
          if (!file?.type?.startsWith('image/')) {
            alert('Por favor seleccione un archivo de imagen válido');
            return;
          }
          
          // Validate file size (5MB limit)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file?.size > maxSize) {
            alert('El archivo es demasiado grande. El tamaño máximo es 5MB');
            return;
          }
          
          // Show success notification with project context
          alert(`Imagen "${file?.name}" cargada exitosamente para el proyecto "${project?.name}"\n\nTamaño: ${(file?.size / 1024 / 1024)?.toFixed(2)} MB\nTipo: ${file?.type}`);
          
          // Call parent handler if needed
          if (onImageUpload) {
            onImageUpload(project, file);
          }
        }
      };
      
      // Trigger file picker
      fileInput?.click();
      
    } catch (error) {
      console.error('Error al seleccionar imagen para proyecto:', project?.code, error);
      alert('Error al seleccionar la imagen. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header Actions */}
      {selectedProjects?.length > 0 && (
        <div className="bg-primary/5 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedProjects?.length} proyecto(s) seleccionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                onClick={() => onBulkAction('edit', selectedProjects)}
              >
                Editar Estado
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="FileText"
                iconPosition="left"
                onClick={() => onBulkAction('export', selectedProjects)}
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Mail"
                iconPosition="left"
                onClick={() => onBulkAction('notify', selectedProjects)}
              >
                Notificar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedProjects?.length === projects?.length}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('code')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Código</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Proyecto</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Cliente</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Estado</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Prioridad</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('budget')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Presupuesto</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('startDate')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Fecha Inicio</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="w-20 p-4 font-medium text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects?.map((project) => (
              <React.Fragment key={project?.id}>
                <tr className="border-b border-border hover:bg-muted/30 transition-smooth">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProjects?.includes(project?.id)}
                      onChange={() => handleSelectProject(project?.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-primary">{project?.code}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={project?.image}
                        alt={project?.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground">{project?.name}</div>
                        <div className="text-sm text-muted-foreground">{project?.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{project?.client?.name}</div>
                      <div className="text-sm text-muted-foreground">{project?.client?.contact}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status)}`}>
                      {project?.statusLabel}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Icon 
                        name="AlertCircle" 
                        size={16} 
                        className={getPriorityColor(project?.priority)}
                      />
                      <span className="text-sm text-foreground">{project?.priorityLabel}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-foreground font-medium">{formatCurrency(project?.budget)}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{formatDate(project?.startDate)}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(project?.id)}
                        title="Ver detalles"
                      >
                        <Icon 
                          name={expandedRows?.includes(project?.id) ? 'ChevronUp' : 'ChevronDown'} 
                          size={16} 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/project-detail-gallery/${project?.id}`)}
                        title="Ver galería de imágenes"
                      >
                        <Icon name="Image" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleImageUpload(project)}
                        title="Subir imagen"
                        disabled={isUploadingImage}
                      >
                        <Icon name={isUploadingImage ? "Loader2" : "Upload"} size={16} className={isUploadingImage ? "animate-spin" : ""} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onProjectSelect(project)}
                        title="Editar proyecto"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row Details */}
                {expandedRows?.includes(project?.id) && (
                  <tr className="bg-muted/20">
                    <td colSpan="9" className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Detalles del Proyecto</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Departamento:</span>
                              <span className="text-foreground">{project?.department}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fecha Fin:</span>
                              <span className="text-foreground">{formatDate(project?.endDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ubicación:</span>
                              <span className="text-foreground">{project?.location}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Personal Asignado</h4>
                          <div className="space-y-2">
                            {project?.assignedPersonnel?.map((person, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                  <Icon name="User" size={12} color="white" />
                                </div>
                                <span className="text-sm text-foreground">{person?.name}</span>
                                <span className="text-xs text-muted-foreground">({person?.role})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Órdenes de Trabajo</h4>
                          <div className="space-y-2">
                            {project?.workOrders?.map((order, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-foreground">{order?.code}</span>
                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order?.status)}`}>
                                  {order?.statusLabel}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Acciones Rápidas</h4>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="Image"
                              iconPosition="left"
                              onClick={() => navigate(`/project-gallery-viewer/${project?.id}`)}
                              className="w-full justify-start"
                            >
                              Ver Galería
                            </Button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card Layout */}
      <div className="lg:hidden">
        {sortedProjects?.map((project) => (
          <div key={project?.id} className="border-b border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedProjects?.includes(project?.id)}
                  onChange={() => handleSelectProject(project?.id)}
                  className="rounded border-border"
                />
                <Image
                  src={project?.image}
                  alt={project?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <div className="font-medium text-foreground">{project?.name}</div>
                  <div className="text-sm text-muted-foreground">{project?.code}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleRowExpansion(project?.id)}
              >
                <Icon 
                  name={expandedRows?.includes(project?.id) ? 'ChevronUp' : 'ChevronDown'} 
                  size={16} 
                />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div className="text-sm text-foreground">{project?.client?.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Presupuesto</div>
                <div className="text-sm text-foreground font-medium">{formatCurrency(project?.budget)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status)}`}>
                {project?.statusLabel}
              </span>
            </div>

            {expandedRows?.includes(project?.id) && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Personal Asignado</div>
                    <div className="flex flex-wrap gap-2">
                      {project?.assignedPersonnel?.map((person, index) => (
                        <div key={index} className="flex items-center space-x-1 bg-muted px-2 py-1 rounded">
                          <Icon name="User" size={12} />
                          <span className="text-xs text-foreground">{person?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTable;