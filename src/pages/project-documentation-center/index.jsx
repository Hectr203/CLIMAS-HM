import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import DocumentTree from './components/DocumentTree';
import WorkflowStatus from './components/WorkflowStatus';
import QuotationWorkflow from './components/QuotationWorkflow';
import ProgressTracking from './components/ProgressTracking';
import DocumentValidation from './components/DocumentValidation';
import Input from '../../components/ui/Input';



const ProjectDocumentationCenter = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeView, setActiveView] = useState('workflow');
  const [workflowStep, setWorkflowStep] = useState('client-info');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock project data following the workflow diagram
  const mockProjects = [
    {
      id: "1",
      code: "PROJ-2024-001",
      name: "Instalación HVAC Torre Corporativa",
      client: {
        name: "ABC Corporation",
        contact: "contacto@abccorp.com",
        phone: "+52 55 1234 5678",
        address: "Av. Reforma 123, Ciudad de México"
      },
      workflowStep: "quotation-validation",
      status: "in-progress",
      statusLabel: "En Proceso",
      createdDate: "2024-01-15",
      lastUpdated: "2024-01-20",
      documents: {
        clientInfo: [
          { name: "Catálogo Cliente", type: "pdf", size: "2.5 MB", uploaded: true },
          { name: "Planos de Obra", type: "dwg", size: "8.2 MB", uploaded: true },
          { name: "Ubicación", type: "pdf", size: "1.1 MB", uploaded: true }
        ],
        quotations: [
          { name: "Cotización Inicial", type: "excel", size: "1.8 MB", uploaded: true },
          { name: "Cotización Ajustada", type: "excel", size: "1.9 MB", uploaded: false }
        ],
        contracts: [
          { name: "Contrato Principal", type: "pdf", size: "3.2 MB", uploaded: false }
        ],
        progressPhotos: [
          { name: "Avance Semana 1", type: "image", size: "12.5 MB", uploaded: true, count: 15 },
          { name: "Avance Semana 2", type: "image", size: "8.3 MB", uploaded: true, count: 10 }
        ],
        certifications: [],
        finalDocs: []
      },
      quotationData: {
        hasClientCatalog: true,
        installationPercentage: 30,
        parts: "Equipos HVAC industriales",
        travel: 5000,
        estimatedPersonnel: 8,
        advancePayment: 30,
        progressPayment: 70,
        warranty: "12 meses",
        totalAmount: 850000,
        validatedBy: null,
        clientApproved: false
      },
      progressTracking: {
        photos: [
          { id: 1, url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12", 
            timestamp: "2024-01-18 14:30", location: "Planta Baja - Área Norte", description: "Instalación ductos principales" },
          { id: 2, url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5", 
            timestamp: "2024-01-19 10:15", location: "Piso 2 - Oficinas", description: "Montaje unidades manejadoras" }
        ],
        pendingPayments: [],
        completedMilestones: ['site-preparation', 'equipment-delivery']
      }
    },
    {
      id: "2",
      code: "PROJ-2024-002",
      name: "Sistema Residencial Polanco",
      client: {
        name: "Residencial Los Pinos",
        contact: "admin@lospinos.mx",
        phone: "+52 55 9876 5432",
        address: "Polanco, Ciudad de México"
      },
      workflowStep: "provider-search",
      status: "quotation-approved",
      statusLabel: "Cotización Aprobada",
      createdDate: "2024-02-01",
      lastUpdated: "2024-02-05",
      documents: {
        clientInfo: [
          { name: "Requerimientos", type: "pdf", size: "1.2 MB", uploaded: true }
        ],
        quotations: [
          { name: "Cotización Aprobada", type: "excel", size: "2.1 MB", uploaded: true }
        ],
        contracts: [],
        progressPhotos: [],
        certifications: [],
        finalDocs: []
      },
      quotationData: {
        hasClientCatalog: false,
        installationPercentage: 25,
        parts: "Sistemas residenciales centrales",
        travel: 2500,
        estimatedPersonnel: 4,
        advancePayment: 30,
        progressPayment: 70,
        warranty: "24 meses",
        totalAmount: 320000,
        validatedBy: "Martin Rodriguez",
        clientApproved: true
      },
      progressTracking: {
        photos: [],
        pendingPayments: [],
        completedMilestones: ['quotation-approved', 'client-approval']
      }
    }
  ];

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
      setSelectedProject(mockProjects?.[0]);
      setIsLoading(false);
    };
    loadProjects();
  }, []);

  const workflowSteps = [
    { id: 'client-info', label: 'Recepción Información Cliente', icon: 'FileInput', color: 'blue' },
    { id: 'document-org', label: 'Organización Documentos', icon: 'FolderOrganize', color: 'orange' },
    { id: 'catalog-check', label: '¿Cliente da Catálogo?', icon: 'HelpCircle', color: 'yellow' },
    { id: 'quotation-dev', label: 'Elaborar Cotización', icon: 'Calculator', color: 'green' },
    { id: 'quotation-validation', label: 'Validación Cotización', icon: 'CheckSquare', color: 'purple' },
    { id: 'client-proposal', label: 'Envío Propuesta', icon: 'Send', color: 'blue' },
    { id: 'client-approval', label: 'Aprobación Cliente', icon: 'ThumbsUp', color: 'green' },
    { id: 'provider-search', label: 'Búsqueda Proveedores', icon: 'Search', color: 'orange' },
    { id: 'progress-control', label: 'Control de Avances', icon: 'Camera', color: 'blue' },
    { id: 'payment-confirmation', label: 'Confirmación Pagos', icon: 'CreditCard', color: 'green' },
    { id: 'final-documentation', label: 'Documentación Final', icon: 'FileCheck', color: 'purple' },
    { id: 'warranty-continuity', label: 'Continuidad Garantía', icon: 'Shield', color: 'blue' }
  ];

  const viewOptions = [
    { value: 'workflow', label: 'Flujo de Trabajo', icon: 'GitBranch' },
    { value: 'documents', label: 'Documentos', icon: 'FolderOpen' },
    { value: 'quotation', label: 'Cotización', icon: 'Calculator' },
    { value: 'progress', label: 'Avances', icon: 'Camera' },
    { value: 'validation', label: 'Validación', icon: 'CheckCircle' }
  ];

  const filteredProjects = projects?.filter(project =>
    project?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    project?.code?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    project?.client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setWorkflowStep(project?.workflowStep);
  };

  const handleWorkflowStepUpdate = (projectId, newStep) => {
    setProjects(prev => prev?.map(project =>
      project?.id === projectId
        ? { ...project, workflowStep: newStep, lastUpdated: new Date()?.toISOString()?.split('T')?.[0] }
        : project
    ));
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => ({ ...prev, workflowStep: newStep }));
      setWorkflowStep(newStep);
    }
  };

  const handleDocumentUpload = (projectId, category, document) => {
    setProjects(prev => prev?.map(project =>
      project?.id === projectId
        ? {
            ...project,
            documents: {
              ...project?.documents,
              [category]: [...(project?.documents?.[category] || []), document]
            }
          }
        : project
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando centro de documentación...</p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Centro de Documentación de Proyectos
            </h1>
            <p className="text-muted-foreground">
              Gestión centralizada del flujo completo de documentación según diagrama de actividades
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              {viewOptions?.map((option) => (
                <button
                  key={option?.value}
                  onClick={() => setActiveView(option?.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
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
              iconName="Upload"
              iconPosition="left"
            >
              Subir Documentos
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Project List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="mb-4">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10"
                  />
                  <Icon 
                    name="Search" 
                    size={16} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredProjects?.map((project) => (
                  <div
                    key={project?.id}
                    onClick={() => handleProjectSelect(project)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProject?.id === project?.id
                        ? 'bg-primary/10 border-primary text-primary' :'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{project?.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{project?.code}</div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${{
                        'in-progress': 'bg-blue-100 text-blue-800',
                        'quotation-approved': 'bg-green-100 text-green-800',
                        'pending': 'bg-yellow-100 text-yellow-800',
                        'completed': 'bg-gray-100 text-gray-800'
                      }?.[project?.status] || 'bg-gray-100 text-gray-800'}`}>
                        {project?.statusLabel}
                      </span>
                      <Icon name="ChevronRight" size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedProject && (
              <>
                {/* Project Header */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{selectedProject?.name}</h2>
                      <p className="text-muted-foreground">{selectedProject?.code}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Cliente</div>
                      <div className="font-medium">{selectedProject?.client?.name}</div>
                    </div>
                  </div>

                  {/* Workflow Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progreso del Flujo</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((workflowSteps?.findIndex(step => step?.id === workflowStep) + 1) / workflowSteps?.length * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(workflowSteps?.findIndex(step => step?.id === workflowStep) + 1) / workflowSteps?.length * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Current Step */}
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={workflowSteps?.find(step => step?.id === workflowStep)?.icon || 'Circle'} 
                      size={16} 
                      className="text-primary" 
                    />
                    <span className="font-medium">
                      Paso Actual: {workflowSteps?.find(step => step?.id === workflowStep)?.label}
                    </span>
                  </div>
                </div>

                {/* Dynamic Content Based on Active View */}
                {activeView === 'workflow' && (
                  <WorkflowStatus
                    project={selectedProject}
                    workflowSteps={workflowSteps}
                    currentStep={workflowStep}
                    onStepUpdate={handleWorkflowStepUpdate}
                  />
                )}

                {activeView === 'documents' && (
                  <DocumentTree
                    project={selectedProject}
                    onDocumentUpload={handleDocumentUpload}
                  />
                )}

                {activeView === 'quotation' && (
                  <QuotationWorkflow
                    project={selectedProject}
                    onUpdate={handleWorkflowStepUpdate}
                  />
                )}

                {activeView === 'progress' && (
                  <ProgressTracking
                    project={selectedProject}
                    onPhotoUpload={handleDocumentUpload}
                  />
                )}

                {activeView === 'validation' && (
                  <DocumentValidation
                    project={selectedProject}
                    onValidationComplete={handleWorkflowStepUpdate}
                  />
                )}
              </>
            )}

            {/* Empty State */}
            {!selectedProject && (
              <div className="text-center py-12">
                <Icon name="FolderOpen" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Selecciona un proyecto</h3>
                <p className="text-muted-foreground">
                  Elige un proyecto de la lista para ver su documentación y flujo de trabajo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDocumentationCenter;