// pages/Proyectos/ProjectTimeline.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import proyectoService from '../../../services/proyectoService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

/* ================= Utils ================= */

const fold = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

const KW = {
  planning: (s) =>
    s.includes('planific') || s.includes('planeac') || s.includes('planning') ||
    s.includes('backlog') || s.includes('kickoff') || s.includes('inicio') ||
    s.includes('prepar') || s === 'activo' || s.includes('active'),
  progress: (s) =>
    s.includes('progreso') || s.includes('proceso') || s.includes('ejec') ||
    s.includes('en curso') || s.includes('trabaj') || s.includes('running') ||
    s.includes('work in progress') || s.includes('in-progress') || s.includes('in progress'),
  review: (s) =>
    s.includes('revi') || s.includes('review') || s.includes('qa') ||
    s.includes('calidad') || s.includes('validac') || s.includes('verific') ||
    s.includes('aprobac') || s.includes('auditor'),
  exclude: (s) =>
    s.includes('pausa') || s.includes('pausado') || s.includes('on-hold') ||
    s.includes('on hold') || s.includes('cancel') || s.includes('complet') ||
    s.includes('terminado') || s.includes('fin'),
};

const toCanon = (raw) => {
  const s = fold(raw);
  if (!s || KW.exclude(s)) return null;
  if (KW.review(s)) return 'En Revisión';
  if (KW.progress(s)) return 'En Progreso';
  if (KW.planning(s)) return 'Planificación';
  return null;
};

const getCanonFromObject = (obj) => {
  const candidates = [
    obj?.estado, obj?.estatus, obj?.status, obj?.statusLabel,
    obj?.fase, obj?.etapa, obj?.stage, obj?.state,
  ].filter(Boolean);
  for (const c of candidates) {
    const canon = toCanon(c);
    if (canon) return canon;
  }
  return null;
};

// fechas
const safeDate = (v) => { const d = new Date(v); return isNaN(d) ? null : d; };
const fmtDate  = (v) => { const d = safeDate(v); return d ? d.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) : '—'; };

// rangos
const startOfWeekMonday = (d) => {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = out.getDay();
  const diffToMon = (day + 6) % 7;
  out.setDate(out.getDate() - diffToMon);
  out.setHours(0,0,0,0);
  return out;
};
const startOfMonth = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x; };
const startOfNextMonth = (d) => new Date(d.getFullYear(), d.getMonth()+1, 1);
const startOfYear = (y) => { const x = new Date(y, 0, 1); x.setHours(0,0,0,0); return x; };
const startOfNextYear = (y) => new Date(y+1, 0, 1);
const startOfQuarter = (d) => { const q = Math.floor(d.getMonth()/3); const x = new Date(d.getFullYear(), q*3, 1); x.setHours(0,0,0,0); return x; };
const startOfNextQuarter = (d) => { const q = Math.floor(d.getMonth()/3); return new Date(d.getFullYear(), (q+1)*3, 1); };
const inRange = (date, ini, fin) => date && date.getTime() >= ini.getTime() && date.getTime() < fin.getTime();

/* ================= Canon getters (seguros) ================= */

const getId     = (p) => p?.id ?? p?._id ?? p?.Id ?? p?.ID ?? null;
const getCode   = (p) => {
  const c = p?.codigo ?? p?.code ?? p?.Codigo ?? p?.Code;
  return typeof c === 'string' ? c : (c?.id ?? c?.value ?? '');
};
const getName   = (p) => p?.nombre ?? p?.name ?? p?.nombreProyecto ?? 'Proyecto sin nombre';
const getClient = (p) => {
  const cli = p?.cliente ?? p?.client;
  if (!cli) return '';
  if (typeof cli === 'string') return cli;
  return cli?.nombre ?? cli?.name ?? cli?.razonSocial ?? cli?.id ?? '';
};
const getStart  = (p) => p?.cronograma?.fechaInicio ?? p?.startDate ?? p?.inicio ?? null;
const getEnd    = (p) => p?.cronograma?.fechaFin ?? p?.endDate ?? p?.fin ?? null;
const getProg   = (p) => Number(p?.progress ?? p?.avance ?? 0);
const getCanon  = (p) => p?.__estadoCanon ?? getCanonFromObject(p);
const getRoleLabel = (role) => {
  if (!role) return 'Sin rol';
  if (typeof role === 'string') return role;
  return role?.name ?? role?.nombre ?? role?.id ?? 'Sin rol';
};

/* ================= Visual helpers ================= */

const statusColor = (canon) => {
  switch (canon) {
    case 'Planificación': return 'bg-blue-500';
    case 'En Progreso':   return 'bg-green-500';
    case 'En Revisión':   return 'bg-purple-500';
    default:              return 'bg-gray-500';
  }
};
const statusPill = (canon) => {
  switch (canon) {
    case 'Planificación': return 'bg-blue-100 text-blue-800';
    case 'En Progreso':   return 'bg-green-100 text-green-800';
    case 'En Revisión':   return 'bg-purple-100 text-purple-800';
    default:              return 'bg-gray-100 text-gray-800';
  }
};

/* ================= Component ================= */

function ProjectTimeline({ projects }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [period, setPeriod] = useState('month'); // 'week' | 'month' | 'q' | 'year'
  const PERIODS = [
    { key: 'week',  label: 'Esta Semana' },
    { key: 'month', label: 'Este Mes' },
    { key: 'q',     label: 'Trimestre' },
    { key: 'year',  label: 'Año' },
  ];

  const ALLOWED = ['Planificación', 'En Progreso', 'En Revisión'];

  const fetchRows = useCallback(async () => {
    if (Array.isArray(projects)) {
      const withCanon = projects.map((p) => ({ ...p, __estadoCanon: getCanonFromObject(p) }));
      const filtered  = withCanon.filter((p) => ALLOWED.includes(getCanon(p)));
      setRows(filtered);
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const res  = await proyectoService.getProyectos();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const withCanon = list.map((p) => ({ ...p, __estadoCanon: getCanonFromObject(p) }));
      const filtered  = withCanon.filter((p) => ALLOWED.includes(getCanon(p)));
      setRows(filtered);
    } catch (e) {
      setErr(e?.userMessage || e?.message || 'Error al obtener proyectos');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [projects]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const range = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'week')  { const ini = startOfWeekMonday(today); const fin = new Date(ini); fin.setDate(ini.getDate()+7); return {ini,fin}; }
    if (period === 'month') { const ini = startOfMonth(today); const fin = startOfNextMonth(today); return {ini,fin}; }
    if (period === 'q')     { const ini = startOfQuarter(today); const fin = startOfNextQuarter(today); return {ini,fin}; }
    if (period === 'year')  { const ini = startOfYear(today.getFullYear()); const fin = startOfNextYear(today.getFullYear()); return {ini,fin}; }
    return null;
  }, [period]);

  // ⛔️ Excluimos vencidos y aplicamos rango
  const filteredRows = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!range) {
      return rows
        .filter((p) => {
          const e = safeDate(getEnd(p));
          if (!e) return true;            // sin fin => vigente
          return e.getTime() >= today.getTime(); // excluye vencidos
        })
        .sort((a, b) => {
          const aT = safeDate(getStart(a))?.getTime?.() ?? 0;
          const bT = safeDate(getStart(b))?.getTime?.() ?? 0;
          return aT - bT;
        });
    }

    const { ini, fin } = range;
    return rows
      .filter((p) => {
        const s = safeDate(getStart(p));
        const e = safeDate(getEnd(p));

        // 1) Excluir vencidos
        if (e && e.getTime() < today.getTime()) return false;

        // 2) Inicia o termina dentro del rango
        const startsIn = s && inRange(s, ini, fin);
        const endsIn   = e && inRange(e, ini, fin);
        return startsIn || endsIn;
      })
      .sort((a, b) => {
        const aT = safeDate(getStart(a))?.getTime?.() ?? 0;
        const bT = safeDate(getStart(b))?.getTime?.() ?? 0;
        return aT - bT;
      });
  }, [rows, range]);

  const resourceAllocation = useMemo(() => {
    const acc = {};
    for (const p of rows) {
      const people = p?.assignedPersonnel || p?.personalAsignado || [];
      for (const person of people) {
        const roleLabel = getRoleLabel(person?.role);
        if (!acc[roleLabel]) acc[roleLabel] = { count: 0, projects: [] };
        acc[roleLabel].count += 1;
        acc[roleLabel].projects.push(String(getName(p)));
      }
    }
    return acc;
  }, [rows]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* IZQUIERDA: Timeline */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Cronograma de Proyectos</h3>

            <div className="flex items-center space-x-2">
              <div className="flex bg-muted rounded-lg p-1">
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`px-3 py-1 text-sm rounded-md transition-smooth ${
                      period === p.key ? 'bg-primary text-primary-foreground'
                                       : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="RotateCw"
                onClick={fetchRows}
                title="Actualizar"
              />
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando proyectos...</p>
            </div>
          )}
          {!loading && err && (
            <div className="text-center py-8 text-destructive">
              {String(err)}
            </div>
          )}
          {!loading && !err && filteredRows.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay proyectos vigentes para el período seleccionado.</p>
              <p className="text-xs text-muted-foreground mt-1">(Los proyectos con fecha de finalización pasada no se muestran aquí)</p>
            </div>
          )}

          {!loading && !err && filteredRows.length > 0 && (
            <div className="space-y-4">
              {filteredRows.map((p, idx) => {
                const id      = getId(p);
                const code    = String(getCode(p) || '');
                const name    = String(getName(p) || '');
                const client  = String(getClient(p) || '—');
                const start   = getStart(p);
                const end     = getEnd(p);
                const canon   = getCanon(p) || '—';
                const prog    = Math.max(0, Math.min(100, getProg(p)));

                return (
                  <div key={id ?? code ?? idx} className="relative" data-code={code}>
                    {/* línea vertical */}
                    {idx < filteredRows.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                    )}

                    <div className="flex items-start space-x-4">
                      {/* punto */}
                      <div className={`w-3 h-3 rounded-full ${statusColor(canon)} mt-2 flex-shrink-0`} />

                      {/* contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground truncate">{name}</h4>
                          <span className="text-sm text-muted-foreground">{code}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cliente: </span>
                            <span className="text-foreground">{client}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Inicio: </span>
                            <span className="text-foreground">{fmtDate(start)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fin: </span>
                            <span className="text-foreground">{fmtDate(end)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusPill(canon)}`}>
                              {canon}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Icon name="Users" size={14} className="text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {(p?.assignedPersonnel || p?.personalAsignado || []).length} personas
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${statusColor(canon)}`}
                                style={{ width: `${prog}%` }}
                              />
                            </div>
                            <span className="text-xs text-foreground font-medium">{prog}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DERECHA: Paneles */}
      <div className="space-y-6">
        {/* Asignación de Recursos */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Asignación de Recursos</h3>
          <div className="space-y-4">
            {Object.keys(resourceAllocation).length === 0 && (
              <div className="text-sm text-muted-foreground">Sin asignaciones registradas.</div>
            )}
            {Object.entries(resourceAllocation).map(([roleLabel, data]) => (
              <div key={roleLabel} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{String(roleLabel)}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.count} asignación{data.count > 1 ? 'es' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">{data.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos Hitos */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Hitos</h3>
          <div className="space-y-3">
            {filteredRows.slice(0, 5).map((p, i) => (
              <div key={getId(p) ?? getCode(p) ?? i} className="flex items-center space-x-3" data-code={String(getCode(p) || '')}>
                <div className={`w-2 h-2 rounded-full ${statusColor(getCanon(p))}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{String(getName(p) || '')}</div>
                  <div className="text-xs text-muted-foreground">{fmtDate(getEnd(p))}</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            ))}
            {filteredRows.length === 0 && (
              <div className="text-sm text-muted-foreground">Sin hitos próximos.</div>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" className="w-full justify-start">
              Nuevo Proyecto
            </Button>
            <Button variant="outline" size="sm" iconName="FileText" iconPosition="left" className="w-full justify-start">
              Generar Reporte
            </Button>
            <Button variant="outline" size="sm" iconName="Calendar" iconPosition="left" className="w-full justify-start">
              Programar Reunión
            </Button>
            <Button variant="outline" size="sm" iconName="Bell" iconPosition="left" className="w-full justify-start">
              Configurar Alertas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectTimeline;
