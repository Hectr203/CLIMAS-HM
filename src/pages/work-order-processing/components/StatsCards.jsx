import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Órdenes Activas',
      value: stats?.activeOrders,
      change: '+12%',
      changeType: 'positive',
      icon: 'ClipboardList',
      color: 'bg-blue-500'
    },
    {
      title: 'Pendientes',
      value: stats?.pendingOrders,
      change: '+5%',
      changeType: 'positive',
      icon: 'Clock',
      color: 'bg-yellow-500'
    },
    {
      title: 'En Progreso',
      value: stats?.inProgressOrders,
      change: '+8%',
      changeType: 'positive',
      icon: 'Play',
      color: 'bg-green-500'
    },
    {
      title: 'Completadas Hoy',
      value: stats?.completedToday,
      change: '+15%',
      changeType: 'positive',
      icon: 'CheckCircle',
      color: 'bg-emerald-500'
    },
    {
      title: 'Técnicos Activos',
      value: stats?.activeTechnicians,
      change: '0%',
      changeType: 'neutral',
      icon: 'Users',
      color: 'bg-purple-500'
    },
    {
      title: 'Materiales Críticos',
      value: stats?.criticalMaterials,
      change: '-3%',
      changeType: 'negative',
      icon: 'AlertTriangle',
      color: 'bg-red-500'
    }
  ];

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards?.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${card?.color} rounded-lg flex items-center justify-center`}>
              <Icon name={card?.icon} size={20} color="white" />
            </div>
            <span className={`text-sm font-medium ${getChangeColor(card?.changeType)}`}>
              {card?.change}
            </span>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-foreground mb-1">{card?.value}</p>
            <p className="text-sm text-muted-foreground">{card?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;