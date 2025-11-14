import React, { useEffect, useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import proyectoService from '../../../services/proyectoService';

// ---------- Helpers ----------
const toNumber = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]+/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
};

const formatCurrencyMXN = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const safePercent = (part, total) => {
  const p = toNumber(part);
  const t = toNumber(total);
  if (t <= 0) return 0;
  return Math.round((p / t) * 100);
};

// normalizar estado local (fallback local)
const normalizeStatus = (rawStatus) => {
  const s = (rawStatus || '').toString().trim().toLowerCase();

  if (
    [
      'completed',
      'completado',
      'completada',
      'terminado',
      'terminada',
      'done',
      'cerrado',
      'cerrada',
      'finalizado',
      'finalizada',
    ].includes(s)
  ) {
    return 'completed';
  }

  if (
    [
      'in-progress',
      'in progress',
      'inprogress',
      'en-progreso',
      'en progreso',
      'en proceso',
      'activo',
      'activa',
      'running',
      'ejecucion',
      'ejecución',
    ].includes(s)
  ) {
    return 'in-progress';
  }

  if (
    [
      'on-hold',
      'hold',
      'en pausa',
      'pausa',
      'paused',
      'pausado',
      'pausada',
      'detenido',
      'detenida',
      'suspendido',
      'suspendida',
    ].includes(s)
  ) {
    return 'on-hold';
  }

  if (
    [
      'planning',
      'plan',
      'planificación',
      'planificacion',
      'cotizando',
      'cotizacion',
      'cotización',
      'borrador',
      'draft',
      'nuevo',
      'nueva',
    ].includes(s)
  ) {
    return 'planning';
  }

  return 'in-progress';
};

// normalizar prioridad local para fallback "Proyectos Urgentes"
const normalizePriority = (rawPriority) => {
  const p = (rawPriority || '').toString().trim().toLowerCase();
  if (
    [
      'urgent',
      'urgente',
      'alta',
      'alta prioridad',
      'crítica',
      'critica',
      'crítico',
      'critico',
      'urgency_high',
    ].includes(p)
  ) {
    return 'urgent';
  }
  return 'normal';
};

// presupuesto local
const extractBudgetMXN = (rawProject) => {
  const rawAmount =
    rawProject?.budget ??
    rawProject?.presupuestoTotal ??
    rawProject?.presupuesto?.total ??
    rawProject?.costoEstimado ??
    rawProject?.montoEstimado ??
    rawProject?.monto ??
    rawProject?.totalProyecto ??
    0;

  return toNumber(rawAmount);
};

// normalizador de cada proyecto para cálculos locales
const normalizeProject = (rawProject) => {
  return {
    id:
      rawProject?.id ||
      rawProject?.idProyecto ||
      rawProject?.uuid ||
      rawProject?.codigo ||
      null,

    rawEstado:
      rawProject?.estado ||
      rawProject?.estatus ||
      rawProject?.status ||
      rawProject?.projectStatus ||
      '',

    status: normalizeStatus(
      rawProject?.status ||
        rawProject?.estado ||
        rawProject?.estatus ||
        rawProject?.projectStatus
    ),

    priority: normalizePriority(
      rawProject?.priority ||
        rawProject?.prioridad ||
        rawProject?.urgencia
    ),

    budgetMXN: extractBudgetMXN(rawProject),
  };
};

// ---------- Componente principal ----------
const ProjectStats = ({ refreshKey }) => {
  const [projectsNorm, setProjectsNorm] = useState([]);
  const [apiStats, setApiStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [warnMsg, setWarnMsg] = useState('');

  // cargar info de backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrMsg('');
      setWarnMsg('');

      try {
        // 1. stats desde /proyectos/estadisticas
        const statsResp = await proyectoService.getEstadisticas();
        let statsPayload = null;
        if (statsResp && typeof statsResp === 'object') {
          if (
            statsResp.data &&
            typeof statsResp.data === 'object' &&
            !Array.isArray(statsResp.data)
          ) {
            statsPayload = statsResp.data;
          } else {
            statsPayload = statsResp;
          }
        }

        // 2. lista de proyectos completa
        const proyectosResp = await proyectoService.getProyectos();
        let proyectosRaw = [];
        if (Array.isArray(proyectosResp)) {
          proyectosRaw = proyectosResp;
        } else if (Array.isArray(proyectosResp?.data)) {
          proyectosRaw = proyectosResp.data;
        } else if (Array.isArray(proyectosResp?.items)) {
          proyectosRaw = proyectosResp.items;
        } else {
          proyectosRaw = [];
        }

        // Eliminar duplicados basándose en el ID del proyecto
        const proyectosUnicos = [];
        const idsVistos = new Set();
        proyectosRaw.forEach((proyecto) => {
          const id = proyecto?.id || proyecto?.idProyecto || proyecto?.uuid || proyecto?.codigo;
          if (id && !idsVistos.has(id)) {
            idsVistos.add(id);
            proyectosUnicos.push(proyecto);
          } else if (!id) {
            // Si no tiene ID, lo agregamos de todas formas (no debería pasar)
            proyectosUnicos.push(proyecto);
          }
        });

        const normalized = proyectosUnicos.map(normalizeProject);

        setApiStats(statsPayload || null);
        setProjectsNorm(normalized);

        if (!proyectosUnicos.length) {
          setWarnMsg('No llegaron proyectos o no entendí /proyectos/todos.');
        } else if (normalized.some((p) => !p.status)) {
          setWarnMsg('Algunos proyectos no traen estado reconocible.');
        } else if (proyectosRaw.length !== proyectosUnicos.length) {
          setWarnMsg(`Se encontraron ${proyectosRaw.length - proyectosUnicos.length} proyectos duplicados y se eliminaron.`);
        }

        setLoading(false);
      } catch (err) {
        setErrMsg(
          err?.userMessage || err?.message || 'Error al cargar estadísticas'
        );
        setLoading(false);
      }
    };

    loadData();
  }, [refreshKey]);

  // fallback local si no hay apiStats o para corregir datos raros del back
  const fallbackLocalStats = useMemo(() => {
    const total = projectsNorm.length;

    const completedList = projectsNorm.filter(
      (p) => p.status === 'completed'
    );
    const inProgressList = projectsNorm.filter(
      (p) => p.status === 'in-progress'
    );
    const onHoldList = projectsNorm.filter(
      (p) => p.status === 'on-hold'
    );
    const planningList = projectsNorm.filter(
      (p) => p.status === 'planning'
    );
    const urgentList = projectsNorm.filter(
      (p) => p.priority === 'urgent'
    );

    const totalBudget = projectsNorm.reduce(
      (sum, p) => sum + toNumber(p.budgetMXN),
      0
    );
    const completedBudget = completedList.reduce(
      (sum, p) => sum + toNumber(p.budgetMXN),
      0
    );

    return {
      total,
      inProgress: inProgressList.length,
      completed: completedList.length,
      onHold: onHoldList.length,
      planning: planningList.length,
      urgentProjects: urgentList.length,
      totalBudget,
      completedBudget,
    };
  }, [projectsNorm]);

  // merge stats backend + fallback
  const mergedStats = useMemo(() => {
    // si no hay apiStats, usamos todo local
    if (!apiStats) {
      return fallbackLocalStats;
    }

    const totalProyectos = toNumber(apiStats.totalProyectos)-1;
    const totalPresupuesto = toNumber(apiStats.totalPresupuesto);

    const byEstado = apiStats.byEstado || {};
    const byPrioridad = apiStats.byPrioridad || {};

    const safeCount = (obj, key) =>
      toNumber(
        obj?.[key]?.count ?? obj?.[key]?.total ?? 0
      );

    const safeBudget = (obj, key) =>
      toNumber(
        obj?.[key]?.totalPresupuesto ??
          obj?.[key]?.presupuesto ??
          0
      );

    // En Progreso
    const inProgressCount =
      safeCount(byEstado, 'en proceso') ||
      safeCount(byEstado, 'en_proceso') ||
      safeCount(byEstado, 'en proceso ') ||
      0;

    // Completados - Usar conteo local para evitar conteos incorrectos del backend
    // (similar a como se hace con "En Pausa")
    const completedCount = fallbackLocalStats.completed;
    
    const completedBudget =
      safeBudget(byEstado, 'completado') ||
      safeBudget(byEstado, 'completados') ||
      safeBudget(byEstado, 'finalizado') ||
      safeBudget(byEstado, 'finalizados') ||
      fallbackLocalStats.completedBudget ||
      0;

    // Urgentes (proyectos urgentes)
    let apiUrgentCount =
      safeCount(byPrioridad, 'urgente') ||
      safeCount(byPrioridad, 'urgentes') ||
      0;

    if (!apiUrgentCount) {
      apiUrgentCount =
        safeCount(byEstado, 'urgente') ||
        safeCount(byEstado, 'urgentes') ||
        0;
    }

    const finalUrgent =
      apiUrgentCount || fallbackLocalStats.urgentProjects;

    // ⚠️ En Pausa → FORZAMOS a usar el conteo local,
    // ignorando el que venga de /estadisticas,
    // porque /estadisticas está inflando (ej. dice 4 pero en realidad tienes 3).
    const finalOnHold = fallbackLocalStats.onHold;

    return {
      total: totalProyectos || fallbackLocalStats.total,
      inProgress: inProgressCount || fallbackLocalStats.inProgress,
      completed: completedCount, // Usar siempre el conteo local
      onHold: finalOnHold, // <- importante
      planning: fallbackLocalStats.planning,
      urgentProjects: finalUrgent,
      totalBudget:
        totalPresupuesto || fallbackLocalStats.totalBudget,
      completedBudget:
        completedBudget || fallbackLocalStats.completedBudget,
    };
  }, [apiStats, fallbackLocalStats]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total de Proyectos',
        value: mergedStats.total,
        icon: 'FolderOpen',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        barColor: 'bg-blue-500',
      },
      {
        title: 'En Progreso',
        value: mergedStats.inProgress,
        icon: 'Clock',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        barColor: 'bg-green-500',
      },
      {
        title: 'Completados',
        value: mergedStats.completed,
        icon: 'CheckCircle',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        barColor: 'bg-emerald-500',
      },
      {
        title: 'En Pausa',
        value: mergedStats.onHold,
        icon: 'Pause',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        barColor: 'bg-yellow-500',
      },
      {
        title: 'Presupuesto Total',
        value: formatCurrencyMXN(mergedStats.totalBudget),
        icon: 'DollarSign',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        barColor: 'bg-purple-500',
      },
      {
        title: 'Proyectos Urgentes',
        value: mergedStats.urgentProjects,
        icon: 'AlertTriangle',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        barColor: 'bg-red-500',
      },
      {
        title: 'Valor Completado',
        value: formatCurrencyMXN(mergedStats.completedBudget),
        icon: 'Target',
        textColor: 'text-teal-600',
        bgColor: 'bg-teal-50',
        barColor: 'bg-teal-500',
      },
    ],
    [mergedStats]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
              <div className="w-12 h-12 bg-muted rounded-lg" />
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 text-sm">
        <p className="font-semibold flex items-center gap-2">
          <Icon
            name="AlertTriangle"
            className="text-red-600"
            size={18}
          />
          <span>Error cargando estadísticas</span>
        </p>
        <p className="mt-1 text-red-700">{errMsg}</p>
      </div>
    );
  }

  return (
    <>
      {warnMsg && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-yellow-800 text-xs flex items-start gap-2">
          <Icon
            name="AlertTriangle"
            className="text-yellow-600 min-w-[16px]"
            size={16}
          />
          <div>
            <div className="font-semibold">Aviso</div>
            <div>{warnMsg}</div>
            <div className="mt-1 text-[10px] text-yellow-700">
              Mostrando datos locales para "En Pausa" porque la API
              está mandando un conteo distinto.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-smooth"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value ?? 0}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon
                  name={stat.icon}
                  size={24}
                  className={stat.textColor}
                />
              </div>
            </div>

            {stat.title.includes('Completados') && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {statCards.find((c) => c.title === 'Completados')?.value || 0} de{' '}
                    {statCards.find((c) => c.title === 'Total de Proyectos')?.value || 0} proyectos
                  </span>
                  <span>
                    {safePercent(
                      statCards.find(
                        (c) => c.title === 'Completados'
                      )?.value,
                      statCards.find(
                        (c) =>
                          c.title === 'Total de Proyectos'
                      )?.value
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stat.barColor}`}
                    style={{
                      width: `${safePercent(
                        statCards.find(
                          (c) => c.title === 'Completados'
                        )?.value,
                        statCards.find(
                          (c) =>
                            c.title ===
                            'Total de Proyectos'
                        )?.value
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ProjectStats;
