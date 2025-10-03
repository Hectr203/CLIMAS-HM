import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import InventoryTable from './components/InventoryTable';
import InventoryFilters from './components/InventoryFilters';
import StockAlerts from './components/StockAlerts';
import PurchaseOrderPanel from './components/PurchaseOrderPanel';
import MaterialRequirements from './components/MaterialRequirements';
import InventoryStats from './components/InventoryStats';
import NewItemModal from './components/NewItemModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const InventoryManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    supplier: '',
    location: '',
    minStock: '',
    maxStock: '',
    quickFilter: ''
  });

  // Mock data for inventory items - Convert to state to allow adding new items
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      itemCode: 'HVAC-001',
      description: 'Unidad Condensadora 3 Toneladas',
      specifications: 'R-410A, 220V, Eficiencia SEER 16',
      category: 'Equipos HVAC',
      currentStock: 5,
      reservedStock: 2,
      reorderPoint: 3,
      unit: 'pcs',
      supplier: {
        name: 'Carrier México',
        contact: 'ventas@carrier.mx'
      },
      location: 'Almacén Principal',
      lastUpdated: new Date('2024-09-28'),
      unitCost: 45000
    },
    {
      id: 2,
      itemCode: 'REF-002',
      description: 'Compresor Scroll 2HP',
      specifications: 'Copeland, R-404A, 220V',
      category: 'Refrigeración',
      currentStock: 0,
      reservedStock: 0,
      reorderPoint: 2,
      unit: 'pcs',
      supplier: {
        name: 'Trane Climatización',
        contact: 'pedidos@trane.mx'
      },
      location: 'Almacén Principal',
      lastUpdated: new Date('2024-09-25'),
      unitCost: 12500
    },
    {
      id: 3,
      itemCode: 'ELE-003',
      description: 'Contactor 40A 3 Polos',
      specifications: '220V, Bobina 24V, Schneider Electric',
      category: 'Componentes Eléctricos',
      currentStock: 15,
      reservedStock: 5,
      reorderPoint: 10,
      unit: 'pcs',
      supplier: {
        name: 'York International',
        contact: 'soporte@york.mx'
      },
      location: 'Taller',
      lastUpdated: new Date('2024-09-29'),
      unitCost: 850
    },
    {
      id: 4,
      itemCode: 'PLU-004',
      description: 'Tubería de Cobre 1/2"',
      specifications: 'Tipo L, 20 pies de longitud',
      category: 'Plomería',
      currentStock: 2,
      reservedStock: 1,
      reorderPoint: 5,
      unit: 'pcs',
      supplier: {
        name: 'Lennox Industries',
        contact: 'ventas@lennox.mx'
      },
      location: 'Almacén Secundario',
      lastUpdated: new Date('2024-09-27'),
      unitCost: 320
    },
    {
      id: 5,
      itemCode: 'TOO-005',
      description: 'Manifold Digital R-410A',
      specifications: 'Con mangueras, precisión ±0.5%',
      category: 'Herramientas',
      currentStock: 8,
      reservedStock: 0,
      reorderPoint: 3,
      unit: 'pcs',
      supplier: {
        name: 'Daikin México',
        contact: 'herramientas@daikin.mx'
      },
      location: 'Taller',
      lastUpdated: new Date('2024-09-30'),
      unitCost: 4200
    }
  ]);

  // Mock data for stock alerts
  const stockAlerts = [
    {
      id: 1,
      type: 'out-of-stock',
      title: 'Compresor Scroll Agotado',
      message: 'El compresor scroll 2HP está completamente agotado y hay proyectos pendientes que lo requieren.',
      itemCode: 'REF-002',
      currentStock: 0,
      reorderPoint: 2,
      unit: 'pcs',
      supplier: 'Trane Climatización',
      createdAt: new Date('2024-09-25T10:30:00')
    },
    {
      id: 2,
      type: 'low-stock',
      title: 'Tubería de Cobre en Stock Bajo',
      message: 'La tubería de cobre 1/2" está por debajo del punto de reorden.',
      itemCode: 'PLU-004',
      currentStock: 2,
      reorderPoint: 5,
      unit: 'pcs',
      supplier: 'Lennox Industries',
      createdAt: new Date('2024-09-27T14:15:00')
    },
    {
      id: 3,
      type: 'low-stock',
      title: 'Unidad Condensadora Stock Crítico',
      message: 'Solo quedan 3 unidades disponibles después de las reservas.',
      itemCode: 'HVAC-001',
      currentStock: 5,
      reorderPoint: 3,
      unit: 'pcs',
      supplier: 'Carrier México',
      createdAt: new Date('2024-09-28T09:45:00')
    }
  ];

  // Mock data for purchase orders
  const purchaseOrders = [
    {
      id: 1,
      orderNumber: 'PO-2024-001',
      supplier: 'Carrier México',
      status: 'pending',
      orderDate: new Date('2024-09-28'),
      expectedDelivery: new Date('2024-10-05'),
      total: 135000,
      itemCount: 3,
      urgent: false
    },
    {
      id: 2,
      orderNumber: 'PO-2024-002',
      supplier: 'Trane Climatización',
      status: 'approved',
      orderDate: new Date('2024-09-25'),
      expectedDelivery: new Date('2024-10-02'),
      total: 25000,
      itemCount: 2,
      urgent: true
    },
    {
      id: 3,
      orderNumber: 'PO-2024-003',
      supplier: 'York International',
      status: 'received',
      orderDate: new Date('2024-09-20'),
      expectedDelivery: new Date('2024-09-27'),
      total: 8500,
      itemCount: 10,
      urgent: false
    }
  ];

  // Mock data for material requirements
  const materialRequirements = [
    {
      id: 1,
      requestNumber: 'REQ-2024-001',
      projectName: 'Instalación HVAC Torre Corporativa',
      requestedBy: 'Carlos Mendoza',
      status: 'pending',
      priority: 'high',
      requestDate: new Date('2024-09-29'),
      requiredDate: new Date('2024-10-03'),
      notes: 'Materiales urgentes para completar instalación en piso 15',
      items: [
        { description: 'Unidad Condensadora 5 Ton', quantity: 2, unit: 'pcs' },
        { description: 'Tubería de Cobre 3/4"', quantity: 50, unit: 'ft' },
        { description: 'Refrigerante R-410A', quantity: 4, unit: 'kg' }
      ]
    },
    {
      id: 2,
      requestNumber: 'REQ-2024-002',
      projectName: 'Mantenimiento Centro Comercial',
      requestedBy: 'Ana García',
      status: 'approved',
      priority: 'medium',
      requestDate: new Date('2024-09-27'),
      requiredDate: new Date('2024-10-01'),
      notes: 'Repuestos para mantenimiento preventivo',
      items: [
        { description: 'Filtros de Aire 20x25x1', quantity: 24, unit: 'pcs' },
        { description: 'Correas Tipo A', quantity: 6, unit: 'pcs' }
      ]
    },
    {
      id: 3,
      requestNumber: 'REQ-2024-003',
      projectName: 'Reparación Sistema Industrial',
      requestedBy: 'Miguel Torres',
      status: 'fulfilled',
      priority: 'low',
      requestDate: new Date('2024-09-24'),
      requiredDate: new Date('2024-09-28'),
      notes: 'Componentes para reparación de chiller',
      items: [
        { description: 'Compresor Scroll 10HP', quantity: 1, unit: 'pcs' },
        { description: 'Válvula de Expansión', quantity: 2, unit: 'pcs' }
      ]
    }
  ];

  // Mock inventory statistics
  const inventoryStats = {
    totalItems: 1247,
    totalValue: 2850000,
    lowStockItems: 23,
    outOfStockItems: 5,
    itemsChange: 5.2,
    valueChange: 12.8,
    lowStockChange: -15.3,
    outOfStockChange: -40.0,
    categories: {
      hvacEquipment: 435,
      refrigeration: 312,
      electrical: 248,
      tools: 150,
      others: 102
    }
  };

  // Filter inventory items based on current filters
  const filteredItems = inventoryItems?.filter(item => {
    if (filters?.search && !item?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !item?.itemCode?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
      return false;
    }
    if (filters?.category && item?.category !== filters?.category) return false;
    if (filters?.supplier && item?.supplier?.name !== filters?.supplier) return false;
    if (filters?.location && item?.location !== filters?.location) return false;
    if (filters?.minStock && item?.currentStock < parseInt(filters?.minStock)) return false;
    if (filters?.maxStock && item?.currentStock > parseInt(filters?.maxStock)) return false;
    
    if (filters?.status) {
      const stockStatus = item?.currentStock === 0 ? 'out-of-stock' :
                         item?.currentStock <= item?.reorderPoint ? 'low-stock' : 'in-stock';
      if (stockStatus !== filters?.status) return false;
    }
    
    if (filters?.quickFilter) {
      const stockStatus = item?.currentStock === 0 ? 'out-of-stock' :
                         item?.currentStock <= item?.reorderPoint ? 'low-stock' : 'in-stock';
      if (filters?.quickFilter !== stockStatus && filters?.quickFilter !== 'reserved') return false;
    }
    
    return true;
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      supplier: '',
      location: '',
      minStock: '',
      maxStock: '',
      quickFilter: ''
    });
  };

  const handleViewDetails = (item) => {
    console.log('View item details:', item);
  };

  const handleUpdateStock = (item) => {
    console.log('Update stock for:', item);
  };

  const handleCreatePO = (item) => {
    console.log('Create purchase order for:', item);
  };

  const handleApproveRequirement = (requirement) => {
    console.log('Approve requirement:', requirement);
  };

  const handleRejectRequirement = (requirement) => {
    console.log('Reject requirement:', requirement);
  };

  const handleDismissAlert = (alertId) => {
    console.log('Dismiss alert:', alertId);
  };

  const handleViewOrder = (order) => {
    console.log('View order:', order);
  };

  const handleApproveOrder = (order) => {
    console.log('Approve order:', order);
  };

  const handleCreateOrder = () => {
    console.log('Create new purchase order');
  };

  const handleExport = async () => {
    try {
      // Create CSV content
      const csvHeaders = ['Código', 'Descripción', 'Categoría', 'Stock Actual', 'Punto de Reorden', 'Ubicación', 'Proveedor'];
      const csvRows = inventoryItems?.map(item => [
        item?.itemCode,
        item?.description,
        item?.category,
        item?.currentStock,
        item?.reorderPoint,
        item?.location,
        item?.supplier?.name
      ]);

      const csvContent = [
        csvHeaders?.join(','),
        ...csvRows?.map(row => row?.join(','))
      ]?.join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventario-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Inventario exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar inventario:', error);
    }
  };

  const handleImportInventory = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = (e) => {
      const file = e?.target?.files?.[0];
      if (file) {
        console.log('Importando archivo:', file?.name);
        // In a real app, you would parse the file and add items
        // For now, simulate adding some sample items
        const sampleItems = [
          {
            id: Date.now() + 1,
            itemCode: 'IMP-001',
            description: 'Artículo Importado 1',
            specifications: 'Importado desde archivo CSV',
            category: 'Importados',
            currentStock: 10,
            reservedStock: 0,
            reorderPoint: 5,
            unit: 'pcs',
            supplier: { name: 'Proveedor Importado', contact: 'import@proveedor.com' },
            location: 'Almacén Principal',
            lastUpdated: new Date(),
            unitCost: 1000
          }
        ];
        setInventoryItems(prev => [...prev, ...sampleItems]);
        console.log('Archivo importado exitosamente');
      }
    };
    
    input?.click();
  };

  const handleAddNewItem = async (newItem) => {
    try {
      // Add the new item to the inventory
      setInventoryItems(prevItems => [...prevItems, newItem]);
      
      // Show success message or notification
      console.log('Nuevo artículo agregado exitosamente:', newItem);
      
      // If we're not on the inventory view, switch to it to show the new item
      if (activeView !== 'inventory') {
        setActiveView('inventory');
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding new item:', error);
      return Promise.reject(error);
    }
  };

  const handleOpenNewItemModal = () => {
    setShowNewItemModal(true);
  };

  const handleCloseNewItemModal = () => {
    setShowNewItemModal(false);
  };

  const viewTabs = [
    { id: 'overview', label: 'Resumen', icon: 'LayoutDashboard' },
    { id: 'inventory', label: 'Inventario', icon: 'Package' },
    { id: 'alerts', label: 'Alertas', icon: 'AlertTriangle' },
    { id: 'orders', label: 'Órdenes', icon: 'ShoppingCart' },
    { id: 'requirements', label: 'Requisiciones', icon: 'ClipboardList' }
  ];

  useEffect(() => {
    document.title = 'Gestión de Inventario - AireFlow Pro';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMenuOpen={mobileMenuOpen}
      />
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      } pt-16`}>
        <div className="p-6">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Gestión de Inventario
              </h1>
              <p className="text-muted-foreground">
                Control integral de partes, materiales y recursos para proyectos de Aire Acondicionado
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleImportInventory}
                iconName="Upload"
                iconSize={16}
              >
                Importar
              </Button>
              <Button
                variant="default"
                onClick={handleOpenNewItemModal}
                iconName="Plus"
                iconSize={16}
              >
                Nuevo Artículo
              </Button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
            {viewTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveView(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                  activeView === tab?.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
                {tab?.id === 'alerts' && stockAlerts?.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning text-warning-foreground">
                    {stockAlerts?.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content based on active view */}
          {activeView === 'overview' && (
            <InventoryStats stats={inventoryStats} />
          )}

          {activeView === 'inventory' && (
            <div className="space-y-6">
              <InventoryFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                onExport={handleExport}
                totalItems={inventoryItems?.length}
                filteredItems={filteredItems?.length}
              />
              <InventoryTable
                items={filteredItems}
                onViewDetails={handleViewDetails}
                onUpdateStock={handleUpdateStock}
                onCreatePO={handleCreatePO}
              />
            </div>
          )}

          {activeView === 'alerts' && (
            <StockAlerts
              alerts={stockAlerts}
              onCreatePO={handleCreatePO}
              onUpdateStock={handleUpdateStock}
              onDismissAlert={handleDismissAlert}
            />
          )}

          {activeView === 'orders' && (
            <PurchaseOrderPanel
              orders={purchaseOrders}
              onViewOrder={handleViewOrder}
              onApproveOrder={handleApproveOrder}
              onCreateOrder={handleCreateOrder}
            />
          )}

          {activeView === 'requirements' && (
            <MaterialRequirements
              requirements={materialRequirements}
              onApproveRequirement={handleApproveRequirement}
              onRejectRequirement={handleRejectRequirement}
              onCreatePO={handleCreatePO}
            />
          )}

          {/* New Item Modal */}
          <NewItemModal
            isOpen={showNewItemModal}
            onClose={handleCloseNewItemModal}
            onAddItem={handleAddNewItem}
          />
        </div>
      </main>
    </div>
  );
};

export default InventoryManagement;