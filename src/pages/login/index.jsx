import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDefaultPath } from '../../utils/auth';
import useAuth from '../../hooks/useAuth';
import CompanyBranding from './components/CompanyBranding';
import LoginForm from './components/LoginForm';
import CredentialsHelper from './components/CredentialsHelper';
import SecurityFeatures from './components/SecurityFeatures';

const LoginPage = () => {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      const defaultPath = getDefaultPath(user.rol);
      navigate(defaultPath, { replace: true });
    }
    document.title = 'Iniciar Sesión - AireFlow Pro';
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Company Branding */}
            <CompanyBranding />
            
            {/* Login Form */}
            <div className="bg-card border border-border rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Bienvenido de Nuevo</h2>
                <p className="text-muted-foreground">
                  Ingrese sus credenciales para acceder al sistema
                </p>
              </div>
              
              <LoginForm />
            </div>

            {/* Demo Credentials Helper */}
            <CredentialsHelper />
          </div>
        </div>

        {/* Right Panel - Security Features */}
        <div className="lg:w-1/2 bg-card border-l border-border p-6 lg:p-12 overflow-y-auto">
          <div className="max-w-lg mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Plataforma Empresarial Segura
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                AireFlow Pro es la solución integral para la gestión de empresas HVAC, 
                diseñada específicamente para el mercado mexicano con cumplimiento 
                normativo completo y características de seguridad empresarial.
              </p>
            </div>

            <SecurityFeatures />
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <span>© {new Date()?.getFullYear()} AireFlow Pro. Todos los derechos reservados.</span>
            <span className="hidden sm:inline">|</span>
            <span>Versión 2.1.4</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-foreground transition-smooth">
              Política de Privacidad
            </button>
            <span>|</span>
            <button className="hover:text-foreground transition-smooth">
              Términos de Uso
            </button>
            <span>|</span>
            <button className="hover:text-foreground transition-smooth">
              Soporte Técnico
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;