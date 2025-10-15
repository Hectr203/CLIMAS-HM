import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import ProjectFilters from './components/ProjectFilters';
import ProjectTable from './components/ProjectTable';
import ProjectStats from './components/ProjectStats';
import ProjectTimeline from './components/ProjectTimeline';
import ProjectQuotations from './components/ProjectQuotations';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import useProyect from '../../hooks/useProyect';

const ProjectManagement = () => {
  const {
    proyectos: projects,
    loading: isLoading,
    error,
    getProyectos,
    getProyectoById,
    createProyecto,
    updateProyecto,
    deleteProyecto
  } = useProyect();

  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeView, setActiveView] = useState('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    getProyectos();
  }, []);

  // Actualizar filteredProjects cuando cambien los projects
  useEffect(() => {
    if (projects && projects.length > 0) {
      setFilteredProjects(projects);
    }
  }, [projects]);

  const handleFiltersChange = (filters) => {
    let filtered = [...projects];

    // Search filter - buscar en código y nombre de proyecto
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(project => {
        const name = (project?.nombreProyecto || '').toLowerCase();
        const code = (project?.codigo || '').toLowerCase();
        return name.includes(searchTerm) || code.includes(searchTerm);
      });
    }

    // Department filter - comparar con los valores reales del backend
    if (filters?.department) {
      const deptMap = {
        'sales': 'Ventas',
        'engineering': 'Ingeniería',
        'installation': 'Instalación',
        'maintenance': 'Mantenimiento',
        'administration': 'Administración'
      };

      const targetDept = deptMap[filters.department] || filters.department;
      filtered = filtered.filter(project => {
        const dept = project?.departamento || '';
        return dept === targetDept;
      });
    }

    // Priority filter - comparar con valores del backend
    if (filters?.priority) {
      const priorityMap = {
        'low': 'Baja',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
      };

      const targetPriority = priorityMap[filters.priority] || filters.priority;
      filtered = filtered.filter(project => {
        const priority = project?.prioridad || '';
        return priority === targetPriority;
      });
    }

    // Date range filter
    if (filters?.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(project => {
        const startDateStr = project?.cronograma?.fechaInicio;
        if (!startDateStr) return false;

        const startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) return false;

        switch (filters.dateRange) {
          case 'today':
            return startDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return startDate >= weekAgo && startDate <= now;
          case 'month':
            return startDate.getMonth() === now.getMonth() &&
              startDate.getFullYear() === now.getFullYear();
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            const projectQuarter = Math.floor(startDate.getMonth() / 3);
            return projectQuarter === quarter &&
              startDate.getFullYear() === now.getFullYear();
          case 'year':
            return startDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Budget filters
    if (filters?.minBudget) {
      const minBudget = Number(filters.minBudget);
      filtered = filtered.filter(project => {
        const budget = project?.totalPresupuesto || 0;
        return budget >= minBudget;
      });
    }

    if (filters?.maxBudget) {
      const maxBudget = Number(filters.maxBudget);
      filtered = filtered.filter(project => {
        const budget = project?.totalPresupuesto || 0;
        return budget <= maxBudget;
      });
    }

    // Start date filter
    if (filters?.startDate) {
      const filterStartDate = new Date(filters.startDate);
      filtered = filtered.filter(project => {
        const startDateStr = project?.cronograma?.fechaInicio;
        if (!startDateStr) return false;
        const projectStartDate = new Date(startDateStr);
        return projectStartDate >= filterStartDate;
      });
    }

    // End date filter
    if (filters?.endDate) {
      const filterEndDate = new Date(filters.endDate);
      filtered = filtered.filter(project => {
        const endDateStr = project?.cronograma?.fechaFin;
        if (!endDateStr) return false;
        const projectEndDate = new Date(endDateStr);
        return projectEndDate <= filterEndDate;
      });
    }

    setFilteredProjects(filtered);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    console.log('Selected project:', project);
  };

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      // Actualizar en el backend
      await updateProyecto(projectId, { status: newStatus });
      console.log(`Estado del proyecto ${projectId} actualizado exitosamente`);
    } catch (error) {
      console.error('Error al actualizar estado del proyecto:', error);
      alert('Error al actualizar el estado del proyecto');
    }
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log(`Bulk action: ${action}`, selectedIds);
    // Implement bulk actions (edit, export, notify)
  };

  const handleCreateProject = async (projectData) => {
    try {
      // Crear proyecto en el backend
      await createProyecto(projectData);
      
      console.log('Proyecto creado exitosamente');
      alert('Proyecto creado exitosamente');
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      alert('Error al crear el proyecto. Por favor, inténtelo de nuevo.');
    }
  };

  const handleExport = async () => {
    try {
      // Create CSV content  
      const csvHeaders = ['Código', 'Nombre', 'Cliente', 'Estado', 'Prioridad', 'Presupuesto'];
      const csvRows = projects?.map(project => [
        project?.codigo || '',
        project?.nombreProyecto || '',
        project?.cliente?.nombre || project?.cliente || '',
        project?.estado || '',
        project?.prioridad || '',
        `$${project?.totalPresupuesto?.toLocaleString('es-MX') || '0'}`
      ]);

      const csvContent = [
        csvHeaders?.join(','),
        ...csvRows?.map(row => row?.map(cell => `"${cell}"`)?.join(','))
      ]?.join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proyectos-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Proyectos exportados exitosamente');
    } catch (error) {
      console.error('Error al exportar proyectos:', error);
    }
  };

  const handleViewProject = async (project) => {
    try {
      // Obtener detalles completos del proyecto
      const fullProject = await getProyectoById(project?.id);
      
      alert(`Ver detalles del proyecto: ${fullProject?.nombreProyecto || fullProject?.codigo}\n\nCliente: ${fullProject?.cliente?.nombre || fullProject?.cliente || ''}\nEstado: ${fullProject?.estado || ''}`);
    } catch (error) {
      console.error('Error al obtener detalles del proyecto:', error);
      alert('Error al cargar los detalles del proyecto');
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      // Actualizar en el backend
      await updateProyecto(updatedProject?.id, updatedProject);

      console.log(`Proyecto ${updatedProject?.codigo} actualizado exitosamente`);
      alert('Proyecto actualizado exitosamente');
      setSelectedProject(null);
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      alert('Error al actualizar el proyecto. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el proyecto "${project?.nombreProyecto || project?.codigo}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        // Eliminar en el backend
        await deleteProyecto(project?.id);
        
        console.log(`Proyecto ${project?.codigo} eliminado exitosamente`);
        alert('Proyecto eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        alert('Error al eliminar el proyecto. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const handleImageUpload = async () => {
    try {
      setIsUploadingImage(true);

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
            setIsUploadingImage(false);
            return;
          }

          // Validate file size (5MB limit)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file?.size > maxSize) {
            alert('El archivo es demasiado grande. El tamaño máximo es 5MB');
            setIsUploadingImage(false);
            return;
          }

          // Create file preview
          const reader = new FileReader();
          reader.onload = (e) => {
            const imagePreview = {
              file: file,
              name: file?.name,
              size: file?.size,
              type: file?.type,
              url: e?.target?.result,
              lastModified: file?.lastModified
            };

            setSelectedImage(imagePreview);
            console.log('Imagen seleccionada:', imagePreview);

            // Show success notification
            alert(`Imagen "${file?.name}" cargada exitosamente\n\nTamaño: ${(file?.size / 1024 / 1024)?.toFixed(2)} MB\nTipo: ${file?.type}`);
          };

          reader?.readAsDataURL(file);
        }

        setIsUploadingImage(false);
      };

      // Trigger file picker
      fileInput?.click();

    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      alert('Error al seleccionar la imagen. Por favor, inténtelo de nuevo.');
      setIsUploadingImage(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    console.log('Imagen eliminada');
  };

  const viewOptions = [
    { value: 'table', label: 'Tabla', icon: 'Table' },
    { value: 'timeline', label: 'Cronograma', icon: 'Calendar' },
    { value: 'quotations', label: 'Cotizaciones', icon: 'FileText' },
    { value: 'stats', label: 'Estadísticas', icon: 'BarChart3' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
          <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />
          <div className="pt-16 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando proyectos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />

        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Proyectos</h1>
                <p className="text-muted-foreground">
                  Administre el ciclo completo de proyectos HVAC desde la planificación hasta el cierre
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                {/* View Toggle */}
                <div className="flex bg-muted rounded-lg p-1">
                  {viewOptions?.map((option) => (
                    <button
                      key={option?.value}
                      onClick={() => setActiveView(option?.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-smooth ${activeView === option?.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <Icon name={option?.icon} size={16} />
                      <span className="hidden sm:inline text-sm">{option?.label}</span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Nuevo Proyecto
                </Button>
              </div>
            </div>

            {/* Image Preview Section */}
            {selectedImage && (
              <div className="bg-card rounded-lg border p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-foreground">Imagen Seleccionada</h3>
                  <Button
                    onClick={handleClearImage}
                    variant="outline"
                    size="sm"
                    iconName="X"
                    iconPosition="left"
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                  <div className="flex-shrink-0">
                    <img
                      src={selectedImage?.url}
                      alt={selectedImage?.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre del archivo</p>
                        <p className="text-sm font-medium text-foreground truncate">{selectedImage?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tamaño</p>
                        <p className="text-sm font-medium text-foreground">
                          {(selectedImage?.size / 1024 / 1024)?.toFixed(2)} MB
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <p className="text-sm font-medium text-foreground">{selectedImage?.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Última modificación</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(selectedImage?.lastModified)?.toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Overview */}
            {activeView !== 'stats' && filteredProjects?.length > 0 && (
              <ProjectStats projects={filteredProjects} />
            )}

            {/* Filters */}
            {activeView === 'table' && (
              <ProjectFilters
                onFiltersChange={handleFiltersChange}
                totalProjects={projects?.length}
                filteredProjects={filteredProjects?.length}
              />
            )}

            {/* Mensaje cuando no hay proyectos en la base de datos */}
            {filteredProjects?.length === 0 && !isLoading && projects?.length === 0 && (
              <div className="text-center py-12">
                <Icon
                  name="FolderOpen"
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay proyectos disponibles
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comienza creando tu primer proyecto
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Crear Proyecto
                </Button>
              </div>
            )}

            {/* Mensaje cuando los filtros no encuentran coincidencias */}
            {filteredProjects?.length === 0 && !isLoading && projects?.length > 0 && (
              <div className="text-center py-12">
                <Icon
                  name="Filter"
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No se encuentra proyecto con tus especificaciones
                </h3>
                <p className="text-muted-foreground mb-6">
                  Intenta con otros filtros o parámetros de búsqueda
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-6">
              {activeView === 'table' && filteredProjects?.length > 0 && (
                <ProjectTable
                  projects={filteredProjects}
                  onProjectSelect={handleEditProject}
                  onStatusUpdate={handleStatusUpdate}
                  onBulkAction={handleBulkAction}
                  onImageUpload={handleImageUpload}
                  isUploadingImage={isUploadingImage}
                  selectedImage={selectedImage}
                />
              )}

              {activeView === 'timeline' && filteredProjects?.length > 0 && (
                <ProjectTimeline projects={filteredProjects} />
              )}

              {activeView === 'quotations' && filteredProjects?.length > 0 && (
                <ProjectQuotations projects={filteredProjects} />
              )}

              {activeView === 'stats' && (
                <div className="space-y-6">
                  <ProjectStats projects={filteredProjects} />
                  {filteredProjects?.length > 0 && (
                    <ProjectTimeline projects={filteredProjects} />
                  )}
                </div>
              )}
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleCreateProject}
            />

            {/* Edit Project Modal */}
            <EditProjectModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedProject(null);
              }}
              onSubmit={handleUpdateProject}
              project={selectedProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;