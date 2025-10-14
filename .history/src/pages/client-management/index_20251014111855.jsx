import React, { useState, useEffect } from 'react';
import useClient from '../../hooks/useClient';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import ClientCard from './components/ClientCard';
import ClientTable from './components/ClientTable';
import ClientFilters from './components/ClientFilters';
import CommunicationTimeline from './components/CommunicationTimeline';
import DocumentStatus from './components/DocumentStatus';
import ContractAlerts from './components/ContractAlerts';
import NewClientModal from './components/NewClientModal';

const ClientManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const {
    clients,
    setClients, // <- Asegúrate de exponer esto en useClient
    getClients,
    createClient,
    editClient,
    loading,
    error
  } = useClient();

  useEffect(() => {
    getClients();
  }, []);

  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    status: '',
    relationshipHealth: '',
    location: '',
    rfc: '',
    minProjects: '',
    minValue: ''
  });

  const handleSidebarToggle = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);

  // 🧩 Filtro dinámico
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    if (!Array.isArray(clients)) return;

    let filtered = clients;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client?.empresa?.toLowerCase()?.includes(search) ||
          client?.contacto?.toLowerCase()?.includes(search) ||
          client?.email?.toLowerCase()?.includes(search)
      );
    }

    if (filters.industry) {
      filtered = filtered.filter((client) => client?.industria === filters.industry);
    }

    if (filters.status) {
      filtered = filtered.filter((client) => client?.estado === filters.status);
    }

    if (filters.relationshipHealth) {
      filtered = filtered.filter(
        (client) => client?.relacion === filters.relationshipHealth
      );
    }

    if (filters.location) {
      filtered = filtered.filter(
        (client) =>
          client?.ubicacionEmpre === filters.location ||
          client?.ubicacion?.ciudad === filters.location
      );
    }

    if (filters.rfc) {
      filtered = filtered.filter((client) =>
        client?.rfc?.toLowerCase()?.includes(filters.rfc.toLowerCase())
      );
    }

    if (filters.minProjects) {
      filtered = filtered.filter(
        (client) =>
          (parseInt(client?.totalProjects) || 0) >= parseInt(filters.minProjects)
      );
    }

    if (filters.minValue) {
      filtered = filtered.filter(
        (client) =>
          (parseInt(client?.totalValue) || 0) >= parseInt(filters.minValue)
      );
    }

    setFilteredClients(filtered);
  }, [filters, clients]);

  const handleFiltersChange = (newFilters) => setFilters(newFilters);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      industry: '',
      status: '',
      relationshipHealth: '',
      location: '',
      rfc: '',
      minProjects: '',
      minValue: ''
    });
  };

  // 📤 Exportar CSV
  const handleExportClients = () => {
    const headers = [
      'Empresa',
      'Contacto',
      'Email',
      'Teléfono',
      'Industria',
      'Ubicación',
      'Estado',
      'Salud Relación',
      'RFC',
      'Cliente Desde',
      'Total Proyectos',
      'Contratos Activos',
      'Valor Total'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredClients.map((client) =>
        [
          `"${client?.companyName}"`,
          `"${client?.contactPerson}"`,
          client?.email,
          `"${client?.phone}"`,
          client?.industry,
          `"${client?.location}"`,
          client?.status,
          client?.relationshipHealth,
          client?.rfc,
          client?.clientSince,
          client?.totalProjects,
          client?.activeContracts,
          client?.totalValue
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 🧩 Acciones CRUD en tiempo real
  const handleSubmitNewClient = async (clientData) => {
    try {
      const response = await createClient(clientData);
      if (response?.data) {
        setClients((prev) => [...prev, response.data]); // se agrega de inmediato
      }
      setShowNewClientModal(false);
    } catch (err) {
      console.error('Error al crear cliente:', err);
    }
  };

  const [editModalState, setEditModalState] = useState({ open: false, client: null });

  const handleEditClient = (client) => {
    setEditModalState({ open: true, client });
  };

  const handleSubmitEditClient = async (updatedClient) => {
    try {
      const response = await editClient(updatedClient.id, updatedClient);
      if (response?.data) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === updatedClient.id ? { ...c, ...response.data } : c
          )
        );
      }
      setEditModalState({ open: false, client: null });
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowSidebar(true);
  };

  const handleAddClient = () => setShowNewClientModal(true);

  // Mock Data Sidebar
  const mockCommunications = [
    {
      id: 1,
      type: 'email',
      subject: 'Propuesta de Mantenimiento Anual',
      description:
        'Envío de propuesta para contrato de mantenimiento anual de sistemas HVAC.',
      contactPerson: 'Carlos Hernández',
      date: '2024-09-28T10:30:00',
      hasAttachments: true
    }
  ];

  const mockDocuments = [
    {
      id: 1,
      name: 'RFC - Grupo Industrial Monterrey',
      type: 'RFC',
      status: 'Completo',
      uploadDate: '2024-03-15'
    }
  ];

  const mockContracts = [
    {
      id: 1,
      contractNumber: 'CONT-2024-001',
      clientName: 'Grupo Industrial Monterrey',
      startDate: '2024-01-01',
      expirationDate: '2024-12-31',
      value: 850000
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      </div>

      {/* Header Mobile */}
      <div className="lg:hidden">
        <Header onMenuToggle={handleMobileMenuToggle} isMenuOpen={mobileMenuOpen} />
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        } lg:pt-0 pt-16`}
      >
        <div className="flex">
          {/* Main Panel */}
          <div
            className={`flex-1 transition-all duration-300 ${
              showSidebar ? 'mr-96' : ''
            }`}
          >
            <div className="p-6">
              {/* Modales */}
              <NewClientModal
                isOpen={showNewClientModal}
                onClose={() => setShowNewClientModal(false)}
                onSubmit={handleSubmitNewClient}
                mode="create"
              />

              <NewClientModal
                isOpen={editModalState.open}
                onClose={() => setEditModalState({ open: false, client: null })}
                onSubmit={handleSubmitEditClient}
                initialData={editModalState.client}
                mode="edit"
              />

              {/* Breadcrumb */}
              <div className="mb-6">
                <Breadcrumb />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Gestión de Clientes
                  </h1>
                  <p className="text-muted-foreground">
                    Administra relaciones con clientes, contratos y comunicaciones
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      iconName="Table"
                    >
                      Tabla
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      iconName="Grid3X3"
                    >
                      Tarjetas
                    </Button>
                  </div>
                  <Button
                    variant="default"
                    onClick={handleAddClient}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Nuevo Cliente
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              <ClientFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                onExport={handleExportClients}
              />

              {/* Lista */}
              {viewMode === 'table' ? (
                <ClientTable
                  clients={filteredClients}
                  loading={loading}
                  onViewDetails={handleViewDetails}
                  onEditClient={handleEditClient}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredClients?.map((client) => (
                    <ClientCard
                      key={client?.id}
                      client={client}
                      onViewDetails={handleViewDetails}
                      onEditClient={handleEditClient}
                    />
                  ))}
                </div>
              )}

              {filteredClients?.length === 0 && (
                <div className="text-center py-12">
                  <Icon
                    name="Users"
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No se encontraron clientes
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Ajusta los filtros de búsqueda o agrega un nuevo cliente
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAddClient}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Agregar Primer Cliente
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Detalles */}
          {showSidebar && (
            <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-1000 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedClient?.companyName}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(false)}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>

                <div className="space-y-6">
                  <CommunicationTimeline communications={mockCommunications} />
                  <DocumentStatus documents={mockDocuments} />
                  <ContractAlerts contracts={mockContracts} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;
