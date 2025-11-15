import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InventoryStats = ({ stats, items, onAddItem, onUpdateStock, onGenerateReport }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX')?.format(number);
  };

  const statCards = [
    {
      title: 'Total de Artículos',
      value: formatNumber(stats?.totalItems),
      change: stats?.itemsChange,
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Valor del Inventario',
      value: formatCurrency(stats?.totalValue),
      change: stats?.valueChange,
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Stock Bajo',
      value: formatNumber(stats?.lowStockItems),
      change: stats?.lowStockChange,
      icon: 'AlertTriangle',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Agotados',
      value: formatNumber(stats?.outOfStockItems),
      change: stats?.outOfStockChange,
      icon: 'AlertCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    }
  ];

  const categoryStats = [
    { name: 'Equipos HVAC', value: stats?.categories?.hvacEquipment, percentage: 35 },
    { name: 'Refrigeración', value: stats?.categories?.refrigeration, percentage: 25 },
    { name: 'Eléctricos', value: stats?.categories?.electrical, percentage: 20 },
    { name: 'Herramientas', value: stats?.categories?.tools, percentage: 12 },
    { name: 'Otros', value: stats?.categories?.others, percentage: 8 }
  ];

  const getChangeColor = (change) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat?.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
                {stat?.change !== undefined && (
                  <div className={`flex items-center space-x-1 mt-2 ${getChangeColor(stat?.change)}`}>
                    <Icon name={getChangeIcon(stat?.change)} size={16} />
                    <span className="text-sm font-medium">
                      {Math.abs(stat?.change)}% vs mes anterior
                    </span>
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat?.bgColor}`}>
                <Icon name={stat?.icon} size={24} className={stat?.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Category Distribution */}
      {/* TODO: Habilitar más adelante cuando se implemente completamente */}
      {/* <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="PieChart" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Distribución por Categoría</h3>
        </div>
        
        <div className="space-y-4">
          {categoryStats?.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-3 h-3 rounded-full bg-primary" style={{
                  backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                }} />
                <span className="text-sm font-medium text-foreground">{category?.name}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${category?.percentage}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-16 text-right">
                  {formatNumber(category?.value)}
                </span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {category?.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div> */}
      
      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="Zap" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Acciones Rápidas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="default"
            onClick={onAddItem}
            className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg w-full hover:bg-muted/80"
          >
            <Icon name="Plus" size={20} className="text-primary" />
            <div className="text-left">
              <div className="font-medium text-sm text-foreground">Agregar Artículo</div>
              <div className="text-xs text-muted-foreground">Registrar nuevo producto</div>
            </div>
          </Button>
          
          <Button
            variant="default"
            onClick={() => {
              const firstItem = items?.[0];
              if (firstItem && onUpdateStock) {
                onUpdateStock(firstItem);
              }
            }}
            disabled={!items || items.length === 0}
            className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg w-full hover:bg-muted/80"
          >
            <Icon name="RefreshCw" size={20} className="text-success" />
            <div className="text-left">
              <div className="font-medium text-sm text-foreground">Actualizar Stock</div>
              <div className="text-xs text-muted-foreground">Ajustar inventario</div>
            </div>
          </Button>
          
          <Button
            variant="default"
            onClick={onGenerateReport}
            disabled={!items || items.length === 0}
            className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg w-full hover:bg-muted/80"
          >
            <Icon name="FileText" size={20} className="text-warning" />
            <div className="text-left">
              <div className="font-medium text-sm text-foreground">Generar Reporte</div>
              <div className="text-xs text-muted-foreground">Exportar datos</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;