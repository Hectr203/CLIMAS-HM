import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VersionControl = ({ quotation, onVersionSelect }) => {
  // Mock version history
  const versionHistory = [
    {
      version: 3,
      createdAt: '2024-03-25T16:30:00Z',
      createdBy: 'Ana Rodríguez',
      changes: 'Ajuste en precios de materiales según comentarios del cliente',
      status: 'current',
      total: quotation?.calculations?.total
    },
    {
      version: 2,
      createdAt: '2024-03-24T10:15:00Z',
      createdBy: 'Carlos Martínez',
      changes: 'Reducción en porcentaje de viáticos de 12% a 8%',
      status: 'superseded',
      total: (quotation?.calculations?.total || 0) + 15000
    },
    {
      version: 1,
      createdAt: '2024-03-20T14:45:00Z',
      createdBy: 'Sistema',
      changes: 'Versión inicial generada automáticamente',
      status: 'superseded',
      total: (quotation?.calculations?.total || 0) + 25000
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'superseded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'current': return 'Actual';
      case 'superseded': return 'Anterior';
      default: return 'Borrador';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Control de Versiones</h3>
        <Button
          variant="outline"
          size="sm"
          iconName="GitBranch"
          iconPosition="left"
        >
          Nueva Versión
        </Button>
      </div>

      <div className="space-y-4">
        {versionHistory?.map((version) => (
          <div
            key={version?.version}
            className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
              version?.status === 'current' ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => onVersionSelect?.(version)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(version?.status)}`}>
                  v{version?.version}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  version?.status === 'current' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getStatusLabel(version?.status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${version?.total?.toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-500">
                  {new Date(version?.createdAt)?.toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-sm text-gray-900">{version?.changes}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="User" size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600">{version?.createdBy}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={14} className="text-gray-400" />
                <span className="text-xs text-gray-600">
                  {new Date(version?.createdAt)?.toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>

            {version?.status === 'current' && (
              <div className="mt-3 pt-3 border-t border-primary/20">
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Icon name="CheckCircle" size={12} className="text-green-600" />
                    <span className="text-green-600">Versión activa</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Download" size={12} className="text-blue-600" />
                    <span className="text-blue-600">PDF disponible</span>
                  </div>
                  {quotation?.communication?.sentAt && (
                    <div className="flex items-center space-x-1">
                      <Icon name="Send" size={12} className="text-purple-600" />
                      <span className="text-purple-600">Enviada al cliente</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Version Control Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Control de Versiones Colaborativo</p>
            <p>El sistema mantiene un historial completo de cambios para facilitar la colaboración en tiempo real y el seguimiento de ajustes basados en feedback del cliente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionControl;