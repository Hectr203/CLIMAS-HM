import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import ProjectFilters from './components/ProjectFilters';
import ProjectTable from './components/ProjectTable';
import ProjectStats from './components/ProjectStats';
import ProjectTimeline from './components/ProjectTimeline';
import ProjectQuotations from './components/ProjectQuotations';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import useProyect from '../../hooks/useProyect';

/* ====== Cache local para estado UI ====== */
const UI_ESTADO_KEY = 'proyectos_ui_estado_v1';
const uiEstadoCache = {
  _read() { try { return JSON.parse(localStorage.getItem(UI_ESTADO_KEY)) || {}; } catch { return {}; } },
  get(id) { if (!id) return null; const m = this._read(); return m[id] || null; },
  set(id, estado) {
    if (!id) return;
    const m = this._read();
    if (estado) m[id] = estado; else delete m[id];
    localStorage.setItem(UI_ESTADO_KEY, JSON.stringify(m));
  },
  bulkMergeFromApi(list=[]) {
    const m = this._read();
    let changed = false;
    list.forEach(p => {
      const id = p?.id ?? p?._id;
      if (!id) return;
      if (!m[id]) {
        const def = backendToUiDefault(p?.estado);
        if (def) { m[id] = def; changed = true; }
      }
    });
    if (changed) localStorage.setItem(UI_ESTADO_KEY, JSON.stringify(m));
  }
};

/* Mapeos de estado */
const backendToUiDefault = (apiEstado) => {
  const v = String(apiEstado || '').toLowerCase();
  if (v === 'en proceso') return 'en proceso';
  if (v === 'activo') return 'planificación';
  return 'planificación';
};
const mapUiToBackend = (uiEstado) => {
  const v = String(uiEstado || '').toLowerCase();
  return v === 'en proceso' ? 'en proceso' : 'activo';
};

const ProjectManagement = () => {
  const {
    proyectos: projects,
    loading: isLoading,
    error,
    getProyectos,
    getProyectoById,
    createProyecto,
    updateProyecto,
    deleteProyecto
  } = useProyect();

  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeView, setActiveView] = useState('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  /* ===== Helpers de normalización de ESTADO (filtros) ===== */
  const norm = (s) =>
    (s ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

  const canonicalEstado = (raw) => {
    const v = norm(raw);
    if (v.includes('planific') || v.includes('planning')) return 'planificacion';
    if (v === 'en proceso' || v.includes('progress') || v.includes('in progress') || v.includes('process')) return 'en proceso';
    if (v === 'en pausa' || v.includes('pause') || v.includes('on hold') || v.includes('on-hold') || v.includes('hold')) return 'en pausa';
    if (v === 'en revision' || v === 'en revisión' || v.includes('review') || v.includes('revision')) return 'en revision';
    if (v === 'completado' || v.includes('complet') || v.includes('done') || v.includes('closed')) return 'completado';
    if (v === 'cancelado' || v.includes('canceled') || v.includes('cancelled') || v.includes('cancel')) return 'cancelado';
    return v;
  };

  useEffect(() => { getProyectos(); }, []);
  useEffect(() => {
    const arr = Array.isArray(projects) ? projects : [];
    // sembramos cache con el estado derivado del backend si no existe
    uiEstadoCache.bulkMergeFromApi(arr);
    setFilteredProjects(arr);
  }, [projects]);

  // getters (usando cache UI antes que el backend)
  const getNombre = (p) => p?.nombre ?? p?.nombreProyecto ?? p?.name ?? '';
  const getCodigo = (p) => p?.codigo ?? p?.code ?? '';
  const getEstado = (p) => uiEstadoCache.get(p?.id ?? p?._id) || backendToUiDefault(p?.estado);
  const getDepto = (p) => p?.departamento ?? p?.department ?? '';
  const getPrioridad = (p) => p?.prioridad ?? p?.priority ?? '';
  const getInicio = (p) => p?.cronograma?.fechaInicio ?? p?.startDate ?? null;
  const getFin = (p) => p?.cronograma?.fechaFin ?? p?.endDate ?? null;
  const getBudget = (p) => Number(p?.totalPresupuesto ?? p?.presupuesto?.total ?? p?.budget ?? 0);

  // USD equipos
  const getEquipoUSD = (p) => {
    const usd = p?.presupuesto?.equipoDolares;
    if (usd != null) return Number(usd) || 0;
    const mxn = Number(p?.presupuesto?.equipos ?? 0);
    const tipo = Number(p?.presupuesto?._metaEquipos?.tipoCambio ?? 0);
    if (p?.presupuesto?._metaEquipos?.capturadoEn === 'USD' && p?.presupuesto?._metaEquipos?.valorUSD != null) {
      return Number(p?.presupuesto?._metaEquipos?.valorUSD) || 0;
    }
    return tipo > 0 ? mxn / tipo : 0;
  };

  /* ====== Filtros ====== */
  const handleFiltersChange = (filters) => {
    let filtered = Array.isArray(projects) ? [...projects] : [];

    if (filters?.search) {
      const q = norm(filters.search);
      filtered = filtered.filter(project => {
        const name = norm(getNombre(project));
        const code = norm(getCodigo(project));
        const cliente = norm(project?.cliente?.nombre || project?.cliente || '');
        return name.includes(q) || code.includes(q) || cliente.includes(q);
      });
    }

    if (filters?.status) {
      const target = canonicalEstado(filters.status);
      filtered = filtered.filter(project => {
        const uiEstado = getEstado(project);
        const canon = canonicalEstado(uiEstado);
        return canon === target;
      });
    }

    if (filters?.department) {
      const deptMap = { sales: 'Ventas', engineering: 'Ingeniería', installation: 'Instalación', maintenance: 'Mantenimiento', administration: 'Administración' };
      const targetDept = deptMap[filters.department] || filters.department;
      filtered = filtered.filter(project => (getDepto(project) || '') === targetDept);
    }

    if (filters?.priority) {
      const priorityMap = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
      const targetPriority = priorityMap[filters.priority] || filters.priority;
      filtered = filtered.filter(project => (getPrioridad(project) || '') === targetPriority);
    }

    if (filters?.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(project => {
        const startDateStr = getInicio(project);
        if (!startDateStr) return false;
        const startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) return false;
        switch (filters.dateRange) {
          case 'today': return startDate.toDateString() === today.toDateString();
          case 'week': { const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7); return startDate >= weekAgo && startDate <= now; }
          case 'month': return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
          case 'quarter': { const quarter = Math.floor(now.getMonth() / 3); const projectQuarter = Math.floor(startDate.getMonth() / 3); return projectQuarter === quarter && startDate.getFullYear() === now.getFullYear(); }
          case 'year': return startDate.getFullYear() === now.getFullYear();
          default: return true;
        }
      });
    }

    if (filters?.minBudget) {
      const minBudget = Number(filters.minBudget);
      filtered = filtered.filter(project => getBudget(project) >= minBudget);
    }
    if (filters?.maxBudget) {
      const maxBudget = Number(filters.maxBudget);
      filtered = filtered.filter(project => getBudget(project) <= maxBudget);
    }

    if (filters?.startDate) {
      const filterStartDate = new Date(filters.startDate);
      filtered = filtered.filter(project => {
        const startDateStr = getInicio(project);
        if (!startDateStr) return false;
        const projectStartDate = new Date(startDateStr);
        return projectStartDate >= filterStartDate;
      });
    }

    if (filters?.endDate) {
      const filterEndDate = new Date(filters.endDate);
      filtered = filtered.filter(project => {
        const endDateStr = getFin(project);
        if (!endDateStr) return false;
        const projectEndDate = new Date(endDateStr);
        return projectEndDate <= filterEndDate;
      });
    }

    setFilteredProjects(filtered);
  };

  /* ====== Acciones ====== */
  const handleProjectSelect = (project) => { setSelectedProject(project); setIsEditModalOpen(true); };

  // actualización desde tabla: guardamos UI en cache y enviamos mapeado al API
  const handleStatusUpdate = async (projectId, newStatusUi) => {
    try {
      const estadoBackend = mapUiToBackend(newStatusUi);
      await updateProyecto(projectId, { estado: estadoBackend });
      uiEstadoCache.set(projectId, newStatusUi); // <— persistimos lo que eligió el usuario
      await getProyectos({ force: true }).catch(() => {});
    } catch (error) {
      console.error('Error al actualizar estado del proyecto:', error);
      alert('Error al actualizar el estado del proyecto');
    }
  };

  const handleBulkAction = (action, selectedIds) => { console.log(`Bulk action: ${action}`, selectedIds); };

  const handleCreateProject = async (_createdPayloadFromModal) => {
    try {
      await getProyectos({ force: true });
      alert('Proyecto creado exitosamente');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error al refrescar proyectos tras crear:', error);
    }
  };

  const handleExport = async () => {
    try {
      const headers = ['Código', 'Nombre', 'Cliente', 'Estado (UI)', 'Prioridad', 'Presupuesto (MXN)', 'Equipos (USD)'];
      const rows = (projects || []).map(project => [
        getCodigo(project),
        getNombre(project),
        project?.cliente?.nombre || project?.cliente || '',
        getEstado(project), // usamos el estado UI
        getPrioridad(project),
        `$${getBudget(project).toLocaleString('es-MX')}`,
        `$${getEquipoUSD(project).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.download = `proyectos-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    } catch (error) { console.error('Error al exportar proyectos:', error); }
  };

  const handleViewProject = async (project) => {
    try {
      const fullProject = await getProyectoById(project?.id);
      alert(`Ver detalles del proyecto: ${fullProject?.nombreProyecto || fullProject?.codigo}
Cliente: ${fullProject?.cliente?.nombre || fullProject?.cliente || ''}
Estado: ${getEstado(fullProject)}`);
    } catch (error) {
      console.error('Error al obtener detalles del proyecto:', error);
      alert('Error al cargar los detalles del proyecto');
    }
  };

  const handleEditProject = (project) => {
    if (!project) return;
    const id = project?.id ?? project?._id;
    if (!id) { console.warn('Proyecto sin id: ', project); return; }
    setSelectedProject({ ...project, id });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (_updatedFromModal) => {
    try {
      await getProyectos({ force: true });
      alert('Proyecto actualizado exitosamente');
      setSelectedProject(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error al refrescar proyectos tras actualizar:', error);
      setSelectedProject(null);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el proyecto "${getNombre(project) || getCodigo(project)}"?\n\nEsta acción no se puede deshacer.`)) {
      try { 
        await deleteProyecto(project?.id);
        await getProyectos({ force: true });
        alert('Proyecto eliminado exitosamente'); 
      }
      catch (error) { console.error('Error al eliminar proyecto:', error); alert('Error al eliminar el proyecto.'); }
    }
  };

  const handleImageUpload = async () => {
    try {
      setIsUploadingImage(true);
      const fileInput = document.createElement('input');
      fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.multiple = false;
      fileInput.onchange = async (event) => {
        const file = event?.target?.files?.[0];
        if (file) {
          if (!file?.type?.startsWith('image/')) { alert('Por favor seleccione un archivo de imagen válido'); setIsUploadingImage(false); return; }
          if (file?.size > 5 * 1024 * 1024) { alert('El archivo es demasiado grande. Máximo 5MB'); setIsUploadingImage(false); return; }
          const reader = new FileReader();
          reader.onload = (e) => setSelectedImage({ file, name:file?.name, size:file?.size, type:file?.type, url:e?.target?.result, lastModified:file?.lastModified });
          reader.readAsDataURL(file);
        }
        setIsUploadingImage(false);
      };
      fileInput.click();
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      alert('Error al seleccionar la imagen.');
      setIsUploadingImage(false);
    }
  };

  const handleClearImage = () => setSelectedImage(null);

  const viewOptions = [
    { value: 'table', label: 'Tabla', icon: 'Table' },
    { value: 'timeline', label: 'Cronograma', icon: 'Calendar' },
    { value: 'quotations', label: 'Cotizaciones', icon: 'FileText' },
    { value: 'stats', label: 'Estadísticas', icon: 'BarChart3' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
          <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />
          <div className="pt-16 flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando proyectos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header onMenuToggle={() => setHeaderMenuOpen(!headerMenuOpen)} isMenuOpen={headerMenuOpen} />

        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Proyectos</h1>
                <p className="text-muted-foreground">Administre el ciclo completo de proyectos HVAC desde la planificación hasta el cierre</p>
              </div>

              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <div className="flex bg-muted rounded-lg p-1">
                  {viewOptions?.map((option) => (
                    <button
                      key={option?.value}
                      onClick={() => setActiveView(option?.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-smooth ${activeView === option?.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <Icon name={option?.icon} size={16} />
                      <span className="hidden sm:inline text-sm">{option?.label}</span>
                    </button>
                  ))}
                </div>

                <Button onClick={() => setIsCreateModalOpen(true)} iconName="Plus" iconPosition="left">
                  Nuevo Proyecto
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            {activeView !== 'stats' && filteredProjects?.length > 0 && <ProjectStats projects={filteredProjects} />}

            {/* Filters */}
            {activeView === 'table' && (
              <ProjectFilters
                onFiltersChange={handleFiltersChange}
                totalProjects={projects?.length}
                filteredProjects={filteredProjects?.length}
              />
            )}

            {/* Mensajes vacíos */}
            {filteredProjects?.length === 0 && projects?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="FolderOpen" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay proyectos disponibles</h3>
                <p className="text-muted-foreground mb-6">Comienza creando tu primer proyecto</p>
                <Button onClick={() => setIsCreateModalOpen(true)} iconName="Plus" iconPosition="left">Crear Proyecto</Button>
              </div>
            )}

            {filteredProjects?.length === 0 && projects?.length > 0 && (
              <div className="text-center py-12">
                <Icon name="Filter" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No se encuentra proyecto con tus especificaciones</h3>
                <p className="text-muted-foreground mb-6">Intenta con otros filtros o parámetros de búsqueda</p>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-6">
              {activeView === 'table' && filteredProjects?.length > 0 && (
                <ProjectTable
                  projects={filteredProjects}
                  onProjectSelect={handleEditProject}
                  onStatusUpdate={handleStatusUpdate}
                  onBulkAction={handleBulkAction}
                  onImageUpload={handleImageUpload}
                  isUploadingImage={isUploadingImage}
                  selectedImage={selectedImage}
                  extraBudgetRenderer={(project) => {
                    const usd = getEquipoUSD(project);
                    if (!usd) return null;
                    return (
                      <div className="text-xs text-muted-foreground mt-1">
                        Equipos: <span className="font-medium">${usd.toLocaleString('es-MX', { minimumFractionDigits: 2 })} USD</span>
                      </div>
                    );
                  }}
                  /* Mostrar estado UI en la tabla si el componente lo soporta */
                  estadoRenderer={(project) => getEstado(project)}
                />
              )}

              {activeView === 'timeline' && filteredProjects?.length > 0 && <ProjectTimeline projects={filteredProjects} />}
              {activeView === 'quotations' && filteredProjects?.length > 0 && <ProjectQuotations projects={filteredProjects} />}

              {activeView === 'stats' && (
                <div className="space-y-6">
                  <ProjectStats projects={filteredProjects} />
                  {filteredProjects?.length > 0 && <ProjectTimeline projects={filteredProjects} />}
                </div>
              )}
            </div>

            {/* Modales */}
            <CreateProjectModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={handleCreateProject}
            />

            {isEditModalOpen && (
              <EditProjectModal
                isOpen
                onClose={() => { setIsEditModalOpen(false); setSelectedProject(null); }}
                onSubmit={handleUpdateProject}
                project={selectedProject}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
