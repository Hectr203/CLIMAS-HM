import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import ClientTable from './components/ClientTable';
import ClientModal from './components/ClientModal';
import ClientFilters from './components/ClientFilters';
import useClient from '../../hooks/useClient'; // tu hook real

const ClientManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Hook con lógica CRUD
  const { clients, getClients, createClient, editClient, setClients, loading, error } = useClient();

  // Cargar clientes iniciales
  useEffect(() => {
    getClients();
  }, []);

  // ✅ Filtrado básico en memoria
  const filteredClients = useMemo(() => {
    if (!clients) return [];

    return clients.filter((client) => {
      const search = filters.search?.toLowerCase() || '';
      const matchSearch =
        !search ||
        client?.nombre?.toLowerCase()?.includes(search) ||
        client?.email?.toLowerCase()?.includes(search) ||
        client?.telefono?.includes(search);

      const matchStatus =
        !filters.status ||
        client?.status?.toLowerCase() === filters.status.toLowerCase();

      const matchType =
        !filters.type || client?.tipo?.toLowerCase() === filters.type.toLowerCase();

      return matchSearch && matchStatus && matchType;
    });
  }, [clients, filters]);

  // ✅ Abrir modal para crear
  const handleCreateClient = () => {
    setSelectedClient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // ✅ Abrir modal para editar
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // ✅ Guardar o actualizar cliente en tiempo real
  const handleSaveClient = async (clientData) => {
    try {
      if (modalMode === 'create') {
        const response = await createClient(clientData);
        if (response?.data) {
          setClients((prev) => [...prev, response.data]); // agrega sin recargar
        }
      } else if (modalMode === 'edit') {
        const response = await editClient(selectedClient.id, clientData);
        if (response?.data) {
          setClients((prev) =>
            prev.map((c) =>
              c.id === selectedClient.id ? { ...c, ...response.data } : c
            )
          );
        }
      }

      setIsModalOpen(false);
      setSelectedClient(null);
      setModalMode(null);
    } catch (err) {
      console.error('❌ Error al guardar cliente:', err);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', type: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      </div>

      {/* Header móvil */}
      <div className="lg:hidden">
        <Header onMenuToggle={handleMobileMenuToggle} isMenuOpen={mobileMenuOpen} />
      </div>

      {/* Contenido principal */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        } lg:pt-0 pt-16`}
      >
        <div className="p-6">
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* Encabezado */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
              <p className="text-muted-foreground mt-2">
                Administra tus clientes de manera eficiente.
              </p>
            </div>

            <Button
              onClick={handleCreateClient}
              iconName="UserPlus"
              iconPosition="left"
              iconSize={16}
            >
              Nuevo Cliente
            </Button>
          </div>

          {/* Filtros */}
          <ClientFilters
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            totalCount={clients?.length || 0}
            filteredCount={filteredClients?.length || 0}
          />

          {/* Tabla */}
          <ClientTable
            clients={filteredClients}
            loading={loading}
            onEditClient={handleEditClient}
          />

          {/* Modal */}
          <ClientModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            client={selectedClient}
            mode={modalMode}
            onSave={handleSaveClient}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;
