import React from 'react';
import AppImage from '../../../components/AppImage';

const CompanyBranding = () => {
  return (
    <div className="text-center mb-8">
      {/* Company Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 flex items-center justify-center">
          <AppImage
            src="assets/images/WhatsApp_Image_2025-09-24_at_8.13.50_PM-1759346787603.jpeg"
            alt="CLIMAS H.M. Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Company Name and Tagline */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">CLIMAS H.M.</h1>
        <p className="text-lg text-muted-foreground mb-1">Sistema de Gestión de Aire Acondicionado</p>
        <p className="text-sm text-muted-foreground">Plataforma Empresarial Integral</p>
      </div>

      {/* Trust Signals */}
      <div className="flex flex-col items-center space-y-3">
        {/* Security Badge */}
        <div className="flex items-center space-x-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
          <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
            <span className="text-success text-xs">✓</span>
          </div>
          <span className="text-sm font-medium text-success">Conexión Segura SSL</span>
        </div>

        {/* Compliance Indicators */}
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span>Cumplimiento SAT</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span>ISO 27001</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span>CFDI 4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyBranding;