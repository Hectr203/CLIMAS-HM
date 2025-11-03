import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectStats = ({ projects }) => {
  const calculateStats = () => {
    const total = projects?.length;
    const completed = projects?.filter(p => p?.status === 'completed')?.length;
    const inProgress = projects?.filter(p => p?.status === 'in-progress')?.length;
    const onHold = projects?.filter(p => p?.status === 'on-hold')?.length;
    const planning = projects?.filter(p => p?.status === 'planning')?.length;
    
    const totalBudget = projects?.reduce((sum, p) => sum + p?.budget, 0);
    const completedBudget = projects?.filter(p => p?.status === 'completed')?.reduce((sum, p) => sum + p?.budget, 0);
    
    const urgentProjects = projects?.filter(p => p?.priority === 'urgent')?.length;
    
    return {
      total,
      completed,
      inProgress,
      onHold,
      planning,
      totalBudget,
      completedBudget,
      urgentProjects
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const statCards = [
    {
      title: 'Total de Proyectos',
      value: stats?.total,
      icon: 'FolderOpen',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'En Progreso',
      value: stats?.inProgress,
      icon: 'Clock',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completados',
      value: stats?.completed,
      icon: 'CheckCircle',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'En Pausa',
      value: stats?.onHold,
      icon: 'Pause',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Presupuesto Total',
      value: formatCurrency(stats?.totalBudget),
      icon: 'DollarSign',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Proyectos Urgentes',
      value: stats?.urgentProjects,
      icon: 'AlertTriangle',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Valor Completado',
      value: formatCurrency(stats?.completedBudget),
      icon: 'Target',
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-smooth">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat?.title}</p>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.textColor} />
            </div>
          </div>
          
          {/* Progress indicator for some stats */}
          {stat?.title?.includes('Completados') && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Porcentaje</span>
                <span>{`${Math.round((stats?.completed / stats?.total) * 100)}%`}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${stat?.color}`}
                  style={{ 
                    width: `${(stats?.completed / stats?.total) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectStats;