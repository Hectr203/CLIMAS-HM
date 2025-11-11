import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import useProyecto from '../../../hooks/useProyect'; // ⬅️ usa el hook
import useClient from '../../../hooks/useClient';

/* === Config === */
const DEFAULT_USD_RATE = 18;

/* === Utils === */
const parseISODate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};
const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};
const formatUSD = (amount) => {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount);
};
const formatDate = (date) => {
  const d = date instanceof Date ? date : parseISODate(date);
  if (!d) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/* === Map NoSQL -> ViewModel (con USD derivado y resumen financiero del backend) === */
const mapProjectDocStrict = (doc, clientsMap = {}) => {
  const rawId = doc.id ?? doc._id ?? null;
  const code = doc.codigo ?? doc.code ?? '—';
  const id = rawId ?? `ui-${(code || 'sin-codigo')}`; // ID estable para React keys; no usar para backend si no hay rawId
  const name = doc.nombreProyecto ?? doc.nombre ?? 'Proyecto sin nombre';
  const type = doc.tipoProyecto ?? doc.type ?? '—';

  // Manejo flexible de cliente (string id u objeto)
  const clienteNode = doc.cliente ?? doc.client ?? null;
  let clienteId = null;
  if (typeof clienteNode === 'string') {
    clienteId = clienteNode;
  } else if (clienteNode && typeof clienteNode === 'object') {
    clienteId = clienteNode.id || clienteNode._id || null;
  }
  const clienteEncontrado = clienteId != null ? (clientsMap[String(clienteId)] || null) : null;

  const client = {
    id: clienteId || '—',
    name:
      (clienteNode && typeof clienteNode === 'object' &&
        (clienteNode.nombre || clienteNode.name || clienteNode.empresa || clienteNode.companyName))
        ? (clienteNode.nombre || clienteNode.name || clienteNode.empresa || clienteNode.companyName)
        : (clienteEncontrado?.nombre ?? clienteEncontrado?.name ?? clienteEncontrado?.empresa ?? clienteEncontrado?.companyName ?? '—'),
    contact:
      (clienteNode && typeof clienteNode === 'object' && (clienteNode.contacto || clienteNode.contact))
        ? (clienteNode.contacto || clienteNode.contact)
        : (clienteEncontrado?.contacto ?? clienteEncontrado?.contact ?? '—'),
    email:
      (clienteNode && typeof clienteNode === 'object' && clienteNode.email)
        ? clienteNode.email
        : (clienteEncontrado?.email ?? '—'),
  };

  const startDate = doc.cronograma?.fechaInicio ?? doc.startDate ?? null;
  const endDate   = doc.cronograma?.fechaFin    ?? doc.endDate   ?? null;

  const status = doc.status ?? doc.estado ?? null;
  const statusLabel = doc.statusLabel ?? null;
  const priority = doc.prioridad ?? doc.prioridades ?? doc.priority ?? null;
  const priorityLabel = doc.priorityLabel ?? null;

  const p = doc.presupuesto || {};
  const budget = doc.totalPresupuesto ?? doc.budget ?? p.total ?? null;

  // Equipos USD: respeta USD si lo enviaron; si viene MXN convierte por tipoCambio o DEFAULT_USD_RATE
  const equiposUSD = (() => {
    if (p.equipoDolares != null && !isNaN(Number(p.equipoDolares))) {
      return Number(p.equipoDolares) || 0;
    }
    if (p?._metaEquipos?.capturadoEn === 'USD' && p?._metaEquipos?.valorUSD != null) {
      const v = Number(p._metaEquipos.valorUSD);
      if (!isNaN(v)) return v;
    }
    const mxn = Number(p?.equipos || 0);
    if (!(mxn > 0)) return 0;
    const rate = Number(p?._metaEquipos?.tipoCambio);
    const divisor = (rate && rate > 0) ? rate : DEFAULT_USD_RATE;
    return mxn / divisor;
  })();

  const department = doc.departamento ?? doc.department ?? null;
  const location   = doc.ubicacion ?? doc.location ?? null;
  const description= doc.descripcion ?? doc.description ?? null;
  const image      = doc.image ?? null;

  let assignedPersonnel = null;
  if (Array.isArray(doc.assignedPersonnel)) {
    assignedPersonnel = doc.assignedPersonnel;
  } else if (Array.isArray(doc.personalAsignado)) {
    assignedPersonnel = doc.personalAsignado.map((s) => {
      if (typeof s !== 'string') return { name: String(s ?? '—'), role: '' };
      // Soporta separadores "—" o "-" (para robustez)
      const parts = s.split(/—| - /);
      const n = (parts[0] || '').trim();
      const r = (parts[1] || '').trim();
      return { name: n || '—', role: r || '' };
    });
  }

  const workOrders = Array.isArray(doc.workOrders) ? doc.workOrders : undefined;

  // --- Resumen financiero del backend (preferente) ---
  const resumen = doc.resumenFinanciero || {};
  const totalAbonadoDB = Number(
    resumen.totalAbonado ?? resumen.total_abonado ?? 0
  );
  const totalRestanteDB = (() => {
    const v =
      resumen.totalRestante ?? // nombre preferente
      resumen.saldoPendiente ?? // variante común
      resumen.saldo_pendiente;
    return (v === null || v === undefined) ? null : Number(v);
  })();
  const porcentajePagadoDB = Number(
    resumen.porcentajePagado ?? resumen.porcentaje_pagado ?? null
  );

  return {
    id, rawId, code, name, type, image,
    client,
    status, statusLabel,
    priority, priorityLabel,
    budget, startDate, endDate,
    department, location, description,
    assignedPersonnel, workOrders,
    equiposUSD,
    financialSummary: {
      totalAbonado: isNaN(totalAbonadoDB) ? null : totalAbonadoDB,
      totalRestante: (totalRestanteDB != null && !isNaN(totalRestanteDB)) ? totalRestanteDB : null,
      porcentajePagado: isNaN(porcentajePagadoDB) ? null : porcentajePagadoDB,
    },
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    raw: doc,
  };
};

const ProjectTable = ({
  projects,          // opcional: lista (array) o wrapper { success, data }
  onBulkAction,
  onRegisterAbono,
  getPaidAmount,     // fallback si el backend aún no envía totalRestante
}) => {
  const navigate = useNavigate();

  // Hook de proyectos
  const {
    proyectos,            // puede ser array o wrapper { success, data }
    loading: loadingAny,
    error,
    getProyectos,
    deleteProyecto,
  } = useProyecto();

  // Hook de clientes
  const { clients, getClients } = useClient();

  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  // Cargar clientes al montar
  useEffect(() => {
    if (!clients || clients.length === 0) {
      getClients().catch((err) => console.error('Error al cargar clientes:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mapa de clientes por ID (normalizado a string)
  const clientsMap = useMemo(() => {
    const map = {};
    if (Array.isArray(clients)) {
      clients.forEach((client) => {
        const clientId = client.id ?? client._id;
        if (clientId != null) map[String(clientId)] = client;
      });
    }
    return map;
  }, [clients]);

  // Carga inicial de proyectos (si no vienen por props)
  useEffect(() => {
    if (projects && ((Array.isArray(projects)) || (projects?.data && Array.isArray(projects.data)))) {
      return; // ya viene por props
    }
    const controller = new AbortController();
    getProyectos({ force: false, signal: controller.signal }).catch((err) => {
      if (err?.name !== 'AbortError') console.error('Fallo getProyectos en ProjectTable:', err);
    });
    return () => controller.abort();
  }, [projects, getProyectos]);

  // Fuente de datos: soporta array plano o wrapper { success, data }
  const sourceDocs = useMemo(() => {
    if (projects?.data && Array.isArray(projects.data)) return projects.data;
    if (proyectos?.data && Array.isArray(proyectos.data)) return proyectos.data;
    if (Array.isArray(projects)) return projects;
    if (Array.isArray(proyectos)) return proyectos;
    return [];
  }, [projects, proyectos]);

  const normalizedProjects = useMemo(() => {
    if (!Array.isArray(sourceDocs)) return [];
    return sourceDocs.map((doc) => mapProjectDocStrict(doc, clientsMap));
  }, [sourceDocs, clientsMap]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      const direction = (prev?.key === key && prev?.direction === 'asc') ? 'desc' : 'asc';
      return { key, direction };
    });
  }, []);

  const sortedProjects = useMemo(() => {
    const list = [...normalizedProjects];
    const { key, direction } = sortConfig || {};
    if (!key) return list;

    return list.sort((a, b) => {
      let aValue = a?.[key];
      let bValue = b?.[key];

      // Ordenar fechas solo cuando la columna es fecha
      if (key === 'startDate' || key === 'endDate') {
        const aDate = parseISODate(aValue);
        const bDate = parseISODate(bValue);
        const aTime = aDate ? aDate.getTime() : -Infinity;
        const bTime = bDate ? bDate.getTime() : -Infinity;
        return direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (typeof aValue === 'number' || typeof bValue === 'number') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      aValue = (aValue ?? '').toString().toLowerCase();
      bValue = (bValue ?? '').toString().toLowerCase();
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [normalizedProjects, sortConfig]);

  const handleSelectProject = useCallback((projectId) => {
    setSelectedProjects((prev) =>
      prev?.includes(projectId) ? prev?.filter((id) => id !== projectId) : [...prev, projectId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedProjects?.length === sortedProjects?.length) setSelectedProjects([]);
    else setSelectedProjects(sortedProjects?.map((p) => p?.id));
  }, [selectedProjects?.length, sortedProjects]);

  const toggleRowExpansion = useCallback((projectId) => {
    setExpandedRows((prev) =>
      prev?.includes(projectId) ? prev?.filter((id) => id !== projectId) : [...prev, projectId]
    );
  }, []);

  /* =======================
     Eliminar (fila y masivo)
  ======================= */
  const _handleDelete = useCallback(async (project) => {
    if (!project?.rawId) {
      alert('Este proyecto no tiene ID persistente. No se puede eliminar.');
      return;
    }
    const ok = window.confirm(`¿Eliminar el proyecto "${project?.name || project?.code}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteProyecto(project.rawId); // usar rawId para backend
      setSelectedProjects((prev) => prev.filter((id) => id !== project.id));
      setExpandedRows((prev) => prev.filter((id) => id !== project.id));
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Error eliminando proyecto:', err);
        alert('No se pudo eliminar el proyecto.');
      }
    }
  }, [deleteProyecto]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedProjects?.length) return;
    const ok = window.confirm(`¿Eliminar ${selectedProjects.length} proyecto(s)?`);
    if (!ok) return;
    try {
      // si tu backend tolera paralelismo:
      // await Promise.all(selectedProjects.map((rid) => deleteProyecto(rid)));
      for (const id of selectedProjects) {
        const p = normalizedProjects.find(x => x.id === id);
        if (p?.rawId) {
          // eslint-disable-next-line no-await-in-loop
          await deleteProyecto(p.rawId);
        }
      }
      setSelectedProjects([]);
    } catch (e) {
      if (e?.name !== 'AbortError') {
        console.error(e);
        alert('Ocurrió un error eliminando algunos proyectos.');
      }
    }
  }, [selectedProjects, deleteProyecto, normalizedProjects]);

  const _handleImageUpload = useCallback(async (project) => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = false;
      fileInput.onchange = async (event) => {
        const file = event?.target?.files?.[0];
        if (file) {
          if (!file?.type?.startsWith('image/')) return alert('Archivo de imagen inválido');
          const maxSize = 5 * 1024 * 1024;
          if (file?.size > maxSize) return alert('Máximo 5MB');
          alert(`Imagen "${file?.name}" cargada para "${project?.name}" (demo)`);
        }
      };
      fileInput?.click();
    } catch (error) {
      console.error('Error al seleccionar imagen para proyecto:', project?.code, error);
      alert('Error al seleccionar la imagen. Inténtelo de nuevo.');
    }
  }, []);

  const loading = loadingAny;
  const errorMsg = error ? (error.userMessage || error.message || 'Error') : '';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {loading && <div className="p-4 border-b border-border text-sm text-muted-foreground">Cargando proyectos…</div>}
      {!!errorMsg && <div className="p-4 border-b border-border text-sm text-red-600">{errorMsg}</div>}

      {selectedProjects?.length > 0 && (
        <div className="bg-primary/5 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">{selectedProjects?.length} proyecto(s) seleccionado(s)</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" iconName="Edit" iconPosition="left" onClick={() => onBulkAction?.('edit', selectedProjects)}>Editar Estado</Button>
              <Button variant="outline" size="sm" iconName="FileText" iconPosition="left" onClick={() => onBulkAction?.('export', selectedProjects)}>Exportar</Button>
              <Button variant="outline" size="sm" iconName="Mail" iconPosition="left" onClick={() => onBulkAction?.('notify', selectedProjects)}>Notificar</Button>
              <Button variant="outline" size="sm" iconName="Trash2" iconPosition="left" onClick={handleBulkDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedProjects?.length === sortedProjects?.length && sortedProjects?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                  aria-label="Seleccionar todos"
                />
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('code')} className="flex items-center space-x-1 hover:text-primary">
                  <span>Código</span><Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('name')} className="flex items-center space-x-1 hover:text-primary">
                  <span>Proyecto</span><Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Cliente</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('budget')} className="flex items-center space-x-1 hover:text-primary">
                  <span>Presupuesto</span><Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Total restante</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('startDate')} className="flex items-center space-x-1 hover:text-primary">
                  <span>Fecha Inicio</span><Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="w-28 p-4 font-medium text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects?.map((project) => (
              <React.Fragment key={project?.id}>
                <tr className="border-b border-border hover:bg-muted/30 transition-smooth">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProjects?.includes(project?.id)}
                      onChange={() => handleSelectProject(project?.id)}
                      className="rounded border-border"
                      aria-label={`Seleccionar ${project?.name}`}
                    />
                  </td>
                  <td className="p-4"><span className="font-mono text-sm text-primary">{project?.code}</span></td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Image src={project?.image} alt={project?.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-medium text-foreground">{project?.name}</div>
                        <div className="text-sm text-muted-foreground">{project?.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{project?.client?.name}</div>
                      <div className="text-sm text-muted-foreground">{project?.client?.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-foreground font-medium">{formatCurrency(project?.budget)}</div>
                    {Number(project?.equiposUSD) > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Equipos: <span className="font-medium">{formatUSD(project?.equiposUSD)}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {(() => {
                      // 1) valor directo desde backend si está presente
                      const fromDB = project?.financialSummary?.totalRestante;
                      if (typeof fromDB === 'number' && !isNaN(fromDB)) {
                        return <span className="text-foreground font-medium">{formatCurrency(fromDB)}</span>;
                      }
                      // 2) fallback: calcula a partir de pagos locales si el backend aún no lo manda
                      const paid = typeof getPaidAmount === 'function'
                        ? Number(getPaidAmount({ id: project?.rawId || project?.id })) || 0
                        : 0;
                      const budget = Number(project?.budget) || 0;
                      const remaining = Math.max(budget - paid, 0);
                      return <span className="text-foreground font-medium">{formatCurrency(remaining)}</span>;
                    })()}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-foreground">{formatDate(project?.startDate)}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRegisterAbono?.(project)}
                        title="Registrar abono"
                        aria-label="Registrar abono"
                      >
                        <Icon name="CreditCard" size={16} />
                      </Button>

                      {/* Ejemplo de acción de imagen si luego lo conectas */}
                      {/* <Button variant="ghost" size="icon" onClick={() => _handleImageUpload(project)} title="Subir imagen" aria-label="Subir imagen"><Icon name="Image" size={16} /></Button> */}
                    </div>
                  </td>
                </tr>

              </React.Fragment>
            ))}
            {sortedProjects?.length === 0 && !loading && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No hay proyectos para mostrar.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="lg:hidden">
        {sortedProjects?.map((project) => (
          <div key={project?.id} className="border-b border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedProjects?.includes(project?.id)}
                  onChange={() => handleSelectProject(project?.id)}
                  className="rounded border-border"
                  aria-label={`Seleccionar ${project?.name}`}
                />
                <Image src={project?.image} alt={project?.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <div className="font-medium text-foreground">{project?.name}</div>
                  <div className="text-sm text-muted-foreground">{project?.code}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleRowExpansion(project?.id)}
                aria-label="Alternar detalles"
                title={expandedRows.includes(project.id) ? "Ocultar detalles" : "Ver detalles"}
              >
                <Icon name={expandedRows.includes(project.id) ? "ChevronUp" : "ChevronDown"} size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div className="text-sm text-foreground font-medium">{project?.client?.name}</div>
                <div className="text-xs text-muted-foreground">{project?.client?.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Presupuesto</div>
                <div className="text-sm text-foreground font-medium">{formatCurrency(project?.budget)}</div>
                {Number(project?.equiposUSD) > 0 && (
                  <div className="text-[11px] text-muted-foreground">Equipos: {formatUSD(project?.equiposUSD)}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Total restante</div>
                {(() => {
                  const fromDB = project?.financialSummary?.totalRestante;
                  if (typeof fromDB === 'number' && !isNaN(fromDB)) {
                    return <div className="text-sm text-foreground font-medium">{formatCurrency(fromDB)}</div>;
                  }
                  const paid = typeof getPaidAmount === 'function'
                    ? Number(getPaidAmount({ id: project?.rawId || project?.id })) || 0
                    : 0;
                  const budget = Number(project?.budget) || 0;
                  const remaining = Math.max(budget - paid, 0);
                  return <div className="text-sm text-foreground font-medium">{formatCurrency(remaining)}</div>;
                })()}
              </div>
            </div>

            {expandedRows?.includes(project?.id) && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-xs text-muted-foreground">Inicio</div><div className="text-sm text-foreground">{formatDate(project?.startDate)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Fin</div><div className="text-sm text-foreground">{formatDate(project?.endDate)}</div></div>
                    <div><div className="text-xs text-muted-foreground">Departamento</div><div className="text-sm text-foreground">{project?.department || '—'}</div></div>
                    <div><div className="text-xs text-muted-foreground">Ubicación</div><div className="text-sm text-foreground">{project?.location || '—'}</div></div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Personal Asignado</div>
                    <div className="flex flex-wrap gap-2">
                      {(project?.assignedPersonnel || [])?.map((person, index) => (
                        <div key={index} className="flex items-center space-x-1 bg-muted px-2 py-1 rounded">
                          <Icon name="User" size={12} />
                          <span className="text-xs text-foreground">{person?.name}</span>
                          {person?.role && <span className="text-[10px] text-muted-foreground">({person?.role})</span>}
                        </div>
                      ))}
                      {(!project?.assignedPersonnel || project?.assignedPersonnel?.length === 0) && (
                        <div className="text-xs text-muted-foreground">Sin personal asignado</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Descripción</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{project?.description || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {sortedProjects?.length === 0 && !loading && (
          <div className="p-8 text-center text-muted-foreground">No hay proyectos para mostrar.</div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
