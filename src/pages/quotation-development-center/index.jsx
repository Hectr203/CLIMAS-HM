import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import QuotationBuilder from './components/QuotationBuilder';
import MaterialRiskChecklist from './components/MaterialRiskChecklist';
import QuotationPreview from './components/QuotationPreview';
import ClientCommunication from './components/ClientCommunication';
import RevisionHistory from './components/RevisionHistory';
import InternalReview from './components/InternalReview';
import NewQuotationModal from './components/NewQuotationModal';

const QuotationDevelopmentCenter = () => {
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isNewQuotationModalOpen, setIsNewQuotationModalOpen] = useState(false);

  // Mock quotation data following the development workflow
  const mockQuotations = [
    {
      id: "COT-2024-001",
      clientName: "Corporación ABC",
      projectName: "Instalación HVAC Torre Corporativa",
      status: "development",
      createdDate: "2024-03-28",
      lastModified: "2024-03-30",
      assignedTo: "María García",
      priority: "high",
      stage: "scope-definition",
      quotationData: {
        scope: "Instalación completa de sistema HVAC para edificio corporativo de 12 pisos",
        assumptions: [
          "Acceso libre durante horario laboral (8:00-18:00)",
          "Cliente proporciona conexiones eléctricas principales",
          "Estructura existente soporta equipos propuestos"
        ],
        timeline: "16 semanas",
        conditions: "50% anticipo, 25% avance 50%, 25% finalización",
        warranty: "24 meses en equipos, 12 meses en instalación",
        totalAmount: 2750000,
        validity: "45 días"
      },
      materials: [
        { item: "Unidades condensadoras", quantity: 6, cost: 450000, risk: "medium" },
        { item: "Ductos galvanizados", quantity: "500 m", cost: 125000, risk: "low" },
        { item: "Controles inteligentes", quantity: 12, cost: 180000, risk: "high" }
      ],
      riskAssessment: {
        overall: "medium",
        factors: [
          { factor: "Acceso a obra", risk: "low", mitigation: "Confirmado por cliente" },
          { factor: "Disponibilidad de materiales", risk: "medium", mitigation: "Proveedores alternativos identificados" },
          { factor: "Complejidad técnica", risk: "high", mitigation: "Equipo especializado asignado" }
        ],
        extraCostsPrevention: true
      },
      revisions: [
        {
          version: "1.0",
          date: "2024-03-28",
          changes: "Versión inicial",
          author: "María García"
        }
      ],
      communications: [
        {
          id: "comm-1",
          type: "email",
          date: "2024-03-29",
          subject: "Consulta sobre especificaciones técnicas",
          content: "Cliente solicita aclaraciones sobre capacidad de enfriamiento",
          urgency: "normal",
          attachments: ["Especificaciones_Tecnicas.pdf"]
        }
      ],
      internalReview: {
        status: "pending",
        reviewAreas: {
          pricing: { reviewed: false, reviewer: "", comments: "" },
          scope: { reviewed: false, reviewer: "", comments: "" },
          timeline: { reviewed: false, reviewer: "", comments: "" },
          technical: { reviewed: false, reviewer: "", comments: "" }
        }
      },
      additionalWork: []
    },
    {
      id: "COT-2024-002",
      clientName: "Green Energy México",
      projectName: "Sistema HVAC Complejo Residencial",
      status: "review",
      createdDate: "2024-03-25",
      lastModified: "2024-03-30",
      assignedTo: "Carmen Díaz",
      priority: "urgent",
      stage: "client-review",
      quotationData: {
        scope: "Instalación de sistema HVAC para complejo residencial sustentable de 200 unidades",
        assumptions: [
          "Trabajo nocturno y fines de semana permitido",
          "Acceso a todas las unidades durante construcción",
          "Coordinación con otros contratistas del cliente"
        ],
        timeline: "20 semanas",
        conditions: "40% anticipo, 30% avance 50%, 30% finalización",
        warranty: "36 meses en equipos, 24 meses en instalación",
        totalAmount: 4200000,
        validity: "30 días"
      },
      materials: [
        { item: "Sistemas VRF", quantity: 25, cost: 1800000, risk: "medium" },
        { item: "Unidades interiores", quantity: 200, cost: 1200000, risk: "low" },
        { item: "Ductos y accesorios", quantity: "2000 m", cost: 350000, risk: "low" }
      ],
      riskAssessment: {
        overall: "low",
        factors: [
          { factor: "Volumen del proyecto", risk: "medium", mitigation: "Equipo ampliado asignado" },
          { factor: "Coordinación con terceros", risk: "medium", mitigation: "Plan de coordinación establecido" }
        ],
        extraCostsPrevention: true
      },
      revisions: [
        {
          version: "1.0",
          date: "2024-03-25",
          changes: "Versión inicial",
          author: "Carmen Díaz"
        },
        {
          version: "1.1",
          date: "2024-03-28",
          changes: "Ajuste en cronograma por solicitud del cliente",
          author: "Carmen Díaz"
        }
      ],
      communications: [
        {
          id: "comm-2",
          type: "whatsapp",
          date: "2024-03-30",
          subject: "Seguimiento de cotización",
          content: "Cliente solicita presentación de propuesta la próxima semana",
          urgency: "urgent",
          attachments: []
        }
      ],
      internalReview: {
        status: "approved",
        reviewAreas: {
          pricing: { reviewed: true, reviewer: "Martín López", comments: "Precios competitivos" },
          scope: { reviewed: true, reviewer: "Ana Rodríguez", comments: "Alcance bien definido" },
          timeline: { reviewed: true, reviewer: "Carlos Martínez", comments: "Timeline realista" },
          technical: { reviewed: true, reviewer: "Roberto Silva", comments: "Solución técnica sólida" }
        },
        approvedDate: "2024-03-29",
        approvedBy: "Ventas/Martín"
      },
      clientSubmission: {
        sent: true,
        sentDate: "2024-03-30",
        method: "email",
        urgencyLevel: "high",
        attachments: ["Cotizacion_GreenEnergy_v1.1.pdf", "Cronograma_Detallado.pdf"],
        followUpScheduled: "2024-04-05"
      }
    },
    {
      id: "COT-2024-003",
      clientName: "Tech Solutions SA",
      projectName: "Modernización Sistema Climatización",
      status: "additional-work",
      createdDate: "2024-03-22",
      lastModified: "2024-03-29",
      assignedTo: "Patricia Morales",
      priority: "medium",
      stage: "additional-quotation",
      quotationData: {
        scope: "Modernización completa del sistema de climatización existente",
        assumptions: [
          "Desmontaje de equipos obsoletos incluido",
          "Disposición final de equipos viejos por cuenta del cliente",
          "Instalaciones eléctricas existentes compatibles"
        ],
        timeline: "12 semanas",
        conditions: "30% anticipo, 40% avance 60%, 30% finalización",
        warranty: "24 meses",
        totalAmount: 1850000,
        validity: "60 días"
      },
      additionalWork: [
        {
          id: "add-1",
          description: "Actualización del sistema eléctrico por incompatibilidad detectada",
          reason: "Inspección reveló cableado obsoleto que no cumple normativas actuales",
          costImpact: 280000,
          timeImpact: "+3 semanas",
          status: "pending-approval"
        }
      ],
      materials: [
        { item: "Chillers de alta eficiencia", quantity: 2, cost: 850000, risk: "medium" },
        { item: "Manejadoras de aire", quantity: 8, cost: 480000, risk: "low" },
        { item: "Sistema de control BMS", quantity: 1, cost: 220000, risk: "high" }
      ],
      revisions: [
        {
          version: "1.0",
          date: "2024-03-22",
          changes: "Versión inicial",
          author: "Patricia Morales"
        },
        {
          version: "1.1",
          date: "2024-03-26",
          changes: "Cotización adicional por trabajos extra identificados",
          author: "Patricia Morales"
        }
      ],
      internalReview: {
        status: "approved",
        reviewAreas: {
          pricing: { reviewed: true, reviewer: "Ventas/Martín", comments: "Pricing adicional justificado" },
          scope: { reviewed: true, reviewer: "Ing. Técnico", comments: "Trabajo adicional necesario" }
        }
      }
    }
  ];

  useEffect(() => {
    const loadQuotations = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuotations(mockQuotations);
      setIsLoading(false);
    };

    loadQuotations();
  }, []);

  const handleCreateQuotation = (newQuotation) => {
    setQuotations(prev => [newQuotation, ...prev]);
    setSelectedQuotation(newQuotation);
    setActiveTab('builder');
  };

  const handleQuotationSelect = (quotation) => {
    setSelectedQuotation(quotation);
  };

  const handleQuotationUpdate = (quotationId, updates) => {
    setQuotations(prev => prev?.map(quote => 
      quote?.id === quotationId 
        ? { ...quote, ...updates, lastModified: new Date()?.toISOString()?.split('T')?.[0] }
        : quote
    ));
    
    if (selectedQuotation?.id === quotationId) {
      setSelectedQuotation(prev => ({ ...prev, ...updates }));
    }
  };

  const handleAddRevision = (quotationId, revision) => {
    const newRevision = {
      ...revision,
      version: `1.${Date.now()?.toString()?.slice(-1)}`,
      date: new Date()?.toISOString()?.split('T')?.[0]
    };

    setQuotations(prev => prev?.map(quote => 
      quote?.id === quotationId 
        ? { 
            ...quote, 
            revisions: [...(quote?.revisions || []), newRevision],
            lastModified: newRevision?.date
          }
        : quote
    ));
  };

  const handleSubmitInternalReview = (quotationId, reviewData) => {
    setQuotations(prev => prev?.map(quote => 
      quote?.id === quotationId 
        ? { ...quote, internalReview: reviewData }
        : quote
    ));
  };

  const handleClientCommunication = (quotationId, communication) => {
    const newComm = {
      ...communication,
      id: `comm-${Date.now()}`,
      date: new Date()?.toISOString()?.split('T')?.[0]
    };

    setQuotations(prev => prev?.map(quote => 
      quote?.id === quotationId 
        ? { 
            ...quote, 
            communications: [...(quote?.communications || []), newComm]
          }
        : quote
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'additional-work': return 'bg-purple-100 text-purple-800';
      case 'sent': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
          <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />
          <div className="pt-16 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando centro de desarrollo...</p>
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Centro de Desarrollo de Cotizaciones</h1>
                <p className="text-muted-foreground">
                  Creación y gestión avanzada de cotizaciones con validación de costos y comunicación directa
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                >
                  Exportar PDF
                </Button>
                <Button
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => setIsNewQuotationModalOpen(true)}
                >
                  Nueva Cotización
                </Button>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Quotations List */}
              <div className="w-80">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Cotizaciones Activas</h3>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {quotations?.map((quotation) => (
                      <div
                        key={quotation?.id}
                        onClick={() => handleQuotationSelect(quotation)}
                        className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${
                          selectedQuotation?.id === quotation?.id ? 'bg-primary/10' : 'bg-card'
                        } ${getPriorityColor(quotation?.priority)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2">
                            {quotation?.projectName}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(quotation?.status)}`}>
                            {quotation?.status === 'development' ? 'Desarrollo' :
                             quotation?.status === 'review' ? 'Revisión' :
                             quotation?.status === 'approved' ? 'Aprobada' :
                             quotation?.status === 'additional-work' ? 'Trabajo Adicional' : 'Enviada'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">{quotation?.clientName}</p>
                        <p className="text-xs text-muted-foreground mb-2">{quotation?.id}</p>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon name="User" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{quotation?.assignedTo}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(quotation?.lastModified)?.toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-foreground">
                            ${quotation?.quotationData?.totalAmount?.toLocaleString('es-MX')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Quotation Development Area */}
              <div className="flex-1">
                {selectedQuotation ? (
                  <div className="bg-card rounded-lg shadow-sm border">
                    {/* Tabs */}
                    <div className="border-b">
                      <div className="flex space-x-1 p-1">
                        {[
                          { id: 'builder', label: 'Constructor', icon: 'Settings' },
                          { id: 'materials', label: 'Materiales', icon: 'Package' },
                          { id: 'preview', label: 'Vista Previa', icon: 'Eye' },
                          { id: 'communication', label: 'Comunicación', icon: 'MessageSquare' },
                          { id: 'review', label: 'Revisión', icon: 'Users' },
                          { id: 'history', label: 'Historial', icon: 'Clock' }
                        ]?.map((tab) => (
                          <button
                            key={tab?.id}
                            onClick={() => setActiveTab(tab?.id)}
                            className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-all ${
                              activeTab === tab?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <Icon name={tab?.icon} size={16} />
                            <span>{tab?.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                      {activeTab === 'builder' && (
                        <QuotationBuilder
                          quotation={selectedQuotation}
                          onUpdate={(updates) => handleQuotationUpdate(selectedQuotation?.id, updates)}
                          onAddRevision={(revision) => handleAddRevision(selectedQuotation?.id, revision)}
                        />
                      )}

                      {activeTab === 'materials' && (
                        <MaterialRiskChecklist
                          quotation={selectedQuotation}
                          onUpdate={(updates) => handleQuotationUpdate(selectedQuotation?.id, updates)}
                        />
                      )}

                      {activeTab === 'preview' && (
                        <QuotationPreview
                          quotation={selectedQuotation}
                        />
                      )}

                      {activeTab === 'communication' && (
                        <ClientCommunication
                          quotation={selectedQuotation}
                          onAddCommunication={(comm) => handleClientCommunication(selectedQuotation?.id, comm)}
                        />
                      )}

                      {activeTab === 'review' && (
                        <InternalReview
                          quotation={selectedQuotation}
                          onSubmitReview={(reviewData) => handleSubmitInternalReview(selectedQuotation?.id, reviewData)}
                        />
                      )}

                      {activeTab === 'history' && (
                        <RevisionHistory
                          quotation={selectedQuotation}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-card rounded-lg shadow-sm border h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Seleccionar Cotización</h3>
                      <p className="text-muted-foreground">
                        Selecciona una cotización de la lista para comenzar a trabajar
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Quotation Modal */}
      <NewQuotationModal
        isOpen={isNewQuotationModalOpen}
        onClose={() => setIsNewQuotationModalOpen(false)}
        onCreateQuotation={handleCreateQuotation}
      />
    </div>
  );
};

export default QuotationDevelopmentCenter;