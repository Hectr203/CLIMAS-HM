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

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeView, setActiveView] = useState('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Mock project data
  const mockProjects = [
    {
      id: "1",
      code: "PROJ-2024-001",
      name: "Instalación HVAC Torre Corporativa",
      type: "Instalación HVAC",
      client: {
        name: "ABC Corporation",
        contact: "contacto@abccorp.com",
        type: "commercial"
      },
      status: "in-progress",
      statusLabel: "En Progreso",
      priority: "high",
      priorityLabel: "Alta",
      budget: 850000,
      startDate: "2024-01-15",
      endDate: "2024-04-30",
      progress: 65,
      department: "Ingeniería",
      location: "Ciudad de México, CDMX",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
      assignedPersonnel: [
        { name: "Carlos Martínez", role: "Ingeniero Jefe" },
        { name: "Ana Rodríguez", role: "Técnico Especialista" },
        { name: "Luis García", role: "Supervisor de Obra" }
      ],
      workOrders: [
        { code: "WO-2024-001", status: "completed", statusLabel: "Completada" },
        { code: "WO-2024-002", status: "in-progress", statusLabel: "En Progreso" },
        { code: "WO-2024-003", status: "planning", statusLabel: "Planificación" }
      ]
    },
    {
      id: "2",
      code: "PROJ-2024-002",
      name: "Mantenimiento Sistema Industrial",
      type: "Mantenimiento",
      client: {
        name: "XYZ Industries",
        contact: "servicios@xyzind.com",
        type: "industrial"
      },
      status: "completed",
      statusLabel: "Completado",
      priority: "medium",
      priorityLabel: "Media",
      budget: 320000,
      startDate: "2024-02-01",
      endDate: "2024-03-15",
      progress: 100,
      department: "Mantenimiento",
      location: "Guadalajara, JAL",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
      assignedPersonnel: [
        { name: "María López", role: "Coordinadora" },
        { name: "José Hernández", role: "Técnico" }
      ],
      workOrders: [
        { code: "WO-2024-004", status: "completed", statusLabel: "Completada" },
        { code: "WO-2024-005", status: "completed", statusLabel: "Completada" }
      ]
    },
    {
      id: "3",
      code: "PROJ-2024-003",
      name: "Actualización Sistema Residencial",
      type: "Actualización",
      client: {
        name: "Green Energy México",
        contact: "info@greenenergy.mx",
        type: "residential"
      },
      status: "on-hold",
      statusLabel: "En Pausa",
      priority: "low",
      priorityLabel: "Baja",
      budget: 180000,
      startDate: "2024-03-01",
      endDate: "2024-05-30",
      progress: 25,
      department: "Ventas",
      location: "Monterrey, NL",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      assignedPersonnel: [
        { name: "Roberto Silva", role: "Vendedor" },
        { name: "Carmen Díaz", role: "Asistente Técnico" }
      ],
      workOrders: [
        { code: "WO-2024-006", status: "on-hold", statusLabel: "En Pausa" }
      ]
    },
    {
      id: "4",
      code: "PROJ-2024-004",
      name: "Consultoría Eficiencia Energética",
      type: "Consultoría",
      client: {
        name: "Tech Solutions SA",
        contact: "proyectos@techsol.com",
        type: "commercial"
      },
      status: "planning",
      statusLabel: "Planificación",
      priority: "urgent",
      priorityLabel: "Urgente",
      budget: 450000,
      startDate: "2024-04-01",
      endDate: "2024-07-15",
      progress: 10,
      department: "Administración",
      location: "Puebla, PUE",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      assignedPersonnel: [
        { name: "Fernando Ruiz", role: "Consultor Senior" },
        { name: "Patricia Morales", role: "Analista" },
        { name: "Diego Vega", role: "Coordinador" }
      ],
      workOrders: [
        { code: "WO-2024-007", status: "planning", statusLabel: "Planificación" }
      ]
    },
    {
      id: "5",
      code: "PROJ-2024-005",
      name: "Reparación Sistema Comercial",
      type: "Reparación",
      client: {
        name: "Urban Development Group",
        contact: "mantenimiento@udgroup.mx",
        type: "commercial"
      },
      status: "review",
      statusLabel: "En Revisión",
      priority: "high",
      priorityLabel: "Alta",
      budget: 275000,
      startDate: "2024-03-15",
      endDate: "2024-04-15",
      progress: 85,
      department: "Mantenimiento",
      location: "Tijuana, BC",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
      assignedPersonnel: [
        { name: "Alejandro Torres", role: "Técnico Especialista" },
        { name: "Sofía Ramírez", role: "Supervisora" }
      ],
      workOrders: [
        { code: "WO-2024-008", status: "completed", statusLabel: "Completada" },
        { code: "WO-2024-009", status: "review", statusLabel: "En Revisión" }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading
    const loadProjects = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      setIsLoading(false);
    };

    loadProjects();
  }, []);

  const handleFiltersChange = (filters) => {
    let filtered = [...projects];

    // Search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(project => 
        project?.name?.toLowerCase()?.includes(searchTerm) ||
        project?.code?.toLowerCase()?.includes(searchTerm) ||
        project?.client?.name?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Status filter
    if (filters?.status) {
      filtered = filtered?.filter(project => project?.status === filters?.status);
    }

    // Department filter
    if (filters?.department) {
      filtered = filtered?.filter(project => 
        project?.department?.toLowerCase()?.includes(filters?.department?.toLowerCase())
      );
    }

    // Client type filter
    if (filters?.clientType) {
      filtered = filtered?.filter(project => project?.client?.type === filters?.clientType);
    }

    // Priority filter
    if (filters?.priority) {
      filtered = filtered?.filter(project => project?.priority === filters?.priority);
    }

    setFilteredProjects(filtered);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // Navigate to project details or open edit modal
    console.log('Selected project:', project);
  };

  const handleStatusUpdate = (projectId, newStatus) => {
    setProjects(prev => prev?.map(project => 
      project?.id === projectId 
        ? { ...project, status: newStatus }
        : project
    ));
    setFilteredProjects(prev => prev?.map(project => 
      project?.id === projectId 
        ? { ...project, status: newStatus }
        : project
    ));
  };

  const handleBulkAction = (action, selectedIds) => {
    console.log(`Bulk action: ${action}`, selectedIds);
    // Implement bulk actions (edit, export, notify)
  };

  const handleCreateProject = (projectData) => {
    const newProject = {
      ...projectData,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
      client: {
        name: projectData?.client,
        contact: "contacto@cliente.com",
        type: "commercial"
      },
      statusLabel: "Planificación",
      priorityLabel: projectData?.priority === 'low' ? 'Baja' : 
                    projectData?.priority === 'medium' ? 'Media' :
                    projectData?.priority === 'high' ? 'Alta' : 'Urgente',
      assignedPersonnel: projectData?.assignedPersonnel?.map(id => ({
        name: id?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase()),
        role: "Asignado"
      })),
      workOrders: []
    };

    setProjects(prev => [newProject, ...prev]);
    setFilteredProjects(prev => [newProject, ...prev]);
  };

  const handleExport = async () => {
    try {
      // Create CSV content  
      const csvHeaders = ['Código', 'Nombre', 'Cliente', 'Estado', 'Prioridad', 'Presupuesto', 'Gastado'];
      const csvRows = projects?.map(project => [
        project?.code,
        project?.name,
        project?.client?.name || project?.client,
        project?.statusLabel || project?.status,
        project?.priorityLabel || project?.priority,
        `$${project?.budget?.toLocaleString('es-MX') || '0'}`,
        `$${project?.spent?.toLocaleString('es-MX') || '0'}`
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

  const handleViewProject = (project) => {
    // Create a detailed project view modal or navigate to project details
    alert(`Ver detalles del proyecto: ${project?.name || project?.code}\n\nCliente: ${project?.client?.name || project?.client}\nEstado: ${project?.statusLabel || project?.status}`);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      // Update in both projects arrays
      setProjects(prevProjects => 
        prevProjects?.map(p => 
          p?.id === updatedProject?.id ? updatedProject : p
        )
      );
      setFilteredProjects(prevProjects => 
        prevProjects?.map(p => 
          p?.id === updatedProject?.id ? updatedProject : p
        )
      );
      
      console.log(`Proyecto ${updatedProject?.code} actualizado exitosamente`);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = (project) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el proyecto "${project?.name || project?.code}"?\n\nEsta acción no se puede deshacer.`)) {
      setProjects(prevProjects => 
        prevProjects?.filter(p => p?.id !== project?.id)
      );
      console.log(`Proyecto ${project?.code} eliminado exitosamente`);
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
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-smooth ${
                        activeView === option?.value
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
            {activeView !== 'stats' && (
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

            {/* Main Content */}
            <div className="space-y-6">
              {activeView === 'table' && (
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

              {activeView === 'timeline' && (
                <ProjectTimeline projects={filteredProjects} />
              )}

              {activeView === 'quotations' && (
                <ProjectQuotations projects={filteredProjects} />
              )}

              {activeView === 'stats' && (
                <div className="space-y-6">
                  <ProjectStats projects={filteredProjects} />
                  <ProjectTimeline projects={filteredProjects} />
                </div>
              )}
            </div>

            {/* Empty State */}
            {filteredProjects?.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Icon name="FolderOpen" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron proyectos</h3>
                <p className="text-muted-foreground mb-6">
                  No hay proyectos que coincidan con los filtros seleccionados
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Crear Primer Proyecto
                </Button>
              </div>
            )}

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