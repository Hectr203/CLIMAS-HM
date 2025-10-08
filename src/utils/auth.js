// Authentication and Authorization utilities
export const AUTH_ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project manager',
  WORKSHOP_SUPERVISOR: 'workshop supervisor',
  FINANCIAL_CONTROLLER: 'financial controller',
  HR_MANAGER: 'hr manager'
};

export const ROLE_PERMISSIONS = {
  [AUTH_ROLES?.ADMIN]: {
    allowedPaths: [
      '/main-dashboard',
      '/sales-opportunity-management',
      '/quotation-development-center',
      '/project-management',
      '/work-order-processing',
      '/personnel-management',
      '/inventory-management',
      '/client-management',
      '/financial-management',
      '/project-gallery-viewer',
      '/project-detail-gallery',
      '/project-documentation-center',
      '/project-workflow-management',
      '/quotation-builder',
      '/workshop-operations-management',
      '/workshop-operations-center',
      '/sales-execution-monitoring'
    ],
    defaultPath: '/main-dashboard'
  },
  [AUTH_ROLES?.PROJECT_MANAGER]: {
    allowedPaths: [
      '/project-management',
      '/project-gallery-viewer',
      '/project-detail-gallery',
      '/project-documentation-center',
      '/project-workflow-management',
      '/quotation-builder'
    ],
    defaultPath: '/project-management'
  },
  [AUTH_ROLES?.WORKSHOP_SUPERVISOR]: {
    allowedPaths: [
      '/inventory-management',
      '/work-order-processing',
      '/workshop-operations-management',
      '/workshop-operations-center'
    ],
    defaultPath: '/inventory-management'
  },
  [AUTH_ROLES?.FINANCIAL_CONTROLLER]: {
    allowedPaths: [
      '/financial-management',
      '/quotation-development-center'
    ],
    defaultPath: '/financial-management'
  },
  [AUTH_ROLES?.HR_MANAGER]: {
    allowedPaths: [
      '/personnel-management'
    ],
    defaultPath: '/personnel-management'
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  
  if (!authToken || !userRole) {
    return null;
  }
  
  return {
    token: authToken,
    role: userRole,
    email: userEmail
  };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!user || !user.token || !expiresAt) return false;
  // Verifica expiración del token (24h)
  if (Date.now() > Number(expiresAt)) {
    logout();
    return false;
  }
  return true;
};

// Check if user has permission to access a specific path
export const hasPermission = (path, userRole = null) => {
  const currentUser = getCurrentUser();
  const role = userRole || currentUser?.role;
  
  if (!role || !ROLE_PERMISSIONS?.[role]) {
    return false;
  }
  
  return ROLE_PERMISSIONS?.[role]?.allowedPaths?.includes(path);
};

// Get allowed navigation items for user role
export const getAllowedNavigationItems = (userRole) => {
  if (!userRole || !ROLE_PERMISSIONS?.[userRole]) {
    return [];
  }
  
  const allowedPaths = ROLE_PERMISSIONS?.[userRole]?.allowedPaths;
  
  const allNavigationItems = [
    {
      label: 'Dashboard',
      path: '/main-dashboard',
      icon: 'LayoutDashboard',
      tooltip: 'Resumen operacional y KPIs',
      badge: null,
  roles: [AUTH_ROLES?.ADMIN]
    },
    {
      label: 'Oportunidades',
      path: '/sales-opportunity-management',
      icon: 'Target',
      tooltip: 'Gestión de oportunidades de venta',
      badge: 8,
  roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.SALES_REPRESENTATIVE]
    },
    {
      label: 'Cotizaciones',
      path: '/quotation-development-center',
      icon: 'FileText',
      tooltip: 'Desarrollo y gestión de cotizaciones',
      badge: null,
  roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.SALES_REPRESENTATIVE, AUTH_ROLES?.FINANCIAL_CONTROLLER]
    },
    {
      label: 'Proyectos',
      path: '/project-management',
      icon: 'FolderOpen',
      tooltip: 'Gestión del ciclo de vida de proyectos',
      badge: 5,
  roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.PROJECT_MANAGER]
    },
    {
      label: 'Operaciones',
      path: '/work-order-processing',
      icon: 'ClipboardList',
      tooltip: 'Procesamiento y seguimiento de órdenes de trabajo',
      badge: 12,
  roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.WORKSHOP_SUPERVISOR]
    },
    {
      label: 'Recursos',
      icon: 'Users',
      tooltip: 'Gestión de personal e inventario',
      children: [
        {
          label: 'Personal',
          path: '/personnel-management',
          icon: 'UserCheck',
          tooltip: 'Gestión de personal y horarios',
          roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.HR_MANAGER]
        },
        {
          label: 'Inventario',
          path: '/inventory-management',
          icon: 'Package',
          tooltip: 'Seguimiento de equipos y repuestos',
          roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.WORKSHOP_SUPERVISOR]
        }
      ]
    },
    {
      label: 'Negocio',
      icon: 'Building2',
      tooltip: 'Gestión de clientes y finanzas',
      badge: 3,
      children: [
        {
          label: 'Clientes',
          path: '/client-management',
          icon: 'Users',
          tooltip: 'Gestión de relaciones con clientes',
          roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.SALES_REPRESENTATIVE]
        },
        {
          label: 'Finanzas',
          path: '/financial-management',
          icon: 'DollarSign',
          tooltip: 'Supervisión y reportes financieros',
          badge: 3,
          roles: [AUTH_ROLES?.ADMIN, AUTH_ROLES?.FINANCIAL_CONTROLLER]
        }
      ]
    }
  ];
  
  // Filter navigation items based on user role and allowed paths
  const filterItems = (items) => {
    return items?.filter(item => {
      if (item?.children) {
        const allowedChildren = item?.children?.filter(child => 
          child?.roles?.includes(userRole) && allowedPaths?.includes(child?.path)
        );
        if (allowedChildren?.length > 0) {
          item.children = allowedChildren;
          return true;
        }
        return false;
      } else {
        return item?.roles?.includes(userRole) && allowedPaths?.includes(item?.path);
      }
    });
  };
  
  return filterItems(allNavigationItems);
};

// Get default redirect path for user role
export const getDefaultPath = (userRole) => {
  if (!userRole || !ROLE_PERMISSIONS?.[userRole]) {
    return '/login';
  }
  
  return ROLE_PERMISSIONS?.[userRole]?.defaultPath;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('rememberMe');
  window.location.href = '/login';
};