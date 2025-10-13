import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';

import ClientRegistrationPanel from './components/ClientRegistrationPanel';
import CommunicationPanel from './components/CommunicationPanel';
import QuotationRequestPanel from './components/QuotationRequestPanel';
import WorkOrderPanel from './components/WorkOrderPanel';
import ChangeManagementPanel from './components/ChangeManagementPanel';
import NewOpportunityModal from './components/NewOpportunityModal';

const SalesOpportunityManagement = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showNewOpportunityModal, setShowNewOpportunityModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const salesStages = [
    { id: 'initial-contact', name: 'Contacto Inicial', description: 'Recepción de solicitud (WhatsApp/Correo)', color: 'bg-blue-500', icon: 'MessageCircle' },
    { id: 'information-validation', name: 'Validación de Información', description: 'Clasificación y validación de información mínima', color: 'bg-indigo-500', icon: 'CheckSquare' },
    { id: 'quotation-development', name: 'Desarrollo de Cotización', description: 'Preparar cotización con alcances, supuestos y tiempos', color: 'bg-purple-500', icon: 'FileText' },
    { id: 'client-review', name: 'Revisión del Cliente', description: 'Envío de cotización y seguimiento de aprobación', color: 'bg-yellow-500', icon: 'Eye' },
    { id: 'closure', name: 'Cierre', description: 'Aprobación final o cierre de oportunidad', color: 'bg-green-500', icon: 'CheckCircle2' }
  ];

  const mockOpportunities = [/* Tus datos mock ya los tienes aquí */];

  useEffect(() => {
    const loadOpportunities = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOpportunities(mockOpportunities);
      setIsLoading(false);
    };
    loadOpportunities();
  }, []);

  const handleCreateOpportunity = (newOpportunity) => {
    setOpportunities(prev => [newOpportunity, ...prev]);
    setShowNewOpportunityModal(false);
    console.log('Nueva oportunidad creada:', newOpportunity);
  };

  const handleNewOpportunityClick = () => {
    setShowNewOpportunityModal(true);
    setShowControls(false);
    setSelectedOpportunity(null);
  };

  const handleStageTransition = (opportunityId, newStage) => {
    setOpportunities(prev => prev?.map(opp => opp?.id === opportunityId ? { ...opp, stage: newStage, stageDuration: 0 } : opp));
  };

  const handleOpportunitySelect = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowControls(true);
  };

  const handleClientRegistration = (opportunityId, clientData) => {
    setOpportunities(prev => prev?.map(opp => opp?.id === opportunityId ? { ...opp, contactInfo: { ...opp?.contactInfo, ...clientData } } : opp));
  };

  const handleCommunicationAdd = (opportunityId, communication) => {
    setOpportunities(prev => prev?.map(opp => opp?.id === opportunityId ? { ...opp, communications: [...(opp?.communications || []), communication] } : opp));
  };

  const handleQuotationUpdate = (opportunityId, quotationData) => {
    setOpportunities(prev => prev?.map(opp => opp?.id === opportunityId ? { ...opp, quotationData } : opp));
  };

  const handleWorkOrderGeneration = (opportunityId, workOrderData) => {
    setOpportunities(prev => prev?.map(opp => opp?.id === opportunityId ? { ...opp, workOrderGenerated: true, workOrderRef: workOrderData?.reference } : opp));
  };

  const getOpportunitiesByStage = (stageId) => opportunities?.filter(opp => opp?.stage === stageId) || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const getDurationColor = (days) => {
    if (days <= 3) return 'text-green-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-red-600';
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
              <p className="text-muted-foreground">Cargando oportunidades de venta...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Oportunidades de Venta</h1>
                <p className="text-muted-foreground">Flujo completo de ventas desde contacto inicial hasta cierre de oportunidad</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 lg:mt-0 flex-wrap">
                <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={() => window.location?.reload()}>Actualizar</Button>
                <Button iconName="Plus" iconPosition="left" onClick={handleNewOpportunityClick}>Nueva Oportunidad</Button>
              </div>
            </div>

            <div className="relative flex flex-col lg:flex-row transition-all duration-300">
              {/* Kanban Board */}
              <div className={`flex-1 overflow-x-auto overflow-y-hidden pb-6 transition-all duration-300 ${showControls ? 'lg:mr-[26rem]' : ''}`}>
                <div className="flex gap-6 min-w-max px-6">
                  {salesStages.map(stage => (
                    <div key={stage.id} className="flex flex-col w-[280px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className={`${stage.color} p-4 text-white flex flex-col rounded-t-2xl`}>
                        <div className="flex items-center space-x-2">
                          <Icon name={stage.icon} size={20} />
                          <h3 className="font-semibold text-base">{stage.name}</h3>
                        </div>
                        <p className="text-xs mt-1 opacity-90">{stage.description}</p>
                        <span className="text-xs mt-2 bg-white/20 rounded px-2 py-1 w-fit">{getOpportunitiesByStage(stage.id)?.length} oportunidades</span>
                      </div>

                      <div className="p-4 space-y-3 bg-gray-50 overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {getOpportunitiesByStage(stage.id)?.map(opportunity => (
                          <div key={opportunity.id} onClick={() => handleOpportunitySelect(opportunity)}
                            className={`p-3 rounded-xl border-l-4 cursor-pointer hover:scale-[1.02] transform transition-all ${getPriorityColor(opportunity.priority)}`}>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{opportunity.clientName}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${opportunity.priority === 'urgent' ? 'bg-red-100 text-red-800' : opportunity.priority === 'high' ? 'bg-orange-100 text-orange-800' : opportunity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {opportunity.priority === 'urgent' ? 'Urgente' : opportunity.priority === 'high' ? 'Alta' : opportunity.priority === 'medium' ? 'Media' : 'Baja'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1 flex-wrap gap-2">
                              <div className="flex items-center space-x-2">
                                <Icon name={opportunity.contactChannel === 'whatsapp' ? 'MessageCircle' : 'Mail'} size={12} />
                                <span className="capitalize">{opportunity.contactChannel}</span>
                                <span className={`px-2 py-0.5 rounded ${opportunity.projectType === 'project' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                  {opportunity.projectType === 'project' ? 'Proyecto' : 'Pieza'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-1">
                              <Icon name="User" size={12} />
                              <span className="text-xs text-gray-600">{opportunity.salesRep}</span>
                            </div>

                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center space-x-1">
                                <Icon name="Clock" size={12} />
                                <span className={`text-xs font-medium ${getDurationColor(opportunity.stageDuration)}`}>{opportunity.stageDuration} días</span>
                              </div>
                              <div className="text-xs font-medium text-gray-600">ID: {opportunity.id}</div>
                            </div>

                            {opportunity.workOrderGenerated && (
                              <div className="flex items-center space-x-1 mt-2 text-green-600">
                                <Icon name="CheckCircle2" size={12} />
                                <span className="text-xs font-medium">Orden generada</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {getOpportunitiesByStage(stage.id)?.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <Icon name="Inbox" size={28} className="mx-auto mb-2" />
                            <p className="text-sm">Sin oportunidades</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel lateral */}
              {showControls && (
                <div className="fixed top-[6rem] right-0 w-full lg:w-[25rem] h-[calc(100vh-6rem)] bg-white rounded-l-2xl shadow-xl border-l z-20 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Controles de Oportunidad</h3>
                    <Button variant="ghost" size="sm" iconName="X" onClick={() => setShowControls(false)} />
                  </div>

                  <div className="p-4 space-y-6">
                    {selectedOpportunity && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">{selectedOpportunity?.clientName}</h4>
                          <p className="text-sm text-muted-foreground">{selectedOpportunity?.id}</p>
                        </div>

                        {selectedOpportunity?.stage === 'initial-contact' && (
                          <ClientRegistrationPanel opportunity={selectedOpportunity} onRegister={(clientData) => handleClientRegistration(selectedOpportunity?.id, clientData)} />
                        )}

                        <CommunicationPanel opportunity={selectedOpportunity} onAddCommunication={(communication) => handleCommunicationAdd(selectedOpportunity?.id, communication)} />

                        {(selectedOpportunity?.stage === 'quotation-development' || selectedOpportunity?.quotationData) && (
                          <QuotationRequestPanel opportunity={selectedOpportunity} onUpdate={(quotationData) => handleQuotationUpdate(selectedOpportunity?.id, quotationData)} />
                        )}

                        {selectedOpportunity?.stage === 'closure' && selectedOpportunity?.quotationData?.approved && (
                          <WorkOrderPanel opportunity={selectedOpportunity} onGenerateWorkOrder={(workOrderData) => handleWorkOrderGeneration(selectedOpportunity?.id, workOrderData)} />
                        )}

                        {selectedOpportunity?.stage !== 'initial-contact' && (
                          <ChangeManagementPanel opportunity={selectedOpportunity} onRequestChange={(changeData) => console.log('Change requested:', changeData)} />
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Avanzar Etapa</label>
                          <div className="grid grid-cols-1 gap-2">
                            {salesStages?.map(stage => (
                              <Button key={stage?.id} variant={selectedOpportunity?.stage === stage?.id ? 'default' : 'outline'} size="sm" onClick={() => handleStageTransition(selectedOpportunity?.id, stage?.id)} disabled={selectedOpportunity?.stage === stage?.id} className="text-xs justify-start">
                                <Icon name={stage?.icon} size={14} className="mr-2" />
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
          </div>
        </div>

        <NewOpportunityModal
          isOpen={showNewOpportunityModal}
          onClose={() => setShowNewOpportunityModal(false)}
          onCreateOpportunity={handleCreateOpportunity}
        />
      </div>
    </div>
  );
};

export default SalesOpportunityManagement;
