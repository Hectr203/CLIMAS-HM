import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MaterialRequirements = ({ requirements, onApproveRequirement, onRejectRequirement, onCreatePO }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { id: 'pending', label: 'Pendientes', count: requirements?.filter(r => r?.status === 'pending')?.length },
    { id: 'approved', label: 'Aprobadas', count: requirements?.filter(r => r?.status === 'approved')?.length },
    { id: 'fulfilled', label: 'Cumplidas', count: requirements?.filter(r => r?.status === 'fulfilled')?.length }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10';
      case 'approved': return 'text-primary bg-primary/10';
      case 'fulfilled': return 'text-success bg-success/10';
      case 'rejected': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'fulfilled': return 'Cumplida';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })?.format(new Date(date));
  };

  const filteredRequirements = requirements?.filter(req => req?.status === activeTab);

  return (
    <div className="bg-card rounded-lg border border-border">
      
      {/* Header igual al de Órdenes */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="ClipboardList" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Requisiciones de Material</h3>
        </div>

        <Button
          variant="default"
          iconName="Plus"
          iconSize={16}
          onClick={() => console.log('Nueva Requisición')}
        >
          Nueva Requisición
        </Button>
      </div>

      {/* Tabs igual que en Ordenes */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-smooth ${
              activeTab === tab?.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span>{tab?.label}</span>
            {tab?.count > 0 && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === tab?.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }`}>
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LISTA con el MISMO estilo que Órdenes */}
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {filteredRequirements?.length === 0 ? (
          
          <div className="text-center py-8">
            <Icon name="ClipboardList" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay requisiciones {getStatusLabel(activeTab)?.toLowerCase()}</p>

            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              iconSize={16}
              onClick={() => console.log('Crear primera requisición')}
              className="mt-4"
            >
              Crear Primera Requisición
            </Button>
          </div>

        ) : (
          filteredRequirements?.map((req) => (
            <div key={req?.id} className="p-4 hover:bg-muted/50 transition-smooth">
              <div className="flex items-start justify-between">
                <div className="flex-1">

                  {/* Encabezado igual al de OC */}
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-foreground">{req?.requestNumber}</h4>

                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req?.status)}`}>
                      {getStatusLabel(req?.status)}
                    </span>

                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(req?.priority)} bg-background border border-current`}>
                      <Icon name="Flag" size={12} className="mr-1" />
                      {getPriorityLabel(req?.priority)}
                    </span>
                  </div>

                  {/* GRID igual al de OC */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                    <div>
                      <span className="font-medium">Proyecto:</span>
                      <div className="text-foreground">{req?.projectName}</div>
                    </div>
                    <div>
                      <span className="font-medium">Solicitante:</span>
                      <div className="text-foreground">{req?.requestedBy}</div>
                    </div>
                    <div>
                      <span className="font-medium">Fecha Solicitud:</span>
                      <div className="text-foreground">{formatDate(req?.requestDate)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Requerido:</span>
                      <div className="text-foreground">{formatDate(req?.requiredDate)}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-foreground mb-1">
                      Artículos Solicitados ({req?.items?.length}):
                    </div>

                    <div className="space-y-1">
                      {req?.items?.slice(0, 3)?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          <span>{item?.description}</span>
                          <span className="font-medium">{item?.quantity} {item?.unit}</span>
                        </div>
                      ))}

                      {req?.items?.length > 3 && (
                        <div className="text-xs text-muted-foreground px-2">
                          +{req?.items?.length - 3} artículos más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones IGUALES a las de OC */}
                  <div className="flex items-center space-x-2">

                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Eye"
                      iconSize={16}
                      onClick={() => console.log('Ver detalles', req)}
                    >
                      Ver Detalles
                    </Button>

                    {req?.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          iconName="Check"
                          iconSize={16}
                          onClick={() => onApproveRequirement(req)}
                        >
                          Aprobar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          iconName="X"
                          iconSize={16}
                          onClick={() => onRejectRequirement(req)}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}

                    {req?.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="ShoppingCart"
                        iconSize={16}
                        onClick={() => onCreatePO(req)}
                      >
                        Crear OC
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Download"
                      iconSize={16}
                      onClick={() => console.log('Descargar', req)}
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

export default MaterialRequirements;
