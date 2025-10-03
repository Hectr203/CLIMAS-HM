import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityFeatures = () => {
  const securityFeatures = [
    {
      icon: 'Lock',
      title: 'Encriptación de Extremo a Extremo',
      description: 'Todos los datos se transmiten de forma segura'
    },
    {
      icon: 'Shield',
      title: 'Autenticación Multifactor',
      description: 'Protección adicional para cuentas administrativas'
    },
    {
      icon: 'Eye',
      title: 'Monitoreo de Actividad',
      description: 'Registro completo de accesos y actividades'
    },
    {
      icon: 'Clock',
      title: 'Sesiones Seguras',
      description: 'Cierre automático por inactividad'
    }
  ];

  const complianceItems = [
    { name: 'LGPD México', status: 'Certificado' },
    { name: 'NOM-151-SCFI', status: 'Cumple' },
    { name: 'Facturación CFDI 4.0', status: 'Integrado' },
    { name: 'Backup Diario', status: 'Activo' }
  ];

  return (
    <div className="mt-8 space-y-6">
      {/* Security Features */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="ShieldCheck" size={20} className="text-success" />
          <h3 className="text-lg font-semibold text-foreground">Características de Seguridad</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityFeatures?.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-md">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name={feature?.icon} size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">{feature?.title}</h4>
                <p className="text-xs text-muted-foreground">{feature?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Compliance Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="FileCheck" size={20} className="text-success" />
          <h3 className="text-lg font-semibold text-foreground">Cumplimiento Normativo</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {complianceItems?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-md">
              <span className="text-sm font-medium text-foreground">{item?.name}</span>
              <div className="flex items-center space-x-1">
                <Icon name="CheckCircle" size={14} className="text-success" />
                <span className="text-xs text-success font-medium">{item?.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">Certificación ISO 27001</p>
              <p className="text-xs text-primary/80">
                Sistema de gestión de seguridad de la información certificado internacionalmente.
                Última auditoría: Septiembre {new Date()?.getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Support Information */}
      <div className="text-center text-xs text-muted-foreground">
        <p>¿Necesita ayuda? Contacte a soporte técnico:</p>
        <div className="flex items-center justify-center space-x-4 mt-2">
          <div className="flex items-center space-x-1">
            <Icon name="Phone" size={12} />
            <span>+52 (55) 1234-5678</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Mail" size={12} />
            <span>soporte@aireflowpro.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityFeatures;