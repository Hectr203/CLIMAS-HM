import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StockAlerts = ({ alerts, onCreatePO, onUpdateStock, onDismissAlert }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'out-of-stock': return 'AlertCircle';
      case 'low-stock': return 'AlertTriangle';
      case 'overstock': return 'TrendingUp';
      case 'expired': return 'Clock';
      default: return 'Info';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'out-of-stock': return 'text-error';
      case 'low-stock': return 'text-warning';
      case 'overstock': return 'text-primary';
      case 'expired': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  const getAlertBgColor = (type) => {
    switch (type) {
      case 'out-of-stock': return 'bg-error/10 border-error/20';
      case 'low-stock': return 'bg-warning/10 border-warning/20';
      case 'overstock': return 'bg-primary/10 border-primary/20';
      case 'expired': return 'bg-muted border-border';
      default: return 'bg-background border-border';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  if (alerts?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="CheckCircle" size={20} className="text-success" />
          <h3 className="text-lg font-semibold text-foreground">Alertas de Stock</h3>
        </div>
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
          <p className="text-muted-foreground">No hay alertas de stock pendientes</p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos los artículos están dentro de los niveles normales
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Alertas de Stock</h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            {alerts?.length} Alertas
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => alerts?.forEach(alert => onDismissAlert(alert?.id))}
          iconName="X"
          iconSize={16}
        >
          Descartar Todas
        </Button>
      </div>
      {/* Alerts List */}
      <div className="divide-y divide-border">
        {alerts?.map((alert) => (
          <div key={alert?.id} className={`p-4 ${getAlertBgColor(alert?.type)}`}>
            <div className="flex items-start space-x-4">
              <Icon 
                name={getAlertIcon(alert?.type)} 
                size={20} 
                className={`flex-shrink-0 mt-0.5 ${getAlertColor(alert?.type)}`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{alert?.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{alert?.message}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground mb-3">
                      <div>
                        <span className="font-medium">Código:</span> {alert?.itemCode}
                      </div>
                      <div>
                        <span className="font-medium">Stock Actual:</span> {alert?.currentStock} {alert?.unit}
                      </div>
                      <div>
                        <span className="font-medium">Punto Reorden:</span> {alert?.reorderPoint} {alert?.unit}
                      </div>
                      <div>
                        <span className="font-medium">Proveedor:</span> {alert?.supplier}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Generada: {formatDate(alert?.createdAt)}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismissAlert(alert?.id)}
                    iconName="X"
                    iconSize={16}
                    className="ml-2"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-3">
                  {(alert?.type === 'out-of-stock' || alert?.type === 'low-stock') && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onCreatePO(alert)}
                      iconName="ShoppingCart"
                      iconSize={16}
                    >
                      Crear Orden de Compra
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStock(alert)}
                    iconName="Edit"
                    iconSize={16}
                  >
                    Actualizar Stock
                  </Button>
                  
                  {alert?.type === 'overstock' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Transfer stock:', alert)}
                      iconName="ArrowRightLeft"
                      iconSize={16}
                    >
                      Transferir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockAlerts;