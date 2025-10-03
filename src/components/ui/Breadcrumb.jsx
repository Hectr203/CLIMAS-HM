import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();

  const pathMapping = {
    '/main-dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/project-management': { label: 'Project Management', icon: 'FolderOpen' },
    '/work-order-processing': { label: 'Work Order Processing', icon: 'ClipboardList' },
    '/financial-management': { label: 'Financial Management', icon: 'DollarSign' },
    '/client-management': { label: 'Client Management', icon: 'Users' },
    '/personnel-management': { label: 'Personnel Management', icon: 'UserCheck' },
    '/inventory-management': { label: 'Inventory Management', icon: 'Package' }
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