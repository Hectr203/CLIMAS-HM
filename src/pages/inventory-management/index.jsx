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
import useInventory from '../../hooks/useInventory';

const InventoryManagement = () => {
  const { articulos, getArticulos, loading, error } = useInventory();
  
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

  // Transformar los artículos del backend al formato esperado por los componentes
  const inventoryItems = React.useMemo(() => {
    return articulos.map(articulo => ({
      id: articulo.id,
      itemCode: articulo.codigoArticulo,
      description: articulo.descripcion,
      specifications: articulo.especificaciones || 'Sin especificaciones',
      category: articulo.categoria,
      currentStock: articulo.stockActual,
      reservedStock: articulo.stockReservado || 0,
      reorderPoint: articulo.puntoReorden,
      unit: articulo.unidad,
      supplier: {
        name: articulo.proveedor?.nombre || articulo.nombreProveedor || 'Sin proveedor',
        contact: articulo.proveedor?.contacto || articulo.contactoProveedor || 'Sin contacto'
      },
      location: articulo.ubicacion,
      lastUpdated: new Date(articulo.fechaActualizacion || articulo.fechaCreacion),
      unitCost: articulo.costoUnitario,
      notes: articulo.notas
    }));
  }, [articulos]);

  // Generar alertas dinámicas basadas en los artículos reales
  const stockAlerts = React.useMemo(() => {
    return inventoryItems
      .filter(item => {
        const currentStock = item.currentStock || 0;
        const reorderPoint = item.reorderPoint || 0;
        return currentStock === 0 || currentStock <= reorderPoint;
      })
      .map((item, index) => {
        const currentStock = item.currentStock || 0;
        const reorderPoint = item.reorderPoint || 0;
        const description = item.description || 'Artículo sin descripción';
        const itemCode = item.itemCode || 'Sin código';
        const unit = item.unit || 'pcs';
        const supplierName = item.supplier?.name || 'Sin proveedor';
        
        return {
          id: index + 1,
          type: currentStock === 0 ? 'out-of-stock' : 'low-stock',
          title: currentStock === 0 
            ? `${description} Agotado`
            : `${description} en Stock Bajo`,
          message: currentStock === 0
            ? `El artículo ${itemCode} está completamente agotado.`
            : `Solo quedan ${currentStock} ${unit} disponibles, por debajo del punto de reorden de ${reorderPoint} ${unit}.`,
          itemCode: itemCode,
          currentStock: currentStock,
          reorderPoint: reorderPoint,
          unit: unit,
          supplier: supplierName,
          createdAt: new Date()
        };
      });
  }, [inventoryItems]);

  // Purchase orders - to be implemented with backend
  const purchaseOrders = [];

  // Material requirements - to be implemented with backend
  const materialRequirements = [];

  // Calcular estadísticas dinámicas basadas en los artículos reales
  const inventoryStats = React.useMemo(() => {
    const totalItems = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => {
      const unitCost = item.unitCost || 0;
      const currentStock = item.currentStock || 0;
      return sum + (unitCost * currentStock);
    }, 0);
    const lowStockItems = inventoryItems.filter(item => {
      const currentStock = item.currentStock || 0;
      const reorderPoint = item.reorderPoint || 0;
      return currentStock > 0 && currentStock <= reorderPoint;
    }).length;
    const outOfStockItems = inventoryItems.filter(item => (item.currentStock || 0) === 0).length;
    
    // Agrupar por categorías
    const categoryGroups = inventoryItems.reduce((acc, item) => {
      if (item.category) {
        const category = item.category.toLowerCase().replace(/\s+/g, '');
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      itemsChange: 0, // Podrías implementar lógica para calcular cambios
      valueChange: 0,
      lowStockChange: 0,
      outOfStockChange: 0,
      categories: categoryGroups
    };
  }, [inventoryItems]);

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
      // El artículo ya fue creado en el backend por el NewItemModal
      // Solo necesitamos refrescar la lista de artículos
      await getArticulos();
      
      // If we're not on the inventory view, switch to it to show the new item
      if (activeView !== 'inventory') {
        setActiveView('inventory');
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error refreshing inventory after adding new item:', error);
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

  // Cargar artículos al montar el componente
  useEffect(() => {
    getArticulos();
  }, [getArticulos]);

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