import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const ClientCard = ({ client, onViewDetails, onEditClient, onViewProjects, onViewContracts }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo':
        return 'bg-success text-success-foreground';
      case 'Inactivo':
        return 'bg-error text-error-foreground';
      case 'Pendiente':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'Excelente':
        return 'text-success';
      case 'Buena':
        return 'text-primary';
      case 'Regular':
        return 'text-warning';
      case 'Mala':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
  <div className="bg-card border border-border rounded-lg p-6 card-shadow hover:shadow-md transition-smooth flex flex-col h-full min-w-[340px] max-w-[440px] max-h-[480px] min-h-[340px] overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Building2" size={24} color="white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground truncate w-full max-w-full">{String(client?.companyName || '')}</h3>
            <p className="text-sm text-muted-foreground truncate w-full max-w-full">{String(client?.industry || '')}</p>
            <div className="flex items-center space-x-2 mt-1 flex-wrap">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(client?.status)} truncate max-w-[90px]`}>
                {String(client?.status || '')}
              </span>
              <span className={`text-xs font-medium ${getHealthColor(client?.relationshipHealth)} truncate max-w-[90px]`}>
                Relación: {String(client?.relationshipHealth || '')}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewDetails(client)}
          title="Ver detalles"
        >
          <Icon name="MoreVertical" size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div className="space-y-2 min-w-0">
      <div className="flex items-center space-x-2">
        <Icon name="User" size={16} className="text-muted-foreground" />
        <span className="text-sm text-foreground truncate max-w-full">{String(client?.contactPerson || '')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Icon name="Mail" size={16} className="text-muted-foreground" />
        <span className="text-sm text-foreground truncate max-w-full">{String(client?.email || '')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Icon name="Phone" size={16} className="text-muted-foreground" />
        <span className="text-sm text-foreground truncate max-w-full">{String(client?.phone || '')}</span>
      </div>
    </div>
        <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Icon name="MapPin" size={16} className="text-muted-foreground" />
        <span className="text-sm text-foreground truncate max-w-full">{String(client?.location || '')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Icon name="Calendar" size={16} className="text-muted-foreground" />
        <span className="text-sm text-foreground truncate max-w-full">Cliente desde: {String(client?.clientSince || '')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Icon name="FileText" size={16} className="text-muted-foreground" />
        <span className="text-sm text-foreground truncate max-w-full">RFC: {String(client?.rfc || '')}</span>
      </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
    <div className="grid grid-cols-3 gap-4 min-w-0">
      <div className="flex flex-col items-center">
        <div className="text-lg font-semibold text-foreground">{Number(client?.totalProjects) || 0}</div>
        <div className="text-xs text-muted-foreground">Proyectos</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-lg font-semibold text-foreground">{Number(client?.activeContracts) || 0}</div>
        <div className="text-xs text-muted-foreground">Contratos</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-lg font-semibold text-success">${Number(client?.totalValue) ? Number(client?.totalValue).toLocaleString('es-MX') : '0'}</div>
        <div className="text-xs text-muted-foreground">Valor Total</div>
      </div>
    </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProjects(client)}
            iconName="FolderOpen"
            iconPosition="left"
          >
            Proyectos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewContracts(client)}
            iconName="FileText"
            iconPosition="left"
          >
            Contratos
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onEditClient(client)}
            iconName="Edit"
            iconPosition="left"
          >
            Editar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;