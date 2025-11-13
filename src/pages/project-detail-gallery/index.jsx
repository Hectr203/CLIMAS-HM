import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ImageUploadPanel from './components/ImageUploadPanel';
import ImageGallery from './components/ImageGallery';
import ProjectInfoPanel from './components/ProjectInfoPanel';

const ProjectDetailGallery = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState('gallery');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  // Mock project data - in a real app, this would come from an API
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
    }
  ];

  // Mock images data - in a real app, this would come from an API
  const mockImages = [
    {
      id: 'img1',
      projectId: '1',
      name: 'Instalación inicial del sistema',
      src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
      category: 'installation',
      description: 'Vista general de la instalación del sistema HVAC en la torre corporativa',
      timestamp: '2024-01-20T10:30:00Z'
    },
    {
      id: 'img2',
      projectId: '1',
      name: 'Pruebas de funcionamiento',
      src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
      category: 'testing',
      description: 'Verificación de las conexiones y funcionamiento del sistema',
      timestamp: '2024-02-15T14:20:00Z'
    },
    {
      id: 'img3',
      projectId: '1',
      name: 'Control de calidad',
      src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      category: 'quality-control',
      description: 'Inspección de calidad de los componentes instalados',
      timestamp: '2024-03-01T09:15:00Z'
    },
    {
      id: 'img4',
      projectId: '2',
      name: 'Mantenimiento preventivo',
      src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      category: 'general',
      description: 'Tareas de mantenimiento preventivo del sistema industrial',
      timestamp: '2024-02-10T11:45:00Z'
    }
  ];

  useEffect(() => {
    const loadProjectData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundProject = mockProjects?.find(p => p?.id === projectId);
        if (!foundProject) {
          navigate('/proyectos');
          return;
        }
        
        setProject(foundProject);
        
        // Load images for this project
        const projectImages = mockImages?.filter(img => img?.projectId === projectId);
        setImages(projectImages);
        
      } catch (error) {
        console.error('Error loading project data:', error);
        navigate('/proyectos');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId, navigate]);

  const handleImagesUploaded = async (newImages) => {
    setIsUploading(true);
    
    try {
      // Simulate API upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new images to the gallery
      const uploadedImages = newImages?.map((img, index) => ({
        id: `uploaded-${Date.now()}-${index}`,
        projectId,
        name: img?.name,
        src: img?.file ? URL.createObjectURL(img?.file) : img?.src,
        category: img?.category,
        description: img?.description,
        timestamp: img?.timestamp
      }));
      
      setImages(prev => [...uploadedImages, ...prev]);
      
      // Switch to gallery view after upload
      setActiveTab('gallery');
      
      console.log(`${uploadedImages?.length} imágenes subidas exitosamente para el proyecto ${project?.code}`);
      
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      // Simulate API delete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setImages(prev => prev?.filter(img => img?.id !== imageId));
      console.log('Imagen eliminada exitosamente');
      
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  const handleUpdateImage = async (imageId, updates) => {
    try {
      // Simulate API update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setImages(prev => prev?.map(img => 
        img?.id === imageId ? { ...img, ...updates } : img
      ));
      
      console.log('Imagen actualizada exitosamente');
      
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  };

  const tabs = [
    { id: 'gallery', label: 'Galería de Imágenes', icon: 'Image', count: images?.length },
    { id: 'upload', label: 'Subir Imágenes', icon: 'Upload' },
    { id: 'project', label: 'Info del Proyecto', icon: 'Info' }
  ];

  const breadcrumbItems = [
    { label: 'Gestión de Proyectos', href: '/proyectos' },
    { label: project?.name || 'Proyecto', href: '#' },
    { label: 'Galería', href: '#' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
          <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando proyecto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />
        
        <div className="">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/proyectos')}
                  >
                    <Icon name="ArrowLeft" size={20} />
                  </Button>
                  <h1 className="text-3xl font-bold text-foreground">
                    {project?.name}
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Documentación visual y gestión de imágenes del proyecto
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <div className="text-sm text-muted-foreground">
                  {images?.length} imagen{images?.length !== 1 ? 'es' : ''}
                </div>
                <Button
                  onClick={() => setActiveTab('upload')}
                  iconName="Plus"
                  iconPosition="left"
                  disabled={isUploading}
                >
                  {isUploading ? 'Subiendo...' : 'Agregar Imágenes'}
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-8">
              <div className="flex space-x-8">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span className="font-medium">{tab?.label}</span>
                    {tab?.count !== undefined && (
                      <span className="bg-muted px-2 py-1 rounded-full text-xs">
                        {tab?.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'gallery' && (
                <ImageGallery
                  images={images}
                  projectInfo={project}
                  onDeleteImage={handleDeleteImage}
                  onUpdateImage={handleUpdateImage}
                />
              )}

              {activeTab === 'upload' && (
                <ImageUploadPanel
                  projectId={projectId}
                  onImagesUploaded={handleImagesUploaded}
                  isUploading={isUploading}
                />
              )}

              {activeTab === 'project' && (
                <ProjectInfoPanel project={project} />
              )}
            </div>

            {/* Quick Stats */}
            {activeTab === 'gallery' && images?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Estadísticas de la Galería</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Image" size={20} className="text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">{images?.length}</div>
                        <div className="text-sm text-muted-foreground">Total de Imágenes</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Tag" size={20} className="text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {[...new Set(images?.map(img => img?.category))]?.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Categorías</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Calendar" size={20} className="text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {images?.length > 0 
                            ? Math.ceil((new Date() - new Date(Math.min(...images.map(img => new Date(img?.timestamp))))) / (1000 * 60 * 60 * 24))
                            : 0
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Días de Documentación</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="TrendingUp" size={20} className="text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {images?.filter(img => 
                            new Date(img?.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          )?.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Esta Semana</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailGallery;