import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'new-project',
      title: 'Nuevo Proyecto',
      description: 'Crear proyecto desde cotización',
      icon: 'Plus',
      color: 'bg-primary text-primary-foreground',
      path: '/project-management'
    },
    {
      id: 'approve-expenses',
      title: 'Aprobar Gastos',
      description: '3 solicitudes pendientes',
      icon: 'CheckCircle',
      color: 'bg-success text-success-foreground',
      badge: '3',
      path: '/financial-management'
    },
    {
      id: 'generate-report',
      title: 'Generar Reporte',
      description: 'Reportes financieros y operativos',
      icon: 'FileText',
      color: 'bg-accent text-accent-foreground',
      path: '/financial-management'
    },
    {
      id: 'inventory-check',
      title: 'Revisar Inventario',
      description: 'Stock bajo en 5 artículos',
      icon: 'Package',
      color: 'bg-warning text-warning-foreground',
      badge: '5',
      path: '/inventory-management'
    },
    {
      id: 'client-contact',
      title: 'Contactar Cliente',
      description: 'Seguimiento de propuestas',
      icon: 'Phone',
      color: 'bg-secondary text-secondary-foreground',
      path: '/client-management'
    },
    {
      id: 'schedule-maintenance',
      title: 'Programar Mantenimiento',
      description: 'Equipos requieren servicio',
      icon: 'Calendar',
      color: 'bg-muted text-foreground',
      path: '/work-order-processing'
    }
  ];

  const handleActionClick = (action) => {
    if (action?.path) {
      navigate(action?.path);
    }
  };

  const handleRefreshData = async () => {
    try {
  // console.log eliminado
      // Simulate refresh action
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would refetch data here
  // console.log eliminado
    } catch (error) {
      console.error('Error al actualizar datos:', error);
    }
  };

  const handleMoreOptions = () => {
  // console.log eliminado
    // Add dropdown menu or modal with additional options
  };

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Acciones Rápidas</h3>
            <p className="text-sm text-muted-foreground">Funciones críticas de acceso directo</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleMoreOptions}>
            <Icon name="MoreHorizontal" size={20} />
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions?.map((action) => (
            <button
              key={action?.id}
              onClick={() => handleActionClick(action)}
              className="p-4 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action?.color} group-hover:scale-110 transition-transform`}>
                  <Icon name={action?.icon} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-smooth">
                      {action?.title}
                    </h4>
                    {action?.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-error text-error-foreground rounded-full">
                        {action?.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{action?.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Última actualización: 30/09/2024 00:23</span>
          <Button 
            variant="ghost" 
            size="sm" 
            iconName="RefreshCw" 
            iconPosition="left"
            onClick={handleRefreshData}
          >
            Actualizar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;