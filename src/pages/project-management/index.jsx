import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import ProjectFilters from './components/ProjectFilters';
import ProjectTable from './components/ProjectTable';
import ProjectTimeline from './components/ProjectTimeline';
import ProjectQuotations from './components/ProjectQuotations';
import ProjectStats from './components/ProjectStats';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import useProyect from '../../hooks/useProyect';

// ⬇️ trae tus notificaciones
import { useErrorHandler, useNotifications } from 'context/NotificationContext';

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
    updateProyecto,
  } = useProyect();

  const { handleError, handleSuccess } = useErrorHandler();
  const { showWarning } = useNotifications();

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

  /* ====== filtros */
  const norm = (s) => (s ?? '').toString().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

  const canonicalEstado = (raw) => {
    const v = norm(raw);
    if (v.includes('planific')) return 'planificacion';
    if (v.includes('en proceso') || v.includes('progress')) return 'en proceso';
    if (v.includes('pausa') || v.includes('hold')) return 'en pausa';
    if (v.includes('revision') || v.includes('review')) return 'en revision';
    if (v.includes('complet')) return 'completado';
    if (v.includes('cancel')) return 'cancelado';
    return v;
  };

  const handleFiltersChange = (filters) => {
    let filtered = Array.isArray(projects) ? [...projects] : [];

    if (filters?.search) {
      const q = norm(filters.search);
      filtered = filtered.filter(p =>
        norm(p?.nombre)?.includes(q) ||
        norm(p?.codigo)?.includes(q) ||
        norm(p?.cliente?.nombre)?.includes(q)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(p =>
        canonicalEstado(uiEstadoCache.get(p.id) || p.estado) === canonicalEstado(filters.status)
      );
    }

    setFilteredProjects(filtered);
  };

  const handleEditProject = (project) => {
    const id = project?.id ?? project?._id;
    setSelectedProject({ ...project, id });
    setIsEditModalOpen(true);
  };

  const handleStatusUpdate = async (projectId, newStatusUi) => {
    try {
      const estadoBackend = mapUiToBackend(newStatusUi);
      await updateProyecto(projectId, { estado: estadoBackend });
      uiEstadoCache.set(projectId, newStatusUi);
      await getProyectos({ force: true });

      handleSuccess('update', 'Proyecto');
    } catch (error) {
      handleError(error, 'Error al actualizar estado');
    }
  };

  const handleUpdateProject = async () => {
    try {
      await getProyectos({ force: true });
      handleSuccess('update', 'Proyecto');
      setSelectedProject(null);
      setIsEditModalOpen(false);
    } catch (err) {
      handleError(err, 'Error al actualizar');
    }
  };

  /* ===== Exportar ===== */
  const handleExportFromFilters = () => {
    if (!filteredProjects?.length) {
      showWarning('No hay proyectos para exportar');
      return;
    }

    try {
      const headers = ['Código','Nombre','Cliente','Estado','Prioridad','Presupuesto','Inicio','Fin'];

      const rows = filteredProjects.map(p =>
        [
          p.codigo,
          p.nombre,
          p?.cliente?.nombre,
          p.estado,
          p.prioridad,
          p.presupuesto?.total,
          new Date(p?.cronograma?.fechaInicio)?.toLocaleDateString('es-MX'),
          new Date(p?.cronograma?.fechaFin)?.toLocaleDateString('es-MX'),
        ]
          .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `proyectos_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      handleSuccess('export', 'Proyectos');
    } catch (e) {
      handleError(e, 'Error al exportar proyectos');
    }
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
                <p className="text-muted-foreground">
                  Administre el ciclo completo de proyectos HVAC desde la planificación hasta el cierre
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                <div className="flex bg-muted rounded-lg p-1">
                  {[ 
                    { value: 'table', label: 'Tabla', icon: 'Table' },
                    { value: 'timeline', label: 'Cronograma', icon: 'Calendar' },
                    { value: 'quotations', label: 'Cotizaciones', icon: 'FileText' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setActiveView(option.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-smooth
                        ${activeView === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'}`}
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

            {/* ✅ ESTADÍSTICAS SE MANTIENEN */}
            {activeView !== 'stats' && filteredProjects?.length > 0 && (
              <ProjectStats projects={filteredProjects} />
            )}

            {/* Filtros */}
            {activeView === 'table' && (
              <ProjectFilters
                onFiltersChange={handleFiltersChange}
                totalProjects={projects?.length}
                filteredProjects={filteredProjects?.length}
                onExport={handleExportFromFilters}
              />
            )}

            <div className="space-y-6">
              {activeView === 'table' && filteredProjects?.length > 0 && (
                <ProjectTable
                  projects={filteredProjects}
                  onProjectSelect={handleEditProject}
                  onStatusUpdate={handleStatusUpdate}
                />
              )}

              {activeView === 'timeline' && (
                <ProjectTimeline
                  projects={filteredProjects}
                  onGenerateReport={() => {}}
                />
              )}

              {activeView === 'quotations' && filteredProjects?.length > 0 && (
                <ProjectQuotations projects={filteredProjects} />
              )}

              {filteredProjects?.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Filter" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No se encontraron proyectos con tus filtros
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Intenta con otros filtros o parámetros de búsqueda
                  </p>
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
 