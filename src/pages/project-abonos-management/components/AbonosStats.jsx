import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const AbonosStats = ({ projects = [], getTotalPagado }) => {
  const stats = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) {
      return {
        total: 0,
        pagados: 0,
        enProceso: 0,
        enPausa: 0,
        totalBudget: 0,
        totalRecaudado: 0,
        progresoGeneral: 0,
      };
    }

    const getBudget = (p) => Number(p?.totalPresupuesto ?? p?.presupuesto?.total ?? p?.budget ?? 0);
    
    // Función para obtener el total restante (consistente con la lógica del filtro)
    const obtenerTotalRestante = (p) => {
      // 1) Valor directo desde backend si está presente
      const resumen = p?.resumenFinanciero || p?.financialSummary || {};
      const fromDB = resumen?.totalRestante ?? resumen?.saldoPendiente ?? resumen?.saldo_pendiente;
      if (typeof fromDB === 'number' && !isNaN(fromDB)) {
        return fromDB;
      }
      // 2) Fallback: calcula a partir de presupuesto y pagado
      const presupuesto = getBudget(p);
      const pagado = typeof getTotalPagado === 'function' 
        ? Number(getTotalPagado(p) || 0) 
        : 0;
      const restante = Math.max(presupuesto - pagado, 0);
      return restante;
    };
    
    let totalBudget = 0;
    let totalRecaudado = 0;
    let pagados = 0;
    let enProceso = 0;
    let enPausa = 0;

    projects.forEach((project) => {
      const budget = getBudget(project);
      const paid = typeof getTotalPagado === 'function' 
        ? Number(getTotalPagado(project) || 0) 
        : 0;
      const totalRestante = obtenerTotalRestante(project);
      
      totalBudget += budget;
      totalRecaudado += paid;

      // Determinar estado de pago usando la misma lógica que el filtro
      // Pagados: Total restante = 0
      if (totalRestante === 0 && budget > 0) {
        pagados++;
      } 
      // En Proceso de Pago: Total restante > 0 y < Presupuesto
      else if (totalRestante > 0 && totalRestante < budget) {
        enProceso++;
      }

      // Contar proyectos en pausa
      const estado = project?.estado ?? project?.status ?? project?.statusLabel ?? '';
      const estadoLower = String(estado).toLowerCase();
      if (estadoLower.includes('pausa') || estadoLower.includes('pause') || estadoLower.includes('on-hold') || estadoLower.includes('hold')) {
        enPausa++;
      }
    });

    // Calcular progreso general: (Total recaudado / Total presupuesto) * 100
    const progresoGeneral = totalBudget > 0 
      ? Math.round((totalRecaudado / totalBudget) * 100) 
      : 0;

    return {
      total: projects.length,
      pagados,
      enProceso,
      enPausa,
      totalBudget,
      totalRecaudado,
      progresoGeneral: Math.min(progresoGeneral, 100), // Cap at 100%
    };
  }, [projects, getTotalPagado]);

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '$0';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total de Proyectos',
      value: stats.total,
      icon: 'FolderOpen',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Proyectos Pagados',
      value: stats.pagados,
      icon: 'CheckCircle',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Proyectos completamente pagados'
    },
    {
      title: 'En Proceso de Pago',
      value: stats.enProceso,
      icon: 'Clock',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Proyectos con pagos parciales'
    },
    {
      title: 'Presupuesto Total',
      value: formatCurrency(stats.totalBudget),
      icon: 'DollarSign',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Suma de todos los presupuestos'
    },
    {
      title: 'Proyectos en Pausa',
      value: stats.enPausa,
      icon: 'Pause',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Proyectos con estado en pausa'
    },
    {
      title: 'Total Recaudado',
      value: formatCurrency(stats.totalRecaudado),
      icon: 'CreditCard',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Monto total de abonos registrados'
    },
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-smooth">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon name={stat.icon} size={24} className={stat.textColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de progreso general */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Progreso General de Pagos</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(stats.totalRecaudado)} de {formatCurrency(stats.totalBudget)} recaudados
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{stats.progresoGeneral}%</p>
            <p className="text-xs text-muted-foreground">Completado</p>
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div 
            className="h-4 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
            style={{ 
              width: `${stats.progresoGeneral}%`,
              minWidth: stats.progresoGeneral > 0 ? '2px' : '0'
            }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground mb-1">Total Recaudado</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(stats.totalRecaudado)}</p>
          </div>
          <div className="text-center flex-1 border-x border-border">
            <p className="text-xs text-muted-foreground mb-1">Pendiente</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(Math.max(stats.totalBudget - stats.totalRecaudado, 0))}
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground mb-1">Presupuesto Total</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(stats.totalBudget)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbonosStats;
