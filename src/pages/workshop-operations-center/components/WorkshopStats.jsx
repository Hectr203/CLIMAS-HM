import React from 'react';
import Icon from '../../../components/AppIcon';

const WorkshopStats = ({ stats = {}, currentShift = {} }) => {
  const statsCards = [
    {
      title: 'Órdenes Activas',
      value: stats?.activeWorkOrders || 0,
      icon: 'ClipboardList',
      color: 'bg-blue-500',
      trend: '+2 desde ayer',
      trendIcon: 'TrendingUp',
      trendColor: 'text-green-600'
    },
    {
      title: 'Completadas Hoy',
      value: stats?.completedToday || 0,
      icon: 'CheckCircle',
      color: 'bg-green-500',
      trend: '+1 desde ayer',
      trendIcon: 'TrendingUp',
      trendColor: 'text-green-600'
    },
    {
      title: 'Materiales Pendientes',
      value: stats?.pendingMaterials || 0,
      icon: 'Package',
      color: 'bg-orange-500',
      trend: '-1 desde ayer',
      trendIcon: 'TrendingDown',
      trendColor: 'text-red-600'
    },
    {
      title: 'Asistencia Turno',
      value: `${stats?.attendanceRate || 0}%`,
      icon: 'Users',
      color: 'bg-purple-500',
      trend: `${currentShift?.attendanceCount}/${currentShift?.totalTechnicians} técnicos`,
      trendIcon: 'UserCheck',
      trendColor: 'text-blue-600'
    },
    {
      title: 'Progreso Promedio',
      value: `${stats?.averageProgress || 0}%`,
      icon: 'Activity',
      color: 'bg-indigo-500',
      trend: '+15% esta semana',
      trendIcon: 'TrendingUp',
      trendColor: 'text-green-600'
    },
    {
      title: 'Problemas de Calidad',
      value: stats?.qualityIssues || 0,
      icon: 'AlertTriangle',
      color: 'bg-red-500',
      trend: stats?.qualityIssues === 0 ? 'Sin incidencias' : 'Requiere atención',
      trendIcon: stats?.qualityIssues === 0 ? 'CheckCircle' : 'AlertCircle',
      trendColor: stats?.qualityIssues === 0 ? 'text-green-600' : 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statsCards?.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${card?.color} rounded-lg flex items-center justify-center`}>
              <Icon name={card?.icon} size={20} color="white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">{card?.title}</p>
              <p className="text-2xl font-bold text-foreground">{card?.value}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name={card?.trendIcon} size={12} className={card?.trendColor} />
            <span className={`text-xs ${card?.trendColor}`}>{card?.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkshopStats;