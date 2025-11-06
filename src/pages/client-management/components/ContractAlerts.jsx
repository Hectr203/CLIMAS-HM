import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContractAlerts = ({ contracts, onViewContract, onRenewContract, onScheduleRenewal }) => {
  const getAlertType = (contract) => {
    const today = new Date();
    const expirationDate = new Date(contract.expirationDate);
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'expiring';
    if (diffDays <= 90) return 'warning';
    return 'normal';
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'expired':
        return 'border-error bg-error/10';
      case 'expiring':
        return 'border-warning bg-warning/10';
      case 'warning':
        return 'border-accent bg-accent/10';
      default:
        return 'border-border bg-card';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'expired':
        return 'AlertTriangle';
      case 'expiring':
        return 'Clock';
      case 'warning':
        return 'AlertCircle';
      default:
        return 'FileCheck';
    }
  };

  const getAlertMessage = (contract) => {
    const today = new Date();
    const expirationDate = new Date(contract.expirationDate);
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Vencido hace ${Math.abs(diffDays)} días`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else if (diffDays <= 30) {
      return `Vence en ${diffDays} días`;
    } else if (diffDays <= 90) {
      return `Vence en ${diffDays} días`;
    }
    return 'Vigente';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    })?.format(amount);
  };

  // Filter contracts that need attention
  const alertContracts = contracts?.filter(contract => {
    const alertType = getAlertType(contract);
    return ['expired', 'expiring', 'warning']?.includes(alertType);
  });

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-foreground">Alertas de Contratos</h3>
          {alertContracts?.length > 0 && (
            <span className="px-2 py-1 text-xs bg-error text-error-foreground rounded-full">
              {alertContracts?.length}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/contract-management'}
          iconName="FileText"
          iconPosition="left"
        >
          Ver Todos
        </Button>
      </div>
  <div className="space-y-4 max-h-[350px] overflow-y-auto overflow-x-auto px-2" style={{minWidth: '100%', maxWidth: '100%'}}>
        {alertContracts?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
            <p className="text-muted-foreground">No hay contratos que requieran atención</p>
            <p className="text-sm text-muted-foreground mt-2">
              Todos los contratos están vigentes y actualizados
            </p>
          </div>
        ) : (
          alertContracts?.map((contract) => {
            const alertType = getAlertType(contract);
            return (
              <div
                key={contract?.id}
                className={`p-4 rounded-lg border-2 ${getAlertColor(alertType)} transition-smooth min-w-[400px] max-w-[600px] mx-auto`}
              >
                <div className="flex items-start justify-between flex-wrap">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alertType === 'expired' ? 'bg-error text-error-foreground' :
                      alertType === 'expiring' ? 'bg-warning text-warning-foreground' :
                      alertType === 'warning' ? 'bg-accent text-accent-foreground' :
                      'bg-primary text-primary-foreground'
                    }`}>
                      <Icon name={getAlertIcon(alertType)} size={20} />
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      alertType === 'expired' ? 'bg-error text-error-foreground' :
                      alertType === 'expiring' ? 'bg-warning text-warning-foreground' :
                      'bg-accent text-accent-foreground'
                    }`}>
                      {getAlertMessage(contract)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 ml-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-foreground">
                        {contract?.contractNumber}
                      </h4>
                      <span className="text-xs text-muted-foreground font-medium">
                        {contract?.clientName}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-1">
                      <span className="flex items-center gap-1"><Icon name="Calendar" size={12} />Inicio: {formatDate(contract?.startDate)}</span>
                      <span className="flex items-center gap-1"><Icon name="CalendarX" size={12} />Vence: {formatDate(contract?.expirationDate)}</span>
                      <span className="flex items-center gap-1"><Icon name="DollarSign" size={12} />Valor: {formatCurrency(contract?.value)}</span>
                    </div>
                    {contract?.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {contract?.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewContract(contract)}
                      title="Ver contrato"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onScheduleRenewal(contract)}
                      iconName="Calendar"
                      iconPosition="left"
                    >
                      Programar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onRenewContract(contract)}
                      iconName="RefreshCw"
                      iconPosition="left"
                    >
                      Renovar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-error">
              {contracts?.filter(c => getAlertType(c) === 'expired')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Vencidos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-warning">
              {contracts?.filter(c => getAlertType(c) === 'expiring')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Por Vencer</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-accent">
              {contracts?.filter(c => getAlertType(c) === 'warning')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Próximos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractAlerts;