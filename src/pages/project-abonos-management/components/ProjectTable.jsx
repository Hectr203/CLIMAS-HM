import React, { useEffect, useMemo, useState } from 'react';
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

/* === Map NoSQL -> ViewModel (con USD derivado) === */
const mapProjectDocStrict = (doc, clientsMap = {}) => {
  const id = doc.id ?? doc._id ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Math.random()}`);
  const code = doc.codigo ?? doc.code ?? '—';
  const name = doc.nombreProyecto ?? doc.nombre ?? 'Proyecto sin nombre';
  const type = doc.tipoProyecto ?? doc.type ?? '—';

  // Manejar diferentes formatos de cliente: objeto {id: "..."} o string ID directo
  const clienteNode = doc.cliente ?? doc.client ?? null;
  let clienteId = null;
  let clienteEncontrado = null;
  
  if (typeof clienteNode === 'string') {
    // Si es un string, es directamente el ID
    clienteId = clienteNode;
  } else if (clienteNode && typeof clienteNode === 'object') {
    // Si es un objeto, puede tener id o _id
    clienteId = clienteNode.id || clienteNode._id || null;
  }
  
  // Buscar el cliente en el mapa por ID
  if (clienteId) {
    clienteEncontrado = clientsMap[clienteId] || null;
  }
  
  const client = {
    id: clienteId || '—',
    name: (clienteNode && typeof clienteNode === 'object' && (clienteNode.nombre || clienteNode.name || clienteNode.empresa || clienteNode.companyName)) 
      ? (clienteNode.nombre || clienteNode.name || clienteNode.empresa || clienteNode.companyName) 
      : (clienteEncontrado?.nombre ?? clienteEncontrado?.name ?? clienteEncontrado?.empresa ?? clienteEncontrado?.companyName ?? '—'),
    contact: (clienteNode && typeof clienteNode === 'object' && (clienteNode.contacto || clienteNode.contact))
      ? (clienteNode.contacto || clienteNode.contact)
      : (clienteEncontrado?.contacto ?? clienteEncontrado?.contact ?? '—'),
    email: (clienteNode && typeof clienteNode === 'object' && clienteNode.email)
      ? clienteNode.email
      : (clienteEncontrado?.email ?? '—'),
  };

  const startDate = doc.cronograma?.fechaInicio ?? doc.startDate ?? null;
  const endDate   = doc.cronograma?.fechaFin    ?? doc.endDate   ?? null;

  const status = doc.status ?? null;
  const statusLabel = doc.statusLabel ?? null;
  const priority = doc.prioridad ?? doc.prioridades ?? doc.priority ?? null;
  const priorityLabel = doc.priorityLabel ?? null;

  const p = doc.presupuesto || {};
  const budget = doc.totalPresupuesto ?? doc.budget ?? p.total ?? null;

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
      const [n, r] = s.split(' - ');
      return { name: n || '—', role: r || '' };
    });
  }

  const workOrders = Array.isArray(doc.workOrders) ? doc.workOrders : undefined;

  return {
    id, code, name, type, image,
    client,
    status, statusLabel,
    priority, priorityLabel,
    budget, startDate, endDate,
    department, location, description,
    assignedPersonnel, workOrders,
    equiposUSD,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    raw: doc,
  };
};

const ProjectTable = ({
  projects,          // opcional: lista preinyectada desde arriba
  onBulkAction,
  onRegisterAbono,
  getPaidAmount,
}) => {
  const navigate = useNavigate();

  // ⬇️ del hook
  const {
    proyectos,            // lista global del hook
    loading: loadingAny,  // loading combinado (si mantuviste el patch)
    error,
    getProyectos,
    deleteProyecto,
  } = useProyecto();

  // Hook para obtener clientes
  const { clients, getClients } = useClient();

  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);

  // Cargar clientes al montar el componente (solo una vez)
  useEffect(() => {
    // Solo cargar si no hay clientes ya cargados
    if (!clients || clients.length === 0) {
      getClients().catch((err) => {
        console.error('Error al cargar clientes:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío para que solo se ejecute una vez al montar

  // Crear mapa de clientes por ID para búsqueda rápida
  const clientsMap = useMemo(() => {
    const map = {};
    if (Array.isArray(clients)) {
      clients.forEach((client) => {
        const clientId = client.id || client._id;
        if (clientId) {
          map[clientId] = client;
        }
      });
    }
    return map;
  }, [clients]);

  // Carga inicial usando el hook (con AbortController)
  useEffect(() => {
    if (projects && projects.length > 0) return; // si viene por props, no pegamos al back

    const controller = new AbortController();
    getProyectos({ force: false, signal: controller.signal }).catch((err) => {
      if (err?.name !== 'AbortError') {
        // ya queda registrado en el hook como error
        console.error('Fallo getProyectos en ProjectTable:', err);
      }
    });

    return () => controller.abort();
  }, [projects, getProyectos]);

  // Fuente de datos: prop > hook
  const sourceDocs = useMemo(() => {
    return Array.isArray(projects) && projects.length > 0 ? projects : proyectos;
  }, [projects, proyectos]);

  const normalizedProjects = useMemo(() => {
    if (!Array.isArray(sourceDocs)) return [];
    return sourceDocs.map((doc) => mapProjectDocStrict(doc, clientsMap));
  }, [sourceDocs, clientsMap]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedProjects = useMemo(() => {
    const list = [...normalizedProjects];
    const { key, direction } = sortConfig || {};
    if (!key) return list;

    return list.sort((a, b) => {
      let aValue = a?.[key];
      let bValue = b?.[key];

      // Mejor manejo de fechas (parse explícito)
      const aDate = parseISODate(aValue);
      const bDate = parseISODate(bValue);
      if (aDate || bDate) {
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

  const handleSelectProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev?.includes(projectId) ? prev?.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };
  const handleSelectAll = () => {
    if (selectedProjects?.length === sortedProjects?.length) setSelectedProjects([]);
    else setSelectedProjects(sortedProjects?.map((p) => p?.id));
  };
  const toggleRowExpansion = (projectId) => {
    setExpandedRows((prev) =>
      prev?.includes(projectId) ? prev?.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  /* =======================
     Eliminar (fila y masivo)
  ======================= */
  const _handleDelete = async (project) => {
    if (!project?.id) return;
    const ok = window.confirm(`¿Eliminar el proyecto "${project?.name || project?.nombreProyecto || project?.code}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteProyecto(project.id); // ⬅️ hook (actualiza estado global)
      setSelectedProjects((prev) => prev.filter((id) => id !== project.id));
      setExpandedRows((prev) => prev.filter((id) => id !== project.id));
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Error eliminando proyecto:', err);
        alert('No se pudo eliminar el proyecto.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedProjects?.length) return;
    const ok = window.confirm(`¿Eliminar ${selectedProjects.length} proyecto(s)?`);
    if (!ok) return;
    try {
      // puedes paralelizar si tu backend lo tolera:
      for (const id of selectedProjects) {
        // eslint-disable-next-line no-await-in-loop
        await deleteProyecto(id);
      }
      setSelectedProjects([]);
    } catch (e) {
      if (e?.name !== 'AbortError') {
        console.error(e);
        alert('Ocurrió un error eliminando algunos proyectos.');
      }
    }
  };

  const _handleImageUpload = async (project) => {
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
  };

  const loading = loadingAny; // alias para tu UI
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
                <input type="checkbox" checked={selectedProjects?.length === sortedProjects?.length && sortedProjects?.length > 0} onChange={handleSelectAll} className="rounded border-border" />
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('code')} className="flex items-center space-x-1 hover:text-primary"><span>Código</span><Icon name="ArrowUpDown" size={14} /></button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('name')} className="flex items-center space-x-1 hover:text-primary"><span>Proyecto</span><Icon name="ArrowUpDown" size={14} /></button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Cliente</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('budget')} className="flex items-center space-x-1 hover:text-primary"><span>Presupuesto</span><Icon name="ArrowUpDown" size={14} /></button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Total restante</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button onClick={() => handleSort('startDate')} className="flex items-center space-x-1 hover:text-primary"><span>Fecha Inicio</span><Icon name="ArrowUpDown" size={14} /></button>
              </th>
              <th className="w-24 p-4 font-medium text-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects?.map((project) => (
              <React.Fragment key={project?.id}>
                <tr className="border-b border-border hover:bg-muted/30 transition-smooth">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedProjects?.includes(project?.id)} onChange={() => handleSelectProject(project?.id)} className="rounded border-border" />
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
                      const paid = typeof getPaidAmount === 'function' ? Number(getPaidAmount({ id: project?.id, _id: project?.id })) || 0 : 0;
                      const budget = Number(project?.budget) || 0;
                      const remaining = Math.max(budget - paid, 0);
                      return <span className="text-foreground font-medium">{formatCurrency(remaining)}</span>;
                    })()}
                  </td>
                  <td className="p-4"><div className="text-sm text-foreground">{formatDate(project?.startDate)}</div></td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => onRegisterAbono?.(project)} title="Registrar abono"><Icon name="CreditCard" size={16} /></Button>
                      {/* Ejemplo de acción de imagen si luego lo conectas */}
                      {/* <Button variant="ghost" size="icon" onClick={() => _handleImageUpload(project)} title="Subir imagen"><Icon name="Image" size={16} /></Button> */}
                    </div>
                  </td>
                </tr>

                {expandedRows?.includes(project?.id) && (
                  <tr className="bg-muted/20">
                    <td colSpan={8} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Detalles del Proyecto</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Departamento:</span><span className="text-foreground">{project?.department || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Fecha Fin:</span><span className="text-foreground">{formatDate(project?.endDate)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Ubicación:</span><span className="text-foreground">{project?.location || '—'}</span></div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Personal Asignado</h4>
                          <div className="space-y-2">
                            {(project?.assignedPersonnel || [])?.map((person, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center"><Icon name="User" size={12} color="white" /></div>
                                <span className="text-sm text-foreground">{person?.name}</span>
                                {person?.role && <span className="text-xs text-muted-foreground">({person?.role})</span>}
                              </div>
                            ))}
                            {(!project?.assignedPersonnel || project?.assignedPersonnel?.length === 0) && (
                              <div className="text-sm text-muted-foreground">Sin personal asignado</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Descripción</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{project?.description || '—'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Acciones Rápidas</h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" iconName="Image" iconPosition="left" onClick={() => navigate(`/project-gallery-viewer/${project?.id}`)} className="w-full justify-start">Ver Galería</Button>
                            <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left" className="w-full justify-start" onClick={() => navigate(`/project-timeline/${project?.id}`)}>Ver Cronograma</Button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
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
                <input type="checkbox" checked={selectedProjects?.includes(project?.id)} onChange={() => handleSelectProject(project?.id)} className="rounded border-border" />
                <Image src={project?.image} alt={project?.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <div className="font-medium text-foreground">{project?.name}</div>
                  <div className="text-sm text-muted-foreground">{project?.code}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(project?.id)}><Icon name="ChevronUp" size={16} /></Button>
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
                  const paid = typeof getPaidAmount === 'function' ? Number(getPaidAmount({ id: project?.id, _id: project?.id })) || 0 : 0;
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
