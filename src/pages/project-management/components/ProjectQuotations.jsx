// ProjectQuotations.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ProjectTable from './ProjectTable';
import ProjectFilters, { applyProjectFilters } from './ProjectFilters';

const ProjectQuotations = ({ projects = [] }) => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);

  // 📦 Estado de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    dateRange: '',
    clientType: '',
    priority: '',
    minBudget: '',
    maxBudget: '',
    startDate: '',
    endDate: '',
  });

  // === Utilidades ===
  const formatCurrency = (n) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(n ?? 0);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getStatusColor = (s) =>
    ({
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      draft: 'bg-blue-100 text-blue-800',
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-emerald-100 text-emerald-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }[s] || 'bg-gray-100 text-gray-800');

  // === Normalizadores ===
  const norm = (v) =>
    (v == null ? '' : String(v))
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const canonicalizeStatus = (raw) => {
    const n = norm(raw);
    if (!n) return '';
    const table = [
      [
        'planning',
        ['planificacion', 'planificación', 'planning', 'planeacion', 'planeación'],
      ],
      [
        'in-progress',
        [
          'en progreso',
          'in-progress',
          'progreso',
          'ejecucion',
          'ejecución',
          'proceso',
        ],
      ],
      ['on-hold', ['en pausa', 'on-hold', 'pausa', 'pausado', 'detenido', 'hold']],
      [
        'review',
        ['revision', 'revisión', 'review', 'en revision', 'por revisar', 'validacion'],
      ],
      ['completed', ['completado', 'finalizado', 'done', 'terminado', 'cerrado']],
      ['cancelled', ['cancelado', 'cancelled', 'anulado']],
    ];
    for (const [canon, synonyms] of table) {
      if (synonyms.some((w) => n === norm(w) || n.includes(norm(w)))) return canon;
    }
    return n;
  };

  const canonicalizeDepartment = (raw) => {
    const n = norm(raw);
    if (!n) return '';
    const table = [
      ['sales', ['ventas']],
      ['engineering', ['ingenieria', 'ingeniería', 'ing']],
      ['installation', ['instalacion', 'instalación', 'montaje']],
      ['maintenance', ['mantenimiento', 'mtto']],
      ['administration', ['administracion', 'administración', 'admin']],
    ];
    for (const [canon, synonyms] of table) {
      if (synonyms.some((w) => n === norm(w) || n.includes(norm(w)))) return canon;
    }
    return n;
  };

  const canonicalizeClientType = (raw) => {
    const n = norm(raw);
    if (!n) return '';
    const table = [
      ['residential', ['residencial', 'hogar']],
      ['commercial', ['comercial', 'negocio']],
      ['industrial', ['industrial', 'industria']],
      ['government', ['gubernamental', 'gobierno', 'publico']],
    ];
    for (const [canon, synonyms] of table) {
      if (synonyms.some((w) => n === norm(w) || n.includes(norm(w)))) return canon;
    }
    return n;
  };

  const canonicalizePriority = (raw) => {
    const n = norm(raw);
    if (!n) return '';
    const table = [
      ['low', ['baja']],
      ['medium', ['media', 'normal']],
      ['high', ['alta']],
      ['urgent', ['urgente']],
    ];
    for (const [canon, synonyms] of table) {
      if (synonyms.some((w) => n === norm(w) || n.includes(norm(w)))) return canon;
    }
    return n;
  };

  // === Cotizaciones simuladas (placeholder) ===
  const generateProjectQuotations = (project) => {
    if (!project) return [];
    const b = Number(project?.budget) || 0;
    const mid = (project?.code || '').split('-')?.[2] || '000';
    return [
      {
        id: `${project?.id}-quote-1`,
        code: `COT-${mid}-001`,
        version: '1.0',
        status: 'planning',
        statusLabel: 'Planificación',
        amount: b * 0.9,
        createdDate: '2024-01-10',
        expiryDate: '2024-02-10',
        description: 'Cotización inicial para el proyecto',
      },
      {
        id: `${project?.id}-quote-2`,
        code: `COT-${mid}-002`,
        version: '1.1',
        status: 'in-progress',
        statusLabel: 'En Progreso',
        amount: b,
        createdDate: '2024-01-15',
        expiryDate: '2024-03-15',
        description: 'Cotización revisada con especificaciones actualizadas',
      },
    ];
  };

  // ⬇️ Ahora manda al módulo de /cotizaciones (que sí tiene dashboard),
  // pasando el projectId como query param
  const handleCreateQuotation = (project) =>
    navigate(`/cotizaciones?projectId=${project?.id ?? ''}`);

  const handleViewQuotation = (project, quotation) =>
    navigate(`/cotizaciones?quotationId=${quotation?.id ?? ''}`);

  // === Normalizar proyectos ===
  const projectsForFilter = useMemo(() => {
    const pick = (...c) => c.find((v) => v !== undefined && v !== null);
    return (Array.isArray(projects) ? projects : []).map((p) => ({
      ...p,
      name: pick(p.name, p.proyecto, p.titulo, p.nombre) ?? '',
      code: pick(p.code, p.codigo, p.clave) ?? '',
      client: {
        ...(p.client || {}),
        name: pick(p?.client?.name, p.cliente, p.clienteNombre) ?? '',
        type: canonicalizeClientType(p.clientType || p.tipoCliente),
        email: pick(p?.client?.email, p.clienteEmail, p.emailCliente) ?? '',
      },
      department: canonicalizeDepartment(p.department || p.depto),
      priority: canonicalizePriority(p.priority || p.prioridad),
      status: canonicalizeStatus(p.status || p.estado),
      budget: Number(p.budget ?? p.presupuesto ?? 0),
      startDate: pick(p.startDate, p.fechaInicio, p.inicio) ?? '',
      endDate: pick(p.endDate, p.fechaFin, p.fin) ?? '',
      __ref: p,
    }));
  }, [projects]);

  // === Aplicar filtros ===
  const filteredForFilter = useMemo(
    () => applyProjectFilters(projectsForFilter, filters),
    [projectsForFilter, filters]
  );

  const filteredProjects = useMemo(
    () => filteredForFilter.map((p) => p.__ref || p),
    [filteredForFilter]
  );

  const tableKey = useMemo(() => 'tbl-' + JSON.stringify(filters), [filters]);
  const quotations = useMemo(
    () => generateProjectQuotations(selectedProject),
    [selectedProject]
  );
  const hasResults = filteredProjects?.length > 0;

  const handleExportVisible = () => {
    const rows = filteredForFilter || [];
    if (!rows.length) {
      alert('No hay proyectos para exportar con los filtros actuales.');
      return;
    }
    const headers = [
      'name',
      'code',
      'clientName',
      'clientType',
      'department',
      'priority',
      'status',
      'budget',
      'startDate',
      'endDate',
    ];
    const escape = (v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...rows.map((p) =>
        [
          escape(p.name),
          escape(p.code),
          escape(p.client.name),
          escape(p.client.type),
          escape(p.department),
          escape(p.priority),
          escape(p.status),
          escape(p.budget),
          escape(p.startDate),
          escape(p.endDate),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proyectos_filtrados.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Cotizaciones de Proyectos
          </h2>
          <p className="text-muted-foreground">
            Gestiona las cotizaciones asociadas a cada proyecto.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <ProjectFilters
        onFiltersChange={setFilters}
        totalProjects={projects.length}
        filteredProjects={filteredProjects.length}
        onExport={handleExportVisible}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla */}
        <div className="lg:col-span-2 pq--only-edit">
          {hasResults ? (
            <>
              <ProjectTable
                key={tableKey}
                projects={filteredProjects}
                onProjectSelect={(p) => setSelectedProject(p)}
              />
              <style>{`
                .pq--only-edit button[title="Ver detalles"],
                .pq--only-edit button[title="Ver galería de imágenes"],
                .pq--only-edit button[title="Subir imagen"],
                .pq--only-edit button[title="Eliminar proyecto"] {
                  display: none !important;
                }
              `}</style>
            </>
          ) : (
            <div className="flex items-center justify-center h-[320px] border border-dashed border-border rounded-lg bg-muted/20">
              <div className="text-center px-6">
                <Icon
                  name="Filter"
                  size={48}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No se encontraron proyectos con tus filtros
                </h3>
                <p className="text-sm text-muted-foreground">
                  Intenta con otros filtros o parámetros de búsqueda
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Panel cotizaciones */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="FileText" size={18} className="text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Cotizaciones
                </h3>
              </div>
              {selectedProject && (
                <Button
                  size="sm"
                  onClick={() => handleCreateQuotation(selectedProject)}
                >
                  Ir a cotizaciones
                </Button>
              )}
            </div>

            {!selectedProject ? (
              <div className="p-6 text-center">
                <Icon
                  name="Info"
                  size={40}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="text-sm text-muted-foreground">
                  Selecciona{' '}
                  <span className="font-medium text-foreground">un proyecto</span>{' '}
                  en la tabla para ver sus cotizaciones aquí.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <div className="mb-1">
                  <div className="text-sm text-muted-foreground">Proyecto</div>
                  <div className="text-sm font-medium text-foreground">
                    {selectedProject?.name}{' '}
                    <span className="text-muted-foreground">
                      ({selectedProject?.code || '—'})
                    </span>
                  </div>
                </div>

                {quotations.map((q) => (
                  <div
                    key={q.id}
                    className="bg-background rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {q.code}
                          </span>
                          <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            v{q.version}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor(
                              q.status
                            )}`}
                          >
                            {q.statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {q.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[11px] text-muted-foreground">
                              Monto
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {formatCurrency(q.amount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-muted-foreground">
                              Vence
                            </div>
                            <div className="text-sm text-foreground">
                              {formatDate(q.expiryDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {/*
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver"
                          onClick={() => handleViewQuotation(selectedProject, q)}
                        >
                          <Icon name="Eye" size={16} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Descargar PDF"
                          onClick={() => alert(`Descargando PDF de ${q.code}`)}
                        >
                          <Icon name="Download" size={16} />
                        </Button>
                        */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectQuotations;
