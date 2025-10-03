import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CredentialsHelper = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mockCredentials = [
    { role: 'Administrador', email: 'admin@aireflowpro.com', password: 'Admin123!' },
    { role: 'Gerente de Proyecto', email: 'proyecto@aireflowpro.com', password: 'Proyecto123!' },
    { role: 'Representante de Ventas', email: 'ventas@aireflowpro.com', password: 'Ventas123!' },
    { role: 'Supervisor de Taller', email: 'taller@aireflowpro.com', password: 'Taller123!' },
    { role: 'Controlador Financiero', email: 'finanzas@aireflowpro.com', password: 'Finanzas123!' },
    { role: 'Gerente de RH', email: 'personal@aireflowpro.com', password: 'Personal123!' }
  ];

  return (
    <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-0 h-auto"
      >
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Credenciales de Demostración</span>
        </div>
        <Icon 
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
          size={16} 
          className="text-muted-foreground"
        />
      </Button>
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground mb-3">
            Use estas credenciales para acceder a diferentes módulos del sistema:
          </p>
          
          <div className="grid gap-2">
            {mockCredentials?.map((cred, index) => (
              <div key={index} className="p-3 bg-card border border-border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">{cred?.role}</span>
                  <Icon name="User" size={12} className="text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">{cred?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Key" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">{cred?.password}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-md">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={14} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning">
                Estas son credenciales de demostración. En producción, use sus credenciales reales.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialsHelper;