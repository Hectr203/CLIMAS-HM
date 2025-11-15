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
import jsPDF from "jspdf";
import "jspdf-autotable";


const WorkOrderProcessing = () => {
  const { oportunities, loading, error, getOportunities } = useOperac();
  const { requisitions, loading: loadingRequisitions, getRequisitions, updateRequisition, createRequisition, deleteRequisition } = useRequisi();

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

  const handleStatusUpdate = (order, newStatus) => {
    const updatedOrders = workOrders?.map(wo => 
      wo?.id === order?.id ? { ...wo, status: newStatus } : wo
    );
    setWorkOrders(updatedOrders);
    setFilteredOrders(updatedOrders);
  };

  // CRUD de órdenes
  const handleSaveOrder = async (data) => {
  // 🗑 Si es eliminación
  if (data?.type === "delete") {
    setLocalOrders(prev => prev.filter(o => o.id !== data.id));
    setFilteredOrders(prev => prev.filter(o => o.id !== data.id));
    return;
  }

  //Si es creación o edición
  let newOrder = { ...data };

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

  // Guardar requisición
  const handleSaveRequisition = async (savedRequisition) => {
    let newReq = { ...savedRequisition };
    try {
      if (!newReq?.id) {
        // Si es una nueva requisición, la creamos en el backend
        const response = await createRequisition(newReq);
        if (response) {
          newReq = response;
        }
      } else {
        // Si es una actualización, actualizamos en el backend
        const response = await updateRequisition(newReq.id, newReq);
        if (response) {
          newReq = response;
        }
      }

      setLocalRequisitions(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);
      setLocalOrders(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);

      // Forzar actualización de requisiciones
      await getRequisitions();
      
      setIsRequisitionModalOpen(false);
      setSelectedRequisition(null);
    } catch (error) {
      console.error("Error al guardar la requisición:", error);
    }
  };

const handleExportData = () => {
  if (!filteredOrders || filteredOrders.length === 0) {
    alert("No hay datos disponibles para exportar.");
    return;
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "A4",
  });

  const gray = "#333333";

  //ENCABEZADO AZUL
  doc.setFillColor(10, 74, 138);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("REPORTE DE ÓRDENES DE TRABAJO", doc.internal.pageSize.getWidth() / 2, 25, {
    align: "center",
  });

  //FECHA DE GENERACIÓN
  const fechaActual = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generado el ${fechaActual}`, doc.internal.pageSize.getWidth() - 120, 25);

  //SECCIÓN DATOS GENERALES
  let startY = 60;
  doc.setTextColor(gray);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Resumen General", doc.internal.pageSize.getWidth() / 2, startY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  //Totales de resumen
  const totalOrdenes = filteredOrders.length;
  const completadas = filteredOrders.filter((o) => o.estado === "Completada" || o.status === "Completada").length;
  const pendientes = filteredOrders.filter((o) => o.estado === "Pendiente" || o.status === "Pendiente").length;
  const enProceso = filteredOrders.filter((o) => o.estado === "En Proceso" || o.status === "En Proceso").length;

startY += 20;

// Construimos el texto completo
const resumenTexto = `Total de Órdenes: ${totalOrdenes}   |   Completadas: ${completadas}   |   Pendientes: ${pendientes}   |   En Proceso: ${enProceso}`;
doc.text(resumenTexto, doc.internal.pageSize.getWidth() / 2, startY, { align: "center" });


  //ORDENAR POR PRIORIDAD (Alta → Media → Baja → Crítico)
  const prioridadOrden = ["Alta", "Media", "Baja", "Crítico"];
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const prioridadA = prioridadOrden.indexOf((a.prioridad || a.priority || "").trim());
    const prioridadB = prioridadOrden.indexOf((b.prioridad || b.priority || "").trim());
    return (prioridadA === -1 ? 99 : prioridadA) - (prioridadB === -1 ? 99 : prioridadB);
  });

  //TABLA DETALLADA
  const tableColumn = [
    "N° Orden",
    "Técnico Asignado",
    "Prioridad",
    "Estado",
    "Fecha Límite",
    "Cliente",
    "Tipo Proyecto",
    "Notas",
  ];

  const tableRows = sortedOrders.map((order) => [
    order?.ordenTrabajo || order?.orderNumber || "—",
    order?.tecnicoAsignado?.nombre || order?.assignedTechnician || "Sin técnico",
    order?.prioridad || order?.priority || "—",
    order?.estado || order?.status || "—",
    order?.fechaLimite || order?.dueDate || "—",
    order?.cliente?.empresa || order?.cliente?.nombre || order?.clientName || "Sin cliente",
    order?.tipo || order?.projectName || "—",
    order?.notasAdicionales || order?.notes || "—",
  ]);

  doc.autoTable({
    startY: startY + 25,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: {
      fillColor: [10, 74, 138],
      textColor: 255,
      halign: "center",
      fontStyle: "bold",
    },
    bodyStyles: { textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 30, right: 30 },
  });

  //GUARDAR PDF
  doc.save(`reporte_ordenes_trabajo_${new Date().toISOString().split("T")[0]}.pdf`);
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

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
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
                <div className="flex justify-end p-4">
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