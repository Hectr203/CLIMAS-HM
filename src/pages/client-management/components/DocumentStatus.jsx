import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentStatus = ({ documents, onUploadDocument, onViewDocument, onDownloadDocument }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completo':
        return 'bg-success text-success-foreground';
      case 'Pendiente':
        return 'bg-warning text-warning-foreground';
      case 'Vencido':
        return 'bg-error text-error-foreground';
      case 'En Revisión':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'RFC':
        return 'FileText';
      case 'Contrato':
        return 'FileCheck';
      case 'Garantía':
        return 'Shield';
      case 'Facturación':
        return 'Receipt';
      case 'Identificación':
        return 'CreditCard';
      default:
        return 'File';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expiry = new Date(expirationDate);
    return expiry < today;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Estado de Documentos</h3>
        <Button
          variant="default"
          size="sm"
          onClick={onUploadDocument}
          iconName="Upload"
          iconPosition="left"
        >
          Subir Documento
        </Button>
      </div>
      <div className="space-y-4">
        {documents?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay documentos registrados</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadDocument}
              className="mt-4"
              iconName="Upload"
              iconPosition="left"
            >
              Subir Primer Documento
            </Button>
          </div>
        ) : (
          documents?.map((doc) => (
            <div key={doc?.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-smooth">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name={getDocumentIcon(doc?.type)} size={20} className="text-muted-foreground" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground">{doc?.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc?.status)}`}>
                      {doc?.status}
                    </span>
                    {isExpiringSoon(doc?.expirationDate) && (
                      <span className="px-2 py-1 text-xs bg-warning text-warning-foreground rounded-full">
                        Por Vencer
                      </span>
                    )}
                    {isExpired(doc?.expirationDate) && (
                      <span className="px-2 py-1 text-xs bg-error text-error-foreground rounded-full">
                        Vencido
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Tipo: {doc?.type}</span>
                    <span>Subido: {formatDate(doc?.uploadDate)}</span>
                    {doc?.expirationDate && (
                      <span>Vence: {formatDate(doc?.expirationDate)}</span>
                    )}
                  </div>
                  
                  {doc?.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {doc?.notes}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDocument(doc)}
                  title="Ver documento"
                >
                  <Icon name="Eye" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadDocument(doc)}
                  title="Descargar documento"
                >
                  <Icon name="Download" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUploadDocument(doc)}
                  title="Actualizar documento"
                >
                  <Icon name="Upload" size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Document Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-success">
              {documents?.filter(d => d?.status === 'Completo')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Completos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-warning">
              {documents?.filter(d => d?.status === 'Pendiente')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-error">
              {documents?.filter(d => isExpired(d?.expirationDate))?.length}
            </div>
            <div className="text-xs text-muted-foreground">Vencidos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">
              {documents?.filter(d => isExpiringSoon(d?.expirationDate))?.length}
            </div>
            <div className="text-xs text-muted-foreground">Por Vencer</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatus;