import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();

  const pathMapping = {
    '/main-dashboard': { label: 'Panel', icon: 'LayoutDashboard' },
    '/project-management': { label: 'Gestión de proyectos', icon: 'FolderOpen' },
    '/work-order-processing': { label: 'Procesamiento de órdenes de trabajo', icon: 'ClipboardList' },
    '/financial-management': { label: 'Gestión Financiera', icon: 'DollarSign' },
    '/client-management': { label: 'Gestión de Clientes', icon: 'Users' },
    '/personnel-management': { label: 'Gestión de personal', icon: 'UserCheck' },
    '/inventory-management': { label: 'Gestión de inventario', icon: 'Package' },
    '/user-management': { label: 'Gestión de Usuarios', icon: 'Users' },
    '/sales-opportunity-management': { label: 'Oportunidades de Venta', icon: 'TrendingUp' },
    '/quotation-builder': { label: 'Creación de Cotizaciones', icon: 'FileText' },
    '/quotation-development-center': { label: 'Centro de Desarrollo de Cotizaciones', icon: 'FileEdit' },
    '/sales-execution-monitoring': { label: 'Monitoreo de Ejecución de Ventas', icon: 'BarChart' },
    '/workshop-operations-center': { label: 'Centro de Operaciones de Taller', icon: 'Wrench' },
    '/workshop-operations-management': { label: 'Gestión de Operaciones de Taller', icon: 'Settings' },
    '/project-workflow-management': { label: 'Gestión de Flujo de Trabajo', icon: 'GitBranch' },
    '/project-documentation-center': { label: 'Centro de Documentación', icon: 'FolderOpen' },
    '/project-gallery-viewer': { label: 'Galería de Proyectos', icon: 'Image' },
    '/project-detail-gallery': { label: 'Detalles de Galería', icon: 'Images' },
    '/project-abonos-management': { label: 'Gestión de Abonos', icon: 'CreditCard' }
  };

  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [{ label: 'Dashboard', path: '/main-dashboard', icon: 'Home' }];

    if (location?.pathname !== '/main-dashboard') {
      const currentPath = location?.pathname;
      const currentPage = pathMapping?.[currentPath];
      
      if (currentPage) {
        breadcrumbs?.push({
          label: currentPage?.label,
          path: currentPath,
          icon: currentPage?.icon,
          current: true
        });
      }
    } else {
      breadcrumbs[0].current = true;
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (path) => {
    if (path && !breadcrumbs?.find(b => b?.path === path)?.current) {
      window.location.href = path;
    }
  };

  const handleBack = () => {
    window.history?.back();
  };

  return (
    <nav className="flex items-center space-x-2 py-4" aria-label="Breadcrumb">
      {/* Mobile Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="md:hidden flex items-center space-x-2"
      >
        <Icon name="ArrowLeft" size={16} />
        <span>Back</span>
      </Button>
      {/* Desktop Breadcrumbs */}
      <ol className="hidden md:flex items-center space-x-2">
        {breadcrumbs?.map((item, index) => (
          <li key={item?.path || index} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-muted-foreground mx-2" 
              />
            )}
            
            <div className="flex items-center space-x-2">
              {item?.current ? (
                <div className="flex items-center space-x-2 text-foreground">
                  <Icon name={item?.icon} size={16} />
                  <span className="font-medium text-sm">{item?.label}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigation(item?.path)}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <Icon name={item?.icon} size={16} />
                  <span className="text-sm">{item?.label}</span>
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {/* Mobile Current Page */}
      <div className="md:hidden flex items-center space-x-2 text-foreground">
        <Icon name={breadcrumbs?.[breadcrumbs?.length - 1]?.icon} size={16} />
        <span className="font-medium text-sm">
          {breadcrumbs?.[breadcrumbs?.length - 1]?.label}
        </span>
      </div>
    </nav>
  );
};

export default Breadcrumb;