import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';


import ProjectCard from './components/ProjectCard';
import DocumentUploadPanel from './components/DocumentUploadPanel';
import QuotationPanel from './components/QuotationPanel';
import ValidationPanel from './components/ValidationPanel';

const ProjectWorkflowManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Workflow stages following the diagram
  const workflowStages = [
    {
      id: 'information-reception',
      name: 'Recepción de Información',
      description: 'Catálogos, planos, ubicación de obra o requerimientos',
      color: 'bg-blue-500',
      icon: 'FileText'
    },
    {
      id: 'document-organization',
      name: 'Organización de Documentos',
      description: 'Creación de carpetas digitales y organización de archivos',
      color: 'bg-indigo-500',
      icon: 'FolderOpen'
    },
    {
      id: 'quotation-development',
      name: 'Elaboración de Cotización',
      description: 'Desarrollo inicial de cotización con porcentajes y condiciones',
      color: 'bg-purple-500',
      icon: 'Calculator'
    },
    {
      id: 'validation',
      name: 'Validación',
      description: 'Validación por Ventas/Martín',
      color: 'bg-yellow-500',
      icon: 'CheckCircle'
    },
    {
      id: 'client-approval',
      name: 'Aprobación Cliente',
      description: 'Envío y aprobación de propuesta por cliente',
      color: 'bg-green-500',
      icon: 'UserCheck'
    },
    {
      id: 'provider-search',
      name: 'Búsqueda de Proveedores',
      description: 'Búsqueda en zona de obra y comunicación a Administración',
      color: 'bg-orange-500',
      icon: 'Users'
    },
    {
      id: 'work-execution',
      name: 'Ejecución de Obra',
      description: 'Seguimiento de trabajos y control de avances',
      color: 'bg-red-500',
      icon: 'Wrench'
    },
    {
      id: 'project-closure',
      name: 'Cierre de Proyecto',
      description: 'Documentación final y continuidad de garantía',
      color: 'bg-gray-500',
      icon: 'Archive'
    }
  ];

  // Mock project data following the workflow
  const mockProjects = [
    {
      id: "1",
      code: "PROJ-WF-001",
      name: "Instalación HVAC Torre Corporativa",
      client: "ABC Corporation",
      type: "Instalación HVAC",
      stage: "information-reception",
      priority: "high",
      assignedPersonnel: ["Carlos Martínez", "Ana Rodríguez"],
      deadline: "2024-04-30",
      budget: 850000,
      progress: 15,
      hasClientCatalog: true,
      documents: [
        { name: "Planos_Arquitectonicos.pdf", type: "plan", status: "uploaded" },
        { name: "Catalogo_Cliente.pdf", type: "catalog", status: "uploaded" }
      ],
      notes: "Cliente proporcionó catálogo completo y planos actualizados"
    },
    {
      id: "2",
      code: "PROJ-WF-002",
      name: "Mantenimiento Sistema Industrial",
      client: "XYZ Industries",
      type: "Mantenimiento",
      stage: "document-organization",
      priority: "medium",
      assignedPersonnel: ["María López"],
      deadline: "2024-03-15",
      budget: 320000,
      progress: 35,
      hasClientCatalog: false,
      documents: [
        { name: "Requerimientos.pdf", type: "requirement", status: "uploaded" },
        { name: "Ubicacion_Obra.pdf", type: "location", status: "uploaded" }
      ],
      notes: "Organización manual de documentos en proceso"
    },
    {
      id: "3",
      code: "PROJ-WF-003",
      name: "Actualización Sistema Residencial",
      client: "Green Energy México",
      type: "Actualización",
      stage: "quotation-development",
      priority: "low",
      assignedPersonnel: ["Roberto Silva", "Carmen Díaz"],
      deadline: "2024-05-30",
      budget: 180000,
      progress: 50,
      hasClientCatalog: false,
      documents: [
        { name: "Planos_Obra.pdf", type: "plan", status: "uploaded" }
      ],
      quotation: {
        installationPercentage: 25,
        parts: 15,
        travel: 8,
        personnel: 12,
        advance: 30,
        progress: 70,
        warranty: "12 meses"
      },
      notes: "Identificación de materiales desde planos en desarrollo"
    },
    {
      id: "4",
      code: "PROJ-WF-004",
      name: "Consultoría Eficiencia Energética",
      client: "Tech Solutions SA",
      type: "Consultoría",
      stage: "validation",
      priority: "urgent",
      assignedPersonnel: ["Fernando Ruiz", "Patricia Morales"],
      deadline: "2024-07-15",
      budget: 450000,
      progress: 75,
      hasClientCatalog: true,
      quotation: {
        installationPercentage: 30,
        parts: 20,
        travel: 10,
        personnel: 15,
        advance: 30,
        progress: 70,
        warranty: "24 meses"
      },
      validation: {
        status: "pending",
        reviewer: "Ventas/Martín",
        submittedAt: "2024-03-25"
      },
      notes: "Cotización lista para validación de Ventas/Martín"
    },
    {
      id: "5",
      code: "PROJ-WF-005",
      name: "Reparación Sistema Comercial",
      client: "Urban Development Group",
      type: "Reparación",
      stage: "client-approval",
      priority: "high",
      assignedPersonnel: ["Alejandro Torres", "Sofía Ramírez"],
      deadline: "2024-04-15",
      budget: 275000,
      progress: 85,
      hasClientCatalog: false,
      quotation: {
        installationPercentage: 20,
        parts: 25,
        travel: 5,
        personnel: 10,
        advance: 30,
        progress: 70,
        warranty: "18 meses"
      },
      approval: {
        status: "sent",
        method: "email",
        sentAt: "2024-03-20",
        adjustments: 2
      },
      notes: "Propuesta enviada por correo, pendiente aprobación cliente"
    }
  ];

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
      setIsLoading(false);
    };

    loadProjects();
  }, []);

  const handleStageTransition = (projectId, newStage) => {
    setProjects(prev => prev?.map(project => 
      project?.id === projectId 
        ? { ...project, stage: newStage, progress: Math.min(project?.progress + 10, 100) }
        : project
    ));
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowControls(true);
  };

  const handleDocumentUpload = (projectId, document) => {
    setProjects(prev => prev?.map(project => 
      project?.id === projectId 
        ? { 
            ...project, 
            documents: [...(project?.documents || []), document]
          }
        : project
    ));
  };

  const handleQuotationUpdate = (projectId, quotationData) => {
    setProjects(prev => prev?.map(project => 
      project?.id === projectId 
        ? { ...project, quotation: quotationData }
        : project
    ));
  };

  const handleValidationSubmit = (projectId, validationData) => {
    setProjects(prev => prev?.map(project => 
      project?.id === projectId 
        ? { ...project, validation: validationData }
        : project
    ));
  };

  const getProjectsByStage = (stageId) => {
    return projects?.filter(project => project?.stage === stageId) || [];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando flujo de trabajo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Flujo de Trabajo - Área de Proyectos</h1>
            <p className="text-muted-foreground">
              Gestión completa del ciclo de vida de proyectos desde recepción hasta cierre
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button
              variant="outline"
              iconName="RefreshCw"
              iconPosition="left"
              onClick={() => window.location?.reload()}
            >
              Actualizar
            </Button>
            <Button
              iconName="Plus"
              iconPosition="left"
              onClick={() => setShowControls(true)}
            >
              Nuevo Proyecto
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Workflow Board */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {workflowStages?.map((stage) => (
                <div key={stage?.id} className="bg-card rounded-lg shadow-sm border">
                  <div className={`p-4 ${stage?.color} text-white rounded-t-lg`}>
                    <div className="flex items-center space-x-2">
                      <Icon name={stage?.icon} size={20} />
                      <h3 className="font-semibold text-sm">{stage?.name}</h3>
                    </div>
                    <p className="text-xs mt-1 opacity-90">{stage?.description}</p>
                    <div className="text-xs mt-2 bg-white/20 rounded px-2 py-1 inline-block">
                      {getProjectsByStage(stage?.id)?.length} proyectos
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3 min-h-[400px]">
                    {getProjectsByStage(stage?.id)?.map((project) => (
                      <div
                        key={project?.id}
                        onClick={() => handleProjectSelect(project)}
                        className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getPriorityColor(project?.priority)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2">
                            {project?.name}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project?.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            project?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            project?.priority === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {project?.priority === 'urgent' ? 'Urgente' :
                             project?.priority === 'high' ? 'Alta' :
                             project?.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">{project?.client}</p>
                        <p className="text-xs text-muted-foreground mb-2">{project?.code}</p>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon name="Users" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {project?.assignedPersonnel?.slice(0, 2)?.join(', ')}
                            {project?.assignedPersonnel?.length > 2 && ` +${project?.assignedPersonnel?.length - 2}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(project?.deadline)?.toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-foreground">
                            {project?.progress}%
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${project?.progress}%` }}
                          ></div>
                        </div>

                        {project?.hasClientCatalog && (
                          <div className="flex items-center space-x-1 mt-2">
                            <Icon name="FileCheck" size={12} className="text-green-600" />
                            <span className="text-xs text-green-600">Catálogo cliente</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {getProjectsByStage(stage?.id)?.length === 0 && (
                      <div className="text-center py-8">
                        <Icon name="Inbox" size={32} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sin proyectos</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Controls Panel */}
          {showControls && (
            <div className="w-96 bg-card rounded-lg shadow-lg border h-fit">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Controles de Flujo</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    onClick={() => setShowControls(false)}
                  />
                </div>
              </div>
              
              <div className="p-4 space-y-6">
                {selectedProject && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{selectedProject?.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedProject?.client}</p>
                    </div>

                    {/* Document Upload */}
                    <DocumentUploadPanel
                      project={selectedProject}
                      onUpload={(document) => handleDocumentUpload(selectedProject?.id, document)}
                    />

                    {/* Quotation Builder */}
                    {(selectedProject?.stage === 'quotation-development' || selectedProject?.quotation) && (
                      <QuotationPanel
                        project={selectedProject}
                        onUpdate={(quotation) => handleQuotationUpdate(selectedProject?.id, quotation)}
                      />
                    )}

                    {/* Validation */}
                    {selectedProject?.stage === 'validation' && (
                      <ValidationPanel
                        project={selectedProject}
                        onSubmit={(validation) => handleValidationSubmit(selectedProject?.id, validation)}
                      />
                    )}

                    {/* Stage Transition */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Avanzar Etapa</label>
                      <div className="grid grid-cols-2 gap-2">
                        {workflowStages?.map((stage) => (
                          <Button
                            key={stage?.id}
                            variant={selectedProject?.stage === stage?.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStageTransition(selectedProject?.id, stage?.id)}
                            disabled={selectedProject?.stage === stage?.id}
                            className="text-xs"
                          >
                            {stage?.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="space-y-4">
            {workflowStages?.map((stage) => (
              <div key={stage?.id} className="bg-card rounded-lg shadow-sm border">
                <div className={`p-4 ${stage?.color} text-white`}>
                  <div className="flex items-center space-x-2">
                    <Icon name={stage?.icon} size={20} />
                    <h3 className="font-semibold">{stage?.name}</h3>
                    <span className="bg-white/20 rounded px-2 py-1 text-xs">
                      {getProjectsByStage(stage?.id)?.length}
                    </span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">{stage?.description}</p>
                </div>
                
                <div className="p-4">
                  {getProjectsByStage(stage?.id)?.map((project) => (
                    <ProjectCard
                      key={project?.id}
                      project={project}
                      onSelect={handleProjectSelect}
                      onStageTransition={handleStageTransition}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkflowManagement;