import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PurchaseOrderPanel = ({ orders, onViewOrder, onApproveOrder, onCreateOrder }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { id: 'pending', label: 'Pendientes', count: orders?.filter(o => o?.status === 'pending')?.length },
    { id: 'approved', label: 'Aprobadas', count: orders?.filter(o => o?.status === 'approved')?.length },
    { id: 'received', label: 'Recibidas', count: orders?.filter(o => o?.status === 'received')?.length }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10';
      case 'approved': return 'text-primary bg-primary/10';
      case 'received': return 'text-success bg-success/10';
      case 'cancelled': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'received': return 'Recibida';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })?.format(new Date(date));
  };

  const filteredOrders = orders?.filter(order => order?.status === activeTab);

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="ShoppingCart" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Órdenes de Compra</h3>
        </div>
        
        <Button
          variant="default"
          onClick={onCreateOrder}
          iconName="Plus"
          iconSize={16}
        >
          Nueva Orden
        </Button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-smooth ${
              activeTab === tab?.id
                ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span>{tab?.label}</span>
            {tab?.count > 0 && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === tab?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Orders List */}
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {filteredOrders?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="ShoppingCart" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay órdenes {getStatusLabel(activeTab)?.toLowerCase()}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateOrder}
              iconName="Plus"
              iconSize={16}
              className="mt-4"
            >
              Crear Primera Orden
            </Button>
          </div>
        ) : (
          filteredOrders?.map((order) => (
            <div key={order?.id} className="p-4 hover:bg-muted/50 transition-smooth">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-foreground">{order?.orderNumber}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order?.status)}`}>
                      {getStatusLabel(order?.status)}
                    </span>
                    {order?.urgent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                        <Icon name="AlertCircle" size={12} className="mr-1" />
                        Urgente
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                    <div>
                      <span className="font-medium">Proveedor:</span>
                      <div className="text-foreground">{order?.supplier}</div>
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>
                      <div className="text-foreground">{formatDate(order?.orderDate)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>
                      <div className="text-foreground font-medium">{formatCurrency(order?.total)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Artículos:</span>
                      <div className="text-foreground">{order?.itemCount} artículos</div>
                    </div>
                  </div>
                  
                  {order?.expectedDelivery && (
                    <div className="text-xs text-muted-foreground mb-3">
                      Entrega esperada: {formatDate(order?.expectedDelivery)}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOrder(order)}
                      iconName="Eye"
                      iconSize={16}
                    >
                      Ver Detalles
                    </Button>
                    
                    {order?.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApproveOrder(order)}
                        iconName="Check"
                        iconSize={16}
                      >
                        Aprobar
                      </Button>
                    )}
                    
                    {order?.status === 'approved' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Track order:', order)}
                        iconName="Truck"
                        iconSize={16}
                      >
                        Rastrear
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Download order:', order)}
                      iconName="Download"
                      iconSize={16}
                    >
                      Descargar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderPanel;