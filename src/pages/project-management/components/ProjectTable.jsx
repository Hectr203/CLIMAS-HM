import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import proyectoService from 'services/proyectoService';

/* === Config === */
const DEFAULT_USD_RATE = 18;

/* === Helpers seguros === */
const safeUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

/* === Utils === */
const parseISODate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

const formatUSD = (amount) => {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date) => {
  const d = date instanceof Date ? date : parseISODate(date);
  if (!d) return '—';
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusColor = (statusValue) => {
  const v = (statusValue || '').toString().toLowerCase().trim();
  const map = {
    planeacion: 'bg-blue-100 text-blue-800',
    planificación: 'bg-blue-100 text-blue-800',
    'en-progreso': 'bg-green-100 text-green-800',
    'en progreso': 'bg-green-100 text-green-800',
    'en pausa': 'bg-yellow-100 text-yellow-800',
    revision: 'bg-purple-100 text-purple-800',
    revisión: 'bg-purple-100 text-purple-800',
    completado: 'bg-emerald-100 text-emerald-800',
    cancelado: 'bg-red-100 text-red-800',
    planning: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    review: 'bg-purple-100 text-purple-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[v] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priorityValue) => {
  const v = (priorityValue || '').toString().toLowerCase().trim();
  const map = {
    baja: 'text-green-600',
    media: 'text-yellow-600',
    alta: 'text-orange-600',
    urgente: 'text-red-600',
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  };
  return map[v] || 'text-gray-600';
};

/* === Normalizador del proyecto === */
const mapProjectDocStrict = (doc) => {
  const id = doc.id ?? doc._id ?? safeUUID();
  const code = doc.codigo ?? doc.code ?? '—';
  const name = doc.nombreProyecto ?? doc.name ?? 'Proyecto sin nombre';
  const type = doc.tipoProyecto ?? doc.type ?? '—';

  const clienteNode = doc.cliente ?? doc.client ?? {};
  const client = {
    id: clienteNode.id,
    name: clienteNode.nombre ?? clienteNode.name,
    contact: clienteNode.contacto ?? clienteNode.contact,
  };

  const startDate = doc.cronograma?.fechaInicio ?? doc.startDate ?? null;
  const endDate = doc.cronograma?.fechaFin ?? doc.endDate ?? null;

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
    const divisor = rate && rate > 0 ? rate : DEFAULT_USD_RATE;
    return mxn / divisor;
  })();

  const department = doc.departamento ?? doc.department ?? null;
  const location = doc.ubicacion ?? doc.location ?? null;
  const description = doc.descripcion ?? doc.description ?? null;
  const image = doc.image ?? null;

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

  const abonos = Array.isArray(doc.abonos) ? doc.abonos : [];

  return {
    id,
    code,
    name,
    type,
    image,
    client,
    status,
    statusLabel,
    priority,
    priorityLabel,
    budget,
    startDate,
    endDate,
    department,
    location,
    description,
    assignedPersonnel,
    workOrders,
    equiposUSD,
    abonos,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    raw: doc,
  };
};

const ProjectTable = ({
  projects,
  onProjectSelect,
  onStatusUpdate,
  onBulkAction,
  onImageUpload,
  isUploadingImage,
}) => {
  const navigate = useNavigate();

  const [remoteDocs, setRemoteDocs] = useState([]); // overrides locales
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [newAbonoDraft, setNewAbonoDraft] = useState({});

  /* === carga inicial si no viene projects por props === */
  useEffect(() => {
    let isMounted = true;
    const fetchProyectos = async () => {
      try {
        if (projects && projects.length > 0) return;
        setLoading(true);
        setErrorMsg('');
        const data = await proyectoService.getProyectos().catch(() => []);
        if (!isMounted) return;

        setRemoteDocs(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : []
        );
      } catch (err) {
        console.error('Error al obtener los proyectos:', err);
        if (isMounted) setErrorMsg('No se pudieron cargar los proyectos.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProyectos();
    return () => {
      isMounted = false;
    };
  }, [projects]);

  /* === snapshot vivo del proyecto (importante para abonos) === */
  const getProjectLiveSnapshot = (projectId) => {
    const inRemote = remoteDocs.find((d) => (d.id || d._id) === projectId);
    if (inRemote) return inRemote;
    if (Array.isArray(projects)) {
      const inProps = projects.find((d) => (d.id || d._id) === projectId);
      if (inProps) return inProps;
    }
    return undefined;
  };

  /* === base para renderizar la tabla (orden, etc.) === */
  const baseSourceDocs = useMemo(() => {
    return Array.isArray(projects) && projects.length > 0 ? projects : remoteDocs;
  }, [projects, remoteDocs]);

  const normalizedProjects = useMemo(() => {
    if (!Array.isArray(baseSourceDocs)) return [];
    return baseSourceDocs.map(mapProjectDocStrict);
  }, [baseSourceDocs]);

  /* === asegurar borrador de abono === */
  useEffect(() => {
    setNewAbonoDraft((prev) => {
      const clone = { ...prev };
      normalizedProjects.forEach((p) => {
        if (!clone[p.id]) {
          clone[p.id] = { fecha: '', monto: '', nota: '' };
        }
      });
      return clone;
    });
  }, [normalizedProjects]);

  /* === sorting === */
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

      if (aValue instanceof Date || bValue instanceof Date) {
        const aTime = aValue instanceof Date ? aValue.getTime() : -Infinity;
        const bTime = bValue instanceof Date ? bValue.getTime() : -Infinity;
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

  /* === selección y expandir === */
  const handleSelectProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev?.includes(projectId) ? prev?.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects?.length === sortedProjects?.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(sortedProjects?.map((p) => p?.id));
    }
  };

  const toggleRowExpansion = (projectId) => {
    setExpandedRows((prev) =>
      prev?.includes(projectId) ? prev?.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  /* === eliminar proyecto === */
  const handleDelete = async (project) => {
    if (!project?.id) return;
    const ok = window.confirm(
      `¿Eliminar el proyecto "${project?.name || project?.nombreProyecto || project?.code}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      await proyectoService.deleteProyecto(project.id);

      setRemoteDocs((prev) =>
        prev.filter((d) => (d.id || d._id) !== project.id)
      );

      setSelectedProjects((prev) => prev.filter((id) => id !== project.id));
      setExpandedRows((prev) => prev.filter((id) => id !== project.id));
    } catch (err) {
      console.error('Error eliminando proyecto:', err);
      alert('No se pudo eliminar el proyecto.');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedProjects?.length) return;
    const ok = window.confirm(`¿Eliminar ${selectedProjects.length} proyecto(s)?`);
    if (!ok) return;

    try {
      for (const id of selectedProjects) {
        await proyectoService.deleteProyecto(id);
      }

      setRemoteDocs((prev) =>
        prev.filter((d) => !selectedProjects.includes(d.id || d._id))
      );

      setSelectedProjects([]);
    } catch (e) {
      console.error(e);
      alert('Ocurrió un error eliminando algunos proyectos.');
    }
  };

  /* === imagen demo === */
  const handleImageUpload = async (project) => {
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
      console.error('Error al seleccionar imagen:', error);
      alert('Error al seleccionar la imagen. Inténtelo de nuevo.');
    }
  };

  /* === ABONOS === */

  const getAbonosForProject = (projectId) => {
    const snap = getProjectLiveSnapshot(projectId);
    if (!snap) return [];
    if (!Array.isArray(snap.abonos)) return [];
    return snap.abonos;
  };

  const getTotalsForProject = (project) => {
    const snap = getProjectLiveSnapshot(project.id) || {};

    const presupuestoTotal = Number(
      snap.totalPresupuesto ??
        snap.budget ??
        snap.presupuesto?.total ??
        project.budget ??
        0
    );

    const abonosList = getAbonosForProject(project.id);
    const totalAbonado = abonosList.reduce(
      (sum, a) => sum + (Number(a?.monto) || 0),
      0
    );

    const restante = presupuestoTotal - totalAbonado;
    const percentRaw =
      presupuestoTotal > 0 ? (totalAbonado / presupuestoTotal) * 100 : 0;
    const percent = Math.min(Math.max(percentRaw, 0), 100);

    return {
      presupuestoTotal,
      abonosList,
      totalAbonado,
      restante,
      percent,
    };
  };

  const handleDraftChange = (projectId, field, value) => {
    setNewAbonoDraft((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), [field]: value },
    }));
  };

  const handleAddAbono = (project) => {
    // NEW: bloqueamos desde la lógica también
    const { restante } = getTotalsForProject(project);
    if (restante <= 0) {
      alert('Este proyecto ya está pagado en su totalidad.');
      return;
    }

    const draft = newAbonoDraft[project.id] || {};
    const montoNumber = Number(draft.monto);

    if (!draft.fecha) {
      alert('Falta la fecha del abono');
      return;
    }
    if (!montoNumber || montoNumber <= 0) {
      alert('Monto inválido');
      return;
    }

    // NEW: si con este abono te pasas del total también lo bloqueamos
    if (montoNumber > restante) {
      alert('El abono excede el restante pendiente.');
      return;
    }

    const nuevoAbono = {
      fecha: draft.fecha,
      monto: montoNumber,
      nota: draft.nota?.trim() || '',
      _tmpId: safeUUID(),
    };

    const snap = getProjectLiveSnapshot(project.id);

    const updated = (() => {
      const prevAbonos = Array.isArray(snap?.abonos) ? snap.abonos : [];
      return {
        ...snap,
        id: snap.id ?? project.id,
        abonos: [...prevAbonos, nuevoAbono],
      };
    })();

    setRemoteDocs((prev) => {
      const exists = prev.some((p) => (p.id || p._id) === project.id);
      if (exists) {
        return prev.map((p) => {
          const pid = p.id || p._id;
          return pid === project.id ? updated : p;
        });
      } else {
        return [...prev, updated];
      }
    });

    setNewAbonoDraft((prev) => ({
      ...prev,
      [project.id]: { fecha: '', monto: '', nota: '' },
    }));
  };

  /* === RENDER === */

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {loading && (
        <div className="p-4 border-b border-border text-sm text-muted-foreground">
          Cargando proyectos…
        </div>
      )}
      {!!errorMsg && (
        <div className="p-4 border-b border-border text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {selectedProjects?.length > 0 && (
        <div className="bg-primary/5 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              {selectedProjects?.length} proyecto(s) seleccionado(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                onClick={() => onBulkAction?.('edit', selectedProjects)}
              >
                Editar Estado
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="FileText"
                iconPosition="left"
                onClick={() => onBulkAction?.('export', selectedProjects)}
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Mail"
                iconPosition="left"
                onClick={() => onBulkAction?.('notify', selectedProjects)}
              >
                Notificar
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Trash2"
                iconPosition="left"
                onClick={handleBulkDelete}
              >
                Eliminar
              </Button>
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
                  checked={
                    selectedProjects?.length === sortedProjects?.length &&
                    sortedProjects?.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('code')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Código</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Proyecto</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Cliente</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Estado</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Prioridad</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('budget')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Presupuesto</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('startDate')}
                  className="flex items-center space-x-1 hover:text-primary"
                >
                  <span>Fecha Inicio</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="w-24 p-4 font-medium text-foreground">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {sortedProjects?.map((project) => {
              const {
                presupuestoTotal,
                abonosList,
                totalAbonado,
                restante,
                percent,
              } = getTotalsForProject(project);

              const draft = newAbonoDraft[project.id] || {
                fecha: '',
                monto: '',
                nota: '',
              };

              // NEW: bandera para bloquear inputs y botón
              const isPagado = restante <= 0;

              return (
                <React.Fragment key={project?.id}>
                  {/* fila principal */}
                  <tr className="border-b border-border hover:bg-muted/30 transition-smooth">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects?.includes(project?.id)}
                        onChange={() => handleSelectProject(project?.id)}
                        className="rounded border-border"
                      />
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-sm text-primary">{project?.code}</span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={project?.image}
                          alt={project?.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-foreground">{project?.name}</div>
                          <div className="text-sm text-muted-foreground">{project?.type}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{project?.client?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project?.client?.contact}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          project?.status
                        )}`}
                      >
                        {project?.statusLabel || project?.status || '—'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Icon
                          name="AlertCircle"
                          size={16}
                          className={getPriorityColor(project?.priority)}
                        />
                        <span className="text-sm text-foreground">
                          {project?.priorityLabel || project?.priority || '—'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-foreground font-medium">
                        {formatCurrency(project?.budget)}
                      </div>
                      {Number(project?.equiposUSD) > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Equipos:{' '}
                          <span className="font-medium">
                            {formatUSD(project?.equiposUSD)}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="text-sm text-foreground">
                        {formatDate(project?.startDate)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRowExpansion(project?.id)}
                          title="Ver detalles"
                        >
                          <Icon
                            name={
                              expandedRows?.includes(project?.id)
                                ? 'ChevronUp'
                                : 'ChevronDown'
                            }
                            size={16}
                          />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/project-detail-gallery/${project?.id}`)
                          }
                          title="Ver galería de imágenes"
                        >
                          <Icon name="Image" size={16} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleImageUpload(project)}
                          title="Subir imagen"
                        >
                          <Icon name="Upload" size={16} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onProjectSelect?.(project)}
                          title="Editar proyecto"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project)}
                          title="Eliminar proyecto"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* fila expandida */}
                  {expandedRows?.includes(project?.id) && (
                    <tr className="bg-muted/20">
                      <td colSpan={9} className="p-4">
                        {/* detalles */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div>
                            <h4 className="font-medium text-foreground mb-2">
                              Detalles del Proyecto
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Departamento:</span>
                                <span className="text-foreground">
                                  {project?.department || '—'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha Fin:</span>
                                <span className="text-foreground">
                                  {formatDate(project?.endDate)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Ubicación:</span>
                                <span className="text-foreground">
                                  {project?.location || '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-2">
                              Personal Asignado
                            </h4>
                            <div className="space-y-2">
                              {(project?.assignedPersonnel || [])?.map(
                                (person, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center space-x-2"
                                  >
                                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                      <Icon
                                        name="User"
                                        size={12}
                                        color="white"
                                      />
                                    </div>
                                    <span className="text-sm text-foreground">
                                      {person?.name}
                                    </span>
                                    {person?.role && (
                                      <span className="text-xs text-muted-foreground">
                                        ({person?.role})
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                              {(!project?.assignedPersonnel ||
                                project?.assignedPersonnel?.length === 0) && (
                                <div className="text-sm text-muted-foreground">
                                  Sin personal asignado
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-2">
                              Descripción
                            </h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {project?.description || '—'}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-2">
                              Acciones Rápidas
                            </h4>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="Image"
                                iconPosition="left"
                                onClick={() =>
                                  navigate(`/project-gallery-viewer/${project?.id}`)
                                }
                                className="w-full justify-start"
                              >
                                Ver Galería
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="Calendar"
                                iconPosition="left"
                                className="w-full justify-start"
                                onClick={() =>
                                  navigate(`/project-timeline/${project?.id}`)
                                }
                              >
                                Ver Cronograma
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* === ABONOS === */}
                        <div className="mt-6 border-t border-border pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon
                                name="DollarSign"
                                size={16}
                                className="text-green-600"
                              />
                              <h4 className="font-semibold text-foreground text-sm">
                                Abonos
                              </h4>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              Seguimiento de pagos del proyecto
                            </span>
                          </div>

                          {/* lista de abonos */}
                          {abonosList.length > 0 ? (
                            <div className="mb-3 rounded-md border border-border bg-white/40 dark:bg-muted/20 divide-y divide-border text-[12px]">
                              {abonosList.map((abono, idx) => (
                                <div
                                  key={abono._tmpId || idx}
                                  className="flex flex-wrap justify-between items-center px-3 py-1.5"
                                >
                                  <div className="text-foreground flex items-center gap-1">
                                    <span className="text-muted-foreground">📅</span>
                                    <span>{formatDate(abono.fecha)}</span>
                                  </div>

                                  <div className="font-medium text-green-700">
                                    {formatCurrency(abono.monto)}
                                  </div>

                                  <div className="text-muted-foreground italic truncate max-w-[200px]">
                                    {abono.nota || 'Sin nota'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[12px] text-muted-foreground mb-3">
                              No hay abonos registrados
                            </p>
                          )}

                          {/* form nuevo abono */}
                          <div className="border border-border rounded-md bg-background/50 p-3 mb-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-[12px] font-medium text-foreground">
                                Agregar abono (modo prueba)
                              </span>

                              <button
                                className={`flex items-center gap-1 text-[11px] ${
                                  isPagado
                                    ? 'text-muted-foreground cursor-not-allowed'
                                    : 'text-primary hover:underline'
                                }`}
                                onClick={() => {
                                  if (!isPagado) handleAddAbono(project);
                                }}
                                disabled={isPagado}
                              >
                                <Icon name="Plus" size={12} />
                                <span>
                                  {isPagado ? 'Pagado' : 'Agregar'}
                                </span>
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2 text-[11px]">
                              <input
                                type="date"
                                value={draft.fecha || ''}
                                onChange={(e) =>
                                  handleDraftChange(project.id, 'fecha', e.target.value)
                                }
                                className="border border-border rounded px-2 py-1 bg-background text-foreground min-w-[150px]"
                                disabled={isPagado}
                              />

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={draft.monto || ''}
                                onChange={(e) =>
                                  handleDraftChange(project.id, 'monto', e.target.value)
                                }
                                className="border border-border rounded px-2 py-1 bg-background text-foreground w-[120px]"
                                disabled={isPagado}
                              />

                              <input
                                type="text"
                                placeholder="ej. anticipo"
                                value={draft.nota || ''}
                                onChange={(e) =>
                                  handleDraftChange(project.id, 'nota', e.target.value)
                                }
                                className="border border-border rounded px-2 py-1 bg-background text-foreground flex-1 min-w-[200px]"
                                disabled={isPagado}
                              />
                            </div>

                            {isPagado && (
                              <div className="text-[11px] text-green-700 font-medium mt-2">
                                Proyecto pagado en su totalidad ✅
                              </div>
                            )}
                          </div>

                          {/* totales y barra */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-x-4 text-[12px] mb-2">
                              <span>
                                <span className="text-muted-foreground">
                                  Presupuesto total:{' '}
                                </span>
                                <span className="font-semibold">
                                  {formatCurrency(presupuestoTotal)}
                                </span>
                              </span>

                              <span>
                                <span className="text-muted-foreground">
                                  Total abonado:{' '}
                                </span>
                                <span className="font-semibold text-green-700">
                                  {formatCurrency(totalAbonado)}
                                </span>
                              </span>

                              <span>
                                <span className="text-muted-foreground">
                                  Restante:{' '}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    restante < 0 ? 'text-red-600' : 'text-foreground'
                                  }`}
                                >
                                  {formatCurrency(restante)}
                                </span>
                              </span>
                            </div>

                            <div className="relative w-full h-3 bg-muted rounded overflow-hidden border border-border">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  percent >= 100 ? 'bg-green-600' : 'bg-green-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white">
                                {percent.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* === FIN ABONOS === */}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {sortedProjects?.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  No hay proyectos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile (sin cambios en abonos en móvil por ahora) */}
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
                />
                <Image
                  src={project?.image}
                  alt={project?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <div className="font-medium text-foreground">{project?.name}</div>
                  <div className="text-sm text-muted-foreground">{project?.code}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleRowExpansion(project?.id)}
              >
                <Icon name="ChevronUp" size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div className="text-sm text-foreground">{project?.client?.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Presupuesto</div>
                <div className="text-sm text-foreground font-medium">
                  {formatCurrency(project?.budget)}
                </div>
                {Number(project?.equiposUSD) > 0 && (
                  <div className="text-[11px] text-muted-foreground">
                    Equipos: {formatUSD(project?.equiposUSD)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  project?.status
                )}`}
              >
                {project?.statusLabel || project?.status || '—'}
              </span>
              <div className="flex items-center space-x-1">
                <Icon
                  name="AlertCircle"
                  size={14}
                  className={getPriorityColor(project?.priority)}
                />
                <span className="text-xs">
                  {project?.priorityLabel || project?.priority || '—'}
                </span>
              </div>
            </div>

            {expandedRows?.includes(project?.id) && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Inicio</div>
                      <div className="text-sm text-foreground">
                        {formatDate(project?.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Fin</div>
                      <div className="text-sm text-foreground">
                        {formatDate(project?.endDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Departamento</div>
                      <div className="text-sm text-foreground">
                        {project?.department || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Ubicación</div>
                      <div className="text-sm text-foreground">
                        {project?.location || '—'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Personal Asignado
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(project?.assignedPersonnel || [])?.map((person, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 bg-muted px-2 py-1 rounded"
                        >
                          <Icon name="User" size={12} />
                          <span className="text-xs text-foreground">{person?.name}</span>
                          {person?.role && (
                            <span className="text-[10px] text-muted-foreground">
                              ({person?.role})
                            </span>
                          )}
                        </div>
                      ))}
                      {(!project?.assignedPersonnel ||
                        project?.assignedPersonnel?.length === 0) && (
                        <div className="text-xs text-muted-foreground">
                          Sin personal asignado
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Descripción</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {project?.description || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {sortedProjects?.length === 0 && !loading && (
          <div className="p-8 text-center text-muted-foreground">
            No hay proyectos para mostrar.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
