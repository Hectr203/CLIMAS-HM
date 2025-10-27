import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import WorkOrderTable from './components/WorkOrderTable';
import FilterToolbar from './components/FilterToolbar';
import InventoryPanel from './components/InventoryPanel';
import WorkOrderModal from './components/WorkOrderModal';
import RequisitionModal from './components/RequisitionModal';
import StatsCards from './components/StatsCards';
import useOperac from '../../hooks/useOperac';
import useRequisi from '../../hooks/useRequisi';

const WorkOrderProcessing = () => {
  const { oportunities, loading, error, getOportunities } = useOperac();
  const { requisitions, loading: loadingRequisitions, getRequisitions } = useRequisi();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados locales
  const [localOrders, setLocalOrders] = useState([]); // para sincronizar órdenes
  const [localRequisitions, setLocalRequisitions] = useState([]); // para requisiciones

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [stats, setStats] = useState({});

  // Obtener requisiciones y oportunidades al iniciar
  useEffect(() => {
    const fetchData = async () => {
      const reqData = await getRequisitions();
      setLocalRequisitions(reqData || []);

      const oppData = await getOportunities();
      setLocalOrders(oppData || []);
      setFilteredOrders(oppData || []);
    };
    fetchData();
  }, []);

  // Mantener sincronía si cambian los datos del hook
  useEffect(() => {
    if (oportunities && oportunities.length > 0) {
      setLocalOrders(oportunities);
      setFilteredOrders(oportunities);
    }
  }, [oportunities]);

  useEffect(() => {
    if (requisitions && requisitions.length > 0) {
      setLocalRequisitions(requisitions);
    }
  }, [requisitions]);

  // Filtros dinámicos
  const handleFiltersChange = (filters) => {
  let filtered = [...(localOrders || [])];

  // Búsqueda general
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(order =>
      order?.ordenTrabajo?.toLowerCase()?.includes(search) ||
      order?.cliente?.nombre?.toLowerCase()?.includes(search) ||
      order?.cliente?.empresa?.toLowerCase()?.includes(search) ||
      order?.tipo?.toLowerCase()?.includes(search) ||
      order?.tecnicoAsignado?.nombre?.toLowerCase()?.includes(search) ||
      order?.notasAdicionales?.toLowerCase()?.includes(search)
    );
  }

  //  Estado
  if (filters?.status)
    filtered = filtered.filter(order => order?.estado === filters.status);

  // Prioridad
  if (filters?.priority)
    filtered = filtered.filter(order => order?.prioridad === filters.priority);

  // Técnico
  if (filters?.technician)
    filtered = filtered.filter(order =>
      order?.tecnicoAsignado?.nombre === filters.technician
    );

  // Proyecto (por tipo)
  if (filters?.project)
    filtered = filtered.filter(order => order?.tipo === filters.project);

  // Rango de fechas
  if (filters?.dateRange) {
    const today = new Date();
    filtered = filtered.filter(order => {
      const dueDate = new Date(order?.fechaLimite);
      if (isNaN(dueDate)) return false;
      switch (filters.dateRange) {
        case 'today':
          return dueDate.toDateString() === today.toDateString();
        case 'week': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return dueDate >= startOfWeek && dueDate <= endOfWeek;
        }
        case 'month':
          return (
            dueDate.getMonth() === today.getMonth() &&
            dueDate.getFullYear() === today.getFullYear()
          );
        case 'overdue':
          return dueDate < today;
        default:
          return true;
      }
    });
  }

  setFilteredOrders(filtered);
};

  // Actualizar estatus
  const handleStatusUpdate = (order, newStatus) => {
    const updatedOrders = localOrders.map(wo =>
      wo.id === order.id ? { ...wo, estado: newStatus } : wo
    );
    setLocalOrders(updatedOrders);
    setFilteredOrders(updatedOrders);
  };

  // CRUD de órdenes
  const handleSaveOrder = async (savedOrder) => {
    let newOrder = { ...savedOrder };

    if (!newOrder?.id) {
      newOrder.id = Date.now();
      newOrder.estado = 'Pendiente';
      newOrder.fechaCreacion = new Date().toISOString();
    }

    setLocalOrders(prev => {
      const exists = prev.some(o => o.id === newOrder.id);
      return exists
        ? prev.map(o => (o.id === newOrder.id ? newOrder : o))
        : [newOrder, ...prev];
    });

    setFilteredOrders(prev => {
      const exists = prev.some(o => o.id === newOrder.id);
      return exists
        ? prev.map(o => (o.id === newOrder.id ? newOrder : o))
        : [newOrder, ...prev];
    });

    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Crear nueva orden
  const handleCreateNewOrder = () => {
    const newOrder = {
      id: null,
      orderNumber: '',
      projectName: '',
      clientName: '',
      type: '',
      priority: 'Media',
      status: 'Pendiente',
      assignedTechnician: '',
      technicianRole: '',
      dueDate: '',
      progress: 0,
      description: '',
      requiredMaterials: [],
      attachments: [],
      requiredPPE: [],
      medicalRequirements: false,
      notes: ''
    };
    setSelectedOrder(newOrder);
    setIsModalOpen(true);
  };

  // Crear nueva requisición
  const handleCreateNewRequisition = () => {
    const newRequisition = {
      id: null,
      requestNumber: '',
      orderNumber: '',
      projectName: '',
      requestedBy: 'Usuario Actual',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      priority: 'Media',
      description: '',
      items: [],
      justification: '',
      approvedBy: '',
      approvalDate: '',
      notes: ''
    };
    setSelectedRequisition(newRequisition);
    setIsRequisitionModalOpen(true);
  };

  // Guardar requisición
  const handleSaveRequisition = async (savedRequisition) => {
  let newReq = { ...savedRequisition };

  if (!newReq?.id) {
    newReq.id = Date.now();
    newReq.requestNumber = `REQ-${new Date().getFullYear()}-${String(newReq.id).slice(-3)}`;
  }

  setLocalRequisitions(prev => [newReq, ...prev]);
  setLocalOrders(prev => [newReq, ...prev]); // 🔹 esto hará que se muestre también en WorkOrderTable

  getRequisitions(); // sincroniza backend
  setIsRequisitionModalOpen(false);
  setSelectedRequisition(null);
};

  const handleExportData = () => {
    const csvData = filteredOrders.map(order => ({
      'Número de Orden': order?.orderNumber,
      'Proyecto': order?.projectName,
      'Cliente': order?.clientName,
      'Tipo': order?.type,
      'Prioridad': order?.priority,
      'Estado': order?.status,
      'Técnico Asignado': order?.assignedTechnician,
      'Fecha Límite': order?.dueDate,
      'Progreso': `${order?.progress}%`
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `ordenes_trabajo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>
      <div className="lg:hidden">
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} isMenuOpen={mobileMenuOpen} />
      </div>

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} lg:pt-0 pt-16`}>
        <div className="p-6">
          <div className="mb-6">
            <Breadcrumb />
            <div className="flex items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Procesamiento de Órdenes de Trabajo</h1>
                <p className="text-muted-foreground mt-2">
                  Gestión integral de órdenes de trabajo, asignación de técnicos y control de materiales
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="Plus" iconSize={16} onClick={handleCreateNewOrder}>
                  Nueva Orden
                </Button>
                <Button variant="outline" iconName="ClipboardList" iconSize={16} onClick={handleCreateNewRequisition}>
                  Nueva Requisición
                </Button>
                <Button variant="default" iconName="Download" iconSize={16} onClick={handleExportData}>
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <FilterToolbar
                onFiltersChange={handleFiltersChange}
                totalCount={localOrders?.length}
                filteredCount={filteredOrders?.length}
              />

              <WorkOrderTable
                workOrders={filteredOrders}
                requisitions={localRequisitions}
                onStatusUpdate={handleStatusUpdate}
                onAssignTechnician={setSelectedOrder}
                onViewDetails={setSelectedOrder}
                onEditOrder={handleSaveOrder}
                loading={loading}
                error={error}
              />
            </div>

            <div className="xl:col-span-1">
              <InventoryPanel
                onCreatePurchaseOrder={() => {}}
                onRequestMaterial={() => {}}
                onCreateRequisition={handleCreateNewRequisition}
                requisitions={localRequisitions}
                loading={loadingRequisitions}
                 onRequisitionUpdated={setLocalRequisitions}
              />
            </div>
          </div>

          <WorkOrderModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
            workOrder={selectedOrder}
            onSaveSuccess={handleSaveOrder}
          />

          <RequisitionModal
            isOpen={isRequisitionModalOpen}
            onClose={() => { setIsRequisitionModalOpen(false); setSelectedRequisition(null); }}
            requisition={selectedRequisition}
            onSave={handleSaveRequisition}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkOrderProcessing;
