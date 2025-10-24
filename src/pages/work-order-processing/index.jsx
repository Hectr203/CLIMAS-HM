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

const WorkOrderProcessing = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Mock data for work orders
  const mockWorkOrders = [
    {
      id: 1,
      orderNumber: 'OT-2024-015',
      projectName: 'Torre Corporativa ABC',
      clientName: 'Corporación ABC S.A.',
      type: 'Instalación HVAC',
      priority: 'Alta',
      status: 'En Progreso',
      assignedTechnician: 'Carlos Mendoza',
      technicianRole: 'Técnico Senior',
      dueDate: '05/10/2024',
      progress: 65,
      description: `Instalación completa del sistema HVAC en torre corporativa de 15 pisos.\nIncluye unidades manejadoras de aire, ductos, y sistema de control automatizado.\nSe requiere coordinación con otros contratistas para acceso a áreas técnicas.`,
      requiredMaterials: [
        { name: 'Compresor Rotativo 5HP', quantity: '2 unidades' },
        { name: 'Filtro de Aire HEPA', quantity: '8 unidades' },
        { name: 'Ductos Galvanizados', quantity: '150 metros' }
      ],
      attachments: [
        { name: 'Planos_HVAC_ABC.pdf', type: 'pdf' },
        { name: 'Especificaciones_Técnicas.docx', type: 'doc' }
      ],
      requiredPPE: ['Casco de Seguridad', 'Arnés de Seguridad', 'Calzado de Seguridad'],
      medicalRequirements: true,
      notes: 'Trabajo en altura requiere certificación vigente'
    },
    {
      id: 2,
      orderNumber: 'OT-2024-016',
      projectName: 'Centro Comercial Plaza Norte',
      clientName: 'Inmobiliaria Plaza Norte',
      type: 'Mantenimiento Preventivo',
      priority: 'Media',
      status: 'Pendiente',
      assignedTechnician: 'Ana García',
      technicianRole: 'Especialista HVAC',
      dueDate: '08/10/2024',
      progress: 0,
      description: `Mantenimiento preventivo trimestral del sistema HVAC del centro comercial.\nIncluye limpieza de filtros, revisión de compresores y calibración de termostatos.\nProgramado durante horarios de menor afluencia de público.`,
      requiredMaterials: [
        { name: 'Filtros de Aire', quantity: '20 unidades' },
        { name: 'Refrigerante R-410A', quantity: '2 cilindros' },
        { name: 'Aceite para Compresor', quantity: '5 litros' }
      ],
      attachments: [
        { name: 'Checklist_Mantenimiento.pdf', type: 'pdf' }
      ],
      requiredPPE: ['Casco de Seguridad', 'Gafas de Protección', 'Guantes de Trabajo'],
      medicalRequirements: false,
      notes: 'Coordinar con administración del centro comercial'
    },
    {
      id: 3,
      orderNumber: 'OT-2024-017',
      projectName: 'Hospital General San José',
      clientName: 'Hospital General San José',
      type: 'Reparación de Emergencia',
      priority: 'Crítica',
      status: 'En Progreso',
      assignedTechnician: 'Roberto Silva',
      technicianRole: 'Técnico Junior',
      dueDate: '02/10/2024',
      progress: 85,
      description: `Reparación urgente del sistema de climatización en área de cuidados intensivos.\nFalla en compresor principal requiere reemplazo inmediato.\nTrabajo 24/7 hasta completar la reparación crítica.`,
      requiredMaterials: [
        { name: 'Compresor Scroll 10HP', quantity: '1 unidad' },
        { name: 'Kit de Conexiones', quantity: '1 set' },
        { name: 'Refrigerante R-134A', quantity: '3 cilindros' }
      ],
      attachments: [
        { name: 'Reporte_Falla_UCI.pdf', type: 'pdf' },
        { name: 'Foto_Compresor_Dañado.jpg', type: 'image' }
      ],
      requiredPPE: ['Casco de Seguridad', 'Respirador N95', 'Guantes de Trabajo', 'Calzado de Seguridad'],
      medicalRequirements: true,
      notes: 'Ambiente hospitalario - seguir protocolos de bioseguridad'
    },
    {
      id: 4,
      orderNumber: 'OT-2024-018',
      projectName: 'Edificio Residencial Vista Mar',
      clientName: 'Constructora Vista Mar',
      type: 'Instalación Nueva',
      priority: 'Media',
      status: 'Completada',
      assignedTechnician: 'María López',
      technicianRole: 'Supervisora',
      dueDate: '28/09/2024',
      progress: 100,
      description: `Instalación de sistema HVAC en edificio residencial de 8 pisos.\nSistema VRF con unidades individuales por apartamento.\nIncluye programación de controles remotos y capacitación a usuarios.`,
      requiredMaterials: [
        { name: 'Unidades VRF', quantity: '24 unidades' },
        { name: 'Controles Remotos', quantity: '24 unidades' },
        { name: 'Tubería de Cobre', quantity: '200 metros' }
      ],
      attachments: [
        { name: 'Manual_Usuario_VRF.pdf', type: 'pdf' },
        { name: 'Certificado_Instalación.pdf', type: 'pdf' }
      ],
      requiredPPE: ['Casco de Seguridad', 'Calzado de Seguridad', 'Guantes de Trabajo'],
      medicalRequirements: false,
      notes: 'Proyecto completado satisfactoriamente - cliente aprobó entrega'
    },
    {
      id: 5,
      orderNumber: 'OT-2024-019',
      projectName: 'Oficinas Corporativas TechSoft',
      clientName: 'TechSoft Solutions',
      type: 'Actualización de Sistema',
      priority: 'Baja',
      status: 'En Pausa',
      assignedTechnician: 'Diego Ramírez',
      technicianRole: 'Técnico Senior',
      dueDate: '15/10/2024',
      progress: 30,
      description: `Actualización del sistema de control HVAC a tecnología IoT.\nInstalación de sensores inteligentes y sistema de monitoreo remoto.\nProyecto pausado por disponibilidad de equipos especializados.`,
      requiredMaterials: [
        { name: 'Sensores IoT', quantity: '15 unidades' },
        { name: 'Gateway de Comunicación', quantity: '1 unidad' },
        { name: 'Cableado de Red', quantity: '100 metros' }
      ],
      attachments: [
        { name: 'Propuesta_IoT_TechSoft.pdf', type: 'pdf' }
      ],
      requiredPPE: ['Casco de Seguridad', 'Gafas de Protección'],
      medicalRequirements: false,
      notes: 'Esperando llegada de sensores IoT - fecha estimada 10/10/2024'
    }
  ];

  const mockStats = {
    activeOrders: 24,
    pendingOrders: 8,
    inProgressOrders: 12,
    completedToday: 4,
    activeTechnicians: 15,
    criticalMaterials: 3
  };

  useEffect(() => {
    setWorkOrders(mockWorkOrders);
    setFilteredOrders(mockWorkOrders);
    setStats(mockStats);
  }, []);

  const handleFiltersChange = (filters) => {
    let filtered = [...workOrders];

    if (filters?.search) {
      filtered = filtered?.filter(order => 
        order?.orderNumber?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        order?.projectName?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        order?.clientName?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    if (filters?.status) {
      filtered = filtered?.filter(order => order?.status === filters?.status);
    }

    if (filters?.priority) {
      filtered = filtered?.filter(order => order?.priority === filters?.priority);
    }

    if (filters?.technician) {
      filtered = filtered?.filter(order => order?.assignedTechnician === filters?.technician);
    }

    if (filters?.project) {
      filtered = filtered?.filter(order => order?.orderNumber === filters?.project);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = (order, newStatus) => {
    const updatedOrders = workOrders?.map(wo => 
      wo?.id === order?.id ? { ...wo, status: newStatus } : wo
    );
    setWorkOrders(updatedOrders);
    setFilteredOrders(updatedOrders);
  };

  const handleAssignTechnician = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSaveOrder = (updatedOrder) => {
    const updatedOrders = workOrders?.map(wo => 
      wo?.id === updatedOrder?.id ? updatedOrder : wo
    );
    setWorkOrders(updatedOrders);
    setFilteredOrders(updatedOrders);
  };

  const handleCreateNewOrder = () => {
    // Create empty order structure for new order creation
    const newOrder = {
      id: null, // Will be generated when saved
      orderNumber: '', // Will be auto-generated
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

  const handleCreateNewRequisition = () => {
    // Create empty requisition structure for new requisition creation
    const newRequisition = {
      id: null, // Will be generated when saved
      requestNumber: '', // Will be auto-generated
      orderNumber: '',
      projectName: '',
      requestedBy: 'Usuario Actual',
      requestDate: new Date()?.toISOString()?.split('T')?.[0],
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

  const handleSaveRequisition = (updatedRequisition) => {
    console.log('Saving requisition:', updatedRequisition);
    
    // Generate a unique ID if it's a new requisition
    if (!updatedRequisition?.id) {
      updatedRequisition.id = Date.now();
      updatedRequisition.requestNumber = `REQ-${new Date()?.getFullYear()}-${String(updatedRequisition?.id)?.slice(-3)}`;
    }
    
    // Here you would typically save to your backend
    // For now, just show success message and close modal
    alert(`Requisición ${updatedRequisition?.requestNumber} ${updatedRequisition?.id ? 'actualizada' : 'creada'} exitosamente`);
    
    setIsRequisitionModalOpen(false);
    setSelectedRequisition(null);
  };

  const handleCreatePurchaseOrder = (item) => {
    console.log('Creating purchase order for:', item);
    // Navigate to purchase order creation
  };

  const handleRequestMaterial = (request) => {
    console.log('Processing material request:', request);
    // Update request status
  };

  const handleExportData = () => {
    // Generate CSV data with work orders
    const csvData = filteredOrders?.map(order => ({
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

    // Convert to CSV format
    const headers = Object.keys(csvData?.[0] || {});
    const csvContent = [
      headers?.join(','),
      ...csvData?.map(row => headers?.map(header => `"${row?.[header]}"`)?.join(','))
    ]?.join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link?.setAttribute('href', url);
    link?.setAttribute('download', `ordenes_trabajo_${new Date()?.toISOString()?.split('T')?.[0]}.csv`);
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={handleSidebarToggle}
        />
      </div>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header 
          onMenuToggle={handleMobileMenuToggle}
          isMenuOpen={mobileMenuOpen}
        />
      </div>
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      } lg:pt-0 pt-16`}>
        <div className="p-6">
          {/* Header Section */}
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
                <Button
                  variant="outline"
                  iconName="Plus"
                  iconSize={16}
                  onClick={handleCreateNewOrder}
                >
                  Nueva Orden
                </Button>
                <Button
                  variant="outline"
                  iconName="ClipboardList"
                  iconSize={16}
                  onClick={handleCreateNewRequisition}
                >
                  Nueva Requisición
                </Button>
                <Button
                  variant="default"
                  iconName="Download"
                  iconSize={16}
                  onClick={handleExportData}
                >
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Work Orders Section */}
            <div className="xl:col-span-2 space-y-6">
              <FilterToolbar
                onFiltersChange={handleFiltersChange}
                totalCount={workOrders?.length}
                filteredCount={filteredOrders?.length}
              />

              <WorkOrderTable
                workOrders={filteredOrders}
                onStatusUpdate={handleStatusUpdate}
                onAssignTechnician={handleAssignTechnician}
                onViewDetails={handleViewDetails}
                onEditOrder={handleEditOrder}
              />
            </div>

            {/* Inventory Panel */}
            <div className="xl:col-span-1">
              <InventoryPanel
                onCreatePurchaseOrder={handleCreatePurchaseOrder}
                onRequestMaterial={handleRequestMaterial}
                onCreateRequisition={handleCreateNewRequisition}
              />
            </div>
          </div>

          {/* Work Order Modal */}
          <WorkOrderModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedOrder(null);
            }}
            workOrder={selectedOrder}
            onSave={handleSaveOrder}
          />

          {/* Requisition Modal */}
          <RequisitionModal
            isOpen={isRequisitionModalOpen}
            onClose={() => {
              setIsRequisitionModalOpen(false);
              setSelectedRequisition(null);
            }}
            requisition={selectedRequisition}
            onSave={handleSaveRequisition}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkOrderProcessing;