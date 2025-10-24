import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InventoryPanel = ({ onCreatePurchaseOrder, onRequestMaterial, onCreateRequisition }) => {
  const [activeTab, setActiveTab] = useState('inventory');

  const inventoryItems = [
    {
      id: 1,
      name: 'Compresor Rotativo 5HP',
      sku: 'COMP-5HP-001',
      currentStock: 3,
      minStock: 5,
      maxStock: 15,
      unit: 'unidades',
      location: 'Almacén A-1',
      status: 'Bajo Stock',
      lastUpdated: '28/09/2024'
    },
    {
      id: 2,
      name: 'Filtro de Aire HEPA',
      sku: 'FILT-HEPA-002',
      currentStock: 25,
      minStock: 10,
      maxStock: 50,
      unit: 'unidades',
      location: 'Almacén B-2',
      status: 'En Stock',
      lastUpdated: '29/09/2024'
    },
    {
      id: 3,
      name: 'Refrigerante R-410A',
      sku: 'REF-410A-003',
      currentStock: 2,
      minStock: 8,
      maxStock: 20,
      unit: 'cilindros',
      location: 'Almacén C-1',
      status: 'Crítico',
      lastUpdated: '27/09/2024'
    },
    {
      id: 4,
      name: 'Termostato Digital',
      sku: 'TERM-DIG-004',
      currentStock: 15,
      minStock: 5,
      maxStock: 25,
      unit: 'unidades',
      location: 'Almacén A-2',
      status: 'En Stock',
      lastUpdated: '30/09/2024'
    }
  ];

  const materialRequests = [
    {
      id: 1,
      orderNumber: 'OT-2024-015',
      projectName: 'Torre Corporativa ABC',
      requestedBy: 'Carlos Mendoza',
      requestDate: '29/09/2024',
      status: 'Pendiente',
      items: [
        { name: 'Compresor Rotativo 5HP', quantity: 2, unit: 'unidades' },
        { name: 'Filtro de Aire HEPA', quantity: 8, unit: 'unidades' }
      ]
    },
    {
      id: 2,
      orderNumber: 'OT-2024-016',
      projectName: 'Hospital General San José',
      requestedBy: 'Ana García',
      requestDate: '30/09/2024',
      status: 'Aprobada',
      items: [
        { name: 'Refrigerante R-410A', quantity: 3, unit: 'cilindros' },
        { name: 'Termostato Digital', quantity: 5, unit: 'unidades' }
      ]
    }
  ];

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'Crítico': return 'bg-red-100 text-red-800';
      case 'Bajo Stock': return 'bg-orange-100 text-orange-800';
      case 'En Stock': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Aprobada': return 'bg-green-100 text-green-800';
      case 'Rechazada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'inventory' ?'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="Package" size={16} />
              <span>Inventario</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requests' ?'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="ClipboardList" size={16} />
              <span>Requisiciones</span>
            </div>
          </button>
        </div>
      </div>
      <div className="p-4">
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Estado del Inventario</h3>
              <Button
                variant="outline"
                size="sm"
                iconName="RefreshCw"
                iconSize={16}
              >
                Actualizar
              </Button>
            </div>

            <div className="space-y-3">
              {inventoryItems?.map((item) => (
                <div key={item?.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">{item?.name}</h4>
                      <p className="text-xs text-muted-foreground">SKU: {item?.sku}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item?.status)}`}>
                      {item?.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Stock Actual</p>
                      <p className="text-sm font-medium text-foreground">{item?.currentStock} {item?.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stock Mínimo</p>
                      <p className="text-sm font-medium text-foreground">{item?.minStock} {item?.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <Icon name="MapPin" size={12} className="inline mr-1" />
                      {item?.location}
                    </div>
                    {item?.status === 'Crítico' || item?.status === 'Bajo Stock' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCreatePurchaseOrder(item)}
                        iconName="ShoppingCart"
                        iconSize={14}
                      >
                        Ordenar
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Requisiciones de Material</h3>
              <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconSize={16}
                onClick={onCreateRequisition}
              >
                Nueva Requisición
              </Button>
            </div>

            <div className="space-y-3">
              {materialRequests?.map((request) => (
                <div key={request?.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">{request?.orderNumber}</h4>
                      <p className="text-xs text-muted-foreground">{request?.projectName}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequestStatusColor(request?.status)}`}>
                      {request?.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Materiales Solicitados:</p>
                    <ul className="space-y-1">
                      {request?.items?.map((item, index) => (
                        <li key={index} className="text-xs text-foreground flex items-center space-x-2">
                          <Icon name="Package" size={12} />
                          <span>{item?.name} - {item?.quantity} {item?.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <Icon name="User" size={12} className="inline mr-1" />
                      {request?.requestedBy} • {request?.requestDate}
                    </div>
                    <div className="flex items-center space-x-2">
                      {request?.status === 'Pendiente' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            iconName="X"
                            iconSize={14}
                          >
                            Rechazar
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onRequestMaterial(request)}
                            iconName="Check"
                            iconSize={14}
                          >
                            Aprobar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;