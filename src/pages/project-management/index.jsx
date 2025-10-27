import React, { useState, useEffect, useRef } from 'react';
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
  set(id, estado) { if (!id) return; const m = this._read(); if (estado) m[id] = estado; else delete m[id]; localStorage.setItem(UI_ESTADO_KEY, JSON.stringify(m)); },
  bulkMergeFromApi(list=[]) {
    const m = this._read(); let changed = false;
    list.forEach(p => {
      const id = p?.id ?? p?._id; if (!id) return;
      if (!m[id]) { const def = backendToUiDefault(p?.estado); if (def) { m[id] = def; changed = true; } }
    });
    if (changed) localStorage.setItem(UI_ESTADO_KEY, JSON.stringify(m));
  }
};
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
    getProyectos,
    getProyectoById,
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

  useEffect(() => { getProyectos(); }, []);
  useEffect(() => {
    const arr = Array.isArray(projects) ? projects : [];
    uiEstadoCache.bulkMergeFromApi(arr);
    setFilteredProjects(arr);
  }, [projects]);

  // getters
  const getNombre = (p) => p?.nombre ?? p?.nombreProyecto ?? p?.name ?? '';
  const getCodigo = (p) => p?.codigo ?? p?.code ?? '';
  const getEstado = (p) => uiEstadoCache.get(p?.id ?? p?._id) || backendToUiDefault(p?.estado);
  const getDepto = (p) => p?.departamento ?? p?.department ?? '';
  const getPrioridad = (p) => p?.prioridad ?? p?.priority ?? '';
  const getInicio = (p) => p?.cronograma?.fechaInicio ?? p?.startDate ?? null;
  const getFin = (p) => p?.cronograma?.fechaFin ?? p?.endDate ?? null;
  const getBudget = (p) => Number(p?.totalPresupuesto ?? p?.presupuesto?.total ?? p?.budget ?? 0);

  // filtros del componente ProjectFilters (sin cambios de tu UI)
  const norm = (s) => (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
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

    if (filters?.minBudget) filtered = filtered.filter(project => getBudget(project) >= Number(filters.minBudget));
    if (filters?.maxBudget) filtered = filtered.filter(project => getBudget(project) <= Number(filters.maxBudget));

    if (filters?.startDate) {
      const filterStartDate = new Date(filters.startDate);
      filtered = filtered.filter(project => {
        const d = getInicio(project); if (!d) return false;
        const sd = new Date(d); return sd >= filterStartDate;
      });
    }

    if (filters?.endDate) {
      const filterEndDate = new Date(filters.endDate);
      filtered = filtered.filter(project => {
        const d = getFin(project); if (!d) return false;
        const ed = new Date(d); return ed <= filterEndDate;
      });
    }

    setFilteredProjects(filtered);
  };

  const handleEditProject = (project) => {
    const id = project?.id ?? project?._id; if (!id) return;
    setSelectedProject({ ...project, id });
    setIsEditModalOpen(true);
  };
  const handleStatusUpdate = async (projectId, newStatusUi) => {
    try {
      const estadoBackend = mapUiToBackend(newStatusUi);
      await updateProyecto(projectId, { estado: estadoBackend });
      uiEstadoCache.set(projectId, newStatusUi);
      await getProyectos({ force: true }).catch(() => {});
    } catch (error) {
      console.error('Error al actualizar estado del proyecto:', error);
      alert('Error al actualizar el estado del proyecto');
    }
  };
  const handleBulkAction = (action, selectedIds) => { console.log(`Bulk action: ${action}`, selectedIds); };

  const handleUpdateProject = async () => {
    try {
      await getProyectos({ force: true });
      alert('Proyecto actualizado exitosamente');
      setSelectedProject(null); setIsEditModalOpen(false);
    } catch {
      setSelectedProject(null); setIsEditModalOpen(false);
    }
  };

  /* ===== Export desde la barra de filtros ===== */
  const handleExportFromFilters = () => {
    const list = filteredProjects || [];
    if (!list.length) { alert('No hay proyectos para exportar.'); return; }
    const headers = ['Código','Nombre','Cliente','Estado','Prioridad','Presupuesto (MXN)','Inicio','Fin'];
    const esc = (s) => {
      const v = String(s ?? '');
      const needs = /[",\n]/.test(v);
      const e = v.replace(/"/g,'""');
      return needs ? `"${e}"` : e;
    };
    const rows = list.map(p => {
      const code = p?.codigo ?? p?.code ?? '';
      const name = p?.nombre ?? p?.name ?? '';
      const client = p?.cliente?.nombre || p?.cliente || '';
      const status = p?.statusLabel || p?.estado || p?.status || '';
      const priority = p?.priority || p?.prioridad || '';
      const budget = Number(p?.totalPresupuesto ?? p?.presupuesto?.total ?? p?.budget ?? 0).toLocaleString('es-MX');
      const sd = new Date(p?.cronograma?.fechaInicio ?? p?.startDate ?? '').toLocaleDateString('es-MX');
      const ed = new Date(p?.cronograma?.fechaFin ?? p?.endDate ?? '').toLocaleDateString('es-MX');
      return [code,name,client,status,priority,budget,sd,ed].map(esc).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `proyectos_filtrados_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
  };

  const onGenerateReportFromTimeline = (periodList /* ya filtrados por ProjectTimeline */, timeframe) => {
    const headers = ['Código','Nombre','Cliente','Estado','Prioridad','Presupuesto (MXN)','Inicio','Fin'];
    const esc = (s) => {
      const v = String(s ?? '');
      const needs = /[",\n]/.test(v); const e = v.replace(/"/g,'""');
      return needs ? `"${e}"` : e;
    };
    const rows = (periodList || []).map(p => {
      const code = p?.codigo ?? p?.code ?? '';
      const name = p?.nombre ?? p?.name ?? '';
      const client = p?.cliente?.nombre || p?.client?.name || '';
      const status = p?.statusLabel || p?.estado || p?.status || '';
      const priority = p?.priority || p?.prioridad || '';
      const budget = Number(p?.totalPresupuesto ?? p?.presupuesto?.total ?? p?.budget ?? 0).toLocaleString('es-MX');
      const sd = new Date(p?.startDate ?? p?.cronograma?.fechaInicio ?? '').toLocaleDateString('es-MX');
      const ed = new Date(p?.endDate ?? p?.cronograma?.fechaFin ?? '').toLocaleDateString('es-MX');
      return [code,name,client,status,priority,budget,sd,ed].map(esc).join(',');
    });
    if (!rows.length) { alert('No hay proyectos en el período.'); return; }
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8;' }));
    a.download = `cronograma_${timeframe}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

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
                  {[
                    { value: 'table', label: 'Tabla', icon: 'Table' },
                    { value: 'timeline', label: 'Cronograma', icon: 'Calendar' },
                    { value: 'quotations', label: 'Cotizaciones', icon: 'FileText' },
                    { value: 'stats', label: 'Estadísticas', icon: 'BarChart3' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setActiveView(option.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-smooth ${activeView === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <Icon name={option.icon} size={16} />
                      <span className="hidden sm:inline text-sm">{option.label}</span>
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

            {/* Filtros (incluye onExport) */}
            {activeView === 'table' && (
              <ProjectFilters
                onFiltersChange={handleFiltersChange}
                totalProjects={projects?.length}
                filteredProjects={filteredProjects?.length}
                onExport={handleExportFromFilters}
              />
            )}

            {/* Main Content */}
            <div className="space-y-6">
              {activeView === 'table' && filteredProjects?.length > 0 && (
                <ProjectTable
                  projects={filteredProjects}
                  onProjectSelect={handleEditProject}
                  onBulkAction={handleBulkAction}
                />
              )}

              {activeView === 'timeline' && (
                <ProjectTimeline
                  projects={filteredProjects}
                  onGenerateReport={onGenerateReportFromTimeline}
                />
              )}

              {activeView === 'quotations' && filteredProjects?.length > 0 && <ProjectQuotations projects={filteredProjects} />}

              {activeView === 'stats' && (
                <div className="space-y-6">
                  <ProjectStats projects={filteredProjects} />
                  {filteredProjects?.length > 0 && <ProjectTimeline projects={filteredProjects} onGenerateReport={onGenerateReportFromTimeline} />}
                </div>
              )}

              {/* Vacíos */}
              {filteredProjects?.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Filter" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron proyectos con tus filtros</h3>
                  <p className="text-muted-foreground mb-6">Intenta con otros filtros o parámetros de búsqueda</p>
                </div>
              )}
            </div>

            {/* Modales */}
            <CreateProjectModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={() => getProyectos({ force: true })}
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
