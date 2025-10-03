import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ComplianceDashboard = ({ complianceData, onViewDetails, onScheduleTraining }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-error';
      case 'warning': return 'text-warning';
      case 'good': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'critical': return 'bg-error/10 border-error/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'good': return 'bg-success/10 border-success/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  const ComplianceCard = ({ title, value, total, status, icon, description, action }) => (
    <div className={`p-4 rounded-lg border ${getStatusBg(status)} transition-smooth hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusBg(status)}`}>
            <Icon name={icon} size={20} className={getStatusColor(status)} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">
            {value}
            {total && <span className="text-sm text-muted-foreground">/{total}</span>}
          </div>
          {total && (
            <div className="text-xs text-muted-foreground">
              {Math.round((value / total) * 100)}%
            </div>
          )}
        </div>
      </div>
      
      {action && (
        <Button
          variant="ghost"
          size="sm"
          onClick={action?.onClick}
          iconName={action?.icon}
          iconPosition="left"
          iconSize={14}
          className="w-full mt-2"
        >
          {action?.label}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComplianceCard
          title="Estudios Médicos"
          value={complianceData?.medicalStudies?.expired}
          total={complianceData?.medicalStudies?.total}
          status={complianceData?.medicalStudies?.expired > 5 ? 'critical' : complianceData?.medicalStudies?.expired > 2 ? 'warning' : 'good'}
          icon="Heart"
          description="Vencidos este mes"
          action={{
            label: 'Ver Detalles',
            icon: 'Eye',
            onClick: () => onViewDetails('medical')
          }}
        />

        <ComplianceCard
          title="EPP Asignado"
          value={complianceData?.ppe?.assigned}
          total={complianceData?.ppe?.total}
          status={complianceData?.ppe?.assigned < complianceData?.ppe?.total * 0.9 ? 'warning' : 'good'}
          icon="Shield"
          description="Equipos asignados"
          action={{
            label: 'Gestionar EPP',
            icon: 'Settings',
            onClick: () => onViewDetails('ppe')
          }}
        />

        <ComplianceCard
          title="Capacitaciones"
          value={complianceData?.training?.pending}
          total={complianceData?.training?.total}
          status={complianceData?.training?.pending > 10 ? 'critical' : complianceData?.training?.pending > 5 ? 'warning' : 'good'}
          icon="GraduationCap"
          description="Pendientes"
          action={{
            label: 'Programar',
            icon: 'Calendar',
            onClick: () => onScheduleTraining()
          }}
        />

        <ComplianceCard
          title="Documentos"
          value={complianceData?.documents?.missing}
          total={complianceData?.documents?.total}
          status={complianceData?.documents?.missing > 3 ? 'critical' : complianceData?.documents?.missing > 1 ? 'warning' : 'good'}
          icon="FileText"
          description="Faltantes"
          action={{
            label: 'Revisar',
            icon: 'Search',
            onClick: () => onViewDetails('documents')
          }}
        />
      </div>
      {/* Alerts Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <span>Alertas de Cumplimiento</span>
          </h3>
          <Button
            variant="ghost"
            size="sm"
            iconName="Settings"
            iconPosition="left"
            iconSize={16}
          >
            Configurar Alertas
          </Button>
        </div>

        <div className="space-y-3">
          {complianceData?.alerts?.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getStatusBg(alert?.priority)} flex items-start justify-between`}>
              <div className="flex items-start space-x-3">
                <Icon 
                  name={alert?.priority === 'critical' ? 'AlertCircle' : alert?.priority === 'warning' ? 'Clock' : 'Info'} 
                  size={20} 
                  className={getStatusColor(alert?.priority)}
                />
                <div>
                  <h4 className="text-sm font-medium text-foreground">{alert?.title}</h4>
                  <p className="text-sm text-muted-foreground">{alert?.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert?.date}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(alert?.type)}
                iconName="ChevronRight"
                iconSize={16}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Personal Activo</h4>
              <p className="text-xs text-muted-foreground">Total empleados</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{complianceData?.totalEmployees}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Cumplimiento</h4>
              <p className="text-xs text-muted-foreground">Promedio general</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{complianceData?.overallCompliance}%</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Icon name="Calendar" size={20} className="text-accent" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Próximos Vencimientos</h4>
              <p className="text-xs text-muted-foreground">En 30 días</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{complianceData?.upcomingExpirations}</div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;