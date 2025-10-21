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
import useQuotation from '../../hooks/useQuotation';

const QuotationDevelopmentCenter = () => {
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isNewQuotationModalOpen, setIsNewQuotationModalOpen] = useState(false);

  const { getCotizaciones, getCotizacionById } = useQuotation();

  useEffect(() => {
    const fetchQuotations = async () => {
      setIsLoading(true);
      try {
        const response = await getCotizaciones();
        console.log('Respuesta completa del backend:', response);
        // Acceso correcto al array de cotizaciones
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log('Cotizaciones obtenidas:', data);
        setQuotations(data);
      } catch (err) {
        setQuotations([]); // Si hay error, deja quotations como array vacío
        console.error('Error al obtener cotizaciones:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const handleCreateQuotation = (newQuotation) => {
    setQuotations(prev => [newQuotation, ...prev]);
    setSelectedQuotation(newQuotation);
    setActiveTab('builder');
  };

  const handleQuotationSelect = async (quotation) => {
    setIsLoading(true);
    try {
      const quotationDetail = await getCotizacionById(quotation.id);
      setSelectedQuotation(quotationDetail);
    } catch (err) {
      // Manejo de error si es necesario
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    if (quotations.length > 0 && !selectedQuotation) {
      handleQuotationSelect(quotations[0]);
    }
  }, [quotations, selectedQuotation]);

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
                        } ${getPriorityColor(quotation?.prioridad || quotation?.priority)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2">
                            {quotation?.Proyecto?.nombre || quotation?.projectName || 'Sin proyecto'}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(quotation?.estado || quotation?.status)}`}>
                            {quotation?.estado === 'activo' ? 'Activo' :
                             quotation?.estado === 'desarrollo' ? 'Desarrollo' :
                             quotation?.estado === 'review' ? 'Revisión' :
                             quotation?.estado === 'approved' ? 'Aprobada' :
                             quotation?.estado === 'additional-work' ? 'Trabajo Adicional' :
                             quotation?.estado || quotation?.status || 'Sin estado'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">{quotation?.Cliente?.nombre || quotation?.clientName || 'Sin cliente'}</p>
                        <p className="text-xs text-muted-foreground mb-2">{quotation?.id}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon name="User" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{
                            (quotation?.PersonalAsignado?.nombres?.length > 0
                              ? quotation.PersonalAsignado.nombres.join(', ')
                              : quotation?.assignedTo || 'Sin responsable')
                          }</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Icon name="Calendar" size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(quotation?.ultimaModificacion || quotation?.lastModified || quotation?.fechaCreacion)?.toLocaleDateString('es-MX')}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-foreground">
                            ${quotation?.datosCotizacion?.montoTotal?.toLocaleString('es-MX') || quotation?.quotationData?.totalAmount?.toLocaleString('es-MX') || '0'}
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