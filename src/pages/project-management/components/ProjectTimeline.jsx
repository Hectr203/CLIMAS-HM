import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectTimeline = ({ projects }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [viewType, setViewType] = useState('timeline');

  const timeframeOptions = [
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Año' }
  ];

  const getProjectsForTimeframe = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedTimeframe) {
      case 'week':
        startDate?.setDate(now?.getDate() - 7);
        break;
      case 'month':
        startDate?.setMonth(now?.getMonth() - 1);
        break;
      case 'quarter':
        startDate?.setMonth(now?.getMonth() - 3);
        break;
      case 'year':
        startDate?.setFullYear(now?.getFullYear() - 1);
        break;
      default:
        startDate?.setMonth(now?.getMonth() - 1);
    }

    return projects?.filter(project => {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      return projectStart >= startDate || projectEnd >= startDate;
    })?.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-blue-500',
      'in-progress': 'bg-green-500',
      'on-hold': 'bg-yellow-500',
      'review': 'bg-purple-500',
      'completed': 'bg-emerald-500',
      'cancelled': 'bg-red-500'
    };
    return colors?.[status] || 'bg-gray-500';
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.round(diffDays / 30);
      return `${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.round(diffDays / 365);
      return `${years} año${years > 1 ? 's' : ''}`;
    }
  };

  const filteredProjects = getProjectsForTimeframe();

  const resourceAllocation = projects?.reduce((acc, project) => {
    project?.assignedPersonnel?.forEach(person => {
      if (!acc?.[person?.role]) {
        acc[person.role] = { count: 0, projects: [] };
      }
      acc[person.role].count += 1;
      acc?.[person?.role]?.projects?.push(project?.name);
    });
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Timeline Section */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Cronograma de Proyectos</h3>
            <div className="flex items-center space-x-2">
              <div className="flex bg-muted rounded-lg p-1">
                {timeframeOptions?.map((option) => (
                  <button
                    key={option?.value}
                    onClick={() => setSelectedTimeframe(option?.value)}
                    className={`px-3 py-1 text-sm rounded-md transition-smooth ${
                      selectedTimeframe === option?.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {option?.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName={viewType === 'timeline' ? 'BarChart3' : 'Calendar'}
                onClick={() => setViewType(viewType === 'timeline' ? 'chart' : 'timeline')}
              />
            </div>
          </div>

          {viewType === 'timeline' ? (
            <div className="space-y-4">
              {filteredProjects?.map((project, index) => (
                <div key={project?.id} className="relative">
                  {/* Timeline line */}
                  {index < filteredProjects?.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(project?.status)} mt-2 flex-shrink-0`} />
                    
                    {/* Project info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground truncate">{project?.name}</h4>
                        <span className="text-sm text-muted-foreground">{project?.code}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cliente: </span>
                          <span className="text-foreground">{project?.client?.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Inicio: </span>
                          <span className="text-foreground">{formatDate(project?.startDate)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duración: </span>
                          <span className="text-foreground">{calculateDuration(project?.startDate, project?.endDate)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project?.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            project?.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                            project?.status === 'on-hold'? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {project?.statusLabel}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Icon name="Users" size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {project?.assignedPersonnel?.length} personas
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getStatusColor(project?.status)}`}
                              style={{ width: `${project?.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-foreground font-medium">{project?.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProjects?.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay proyectos en el período seleccionado</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Vista de gráfico en desarrollo</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Resource Allocation Panel */}
      <div className="space-y-6">
        {/* Resource Allocation */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Asignación de Recursos</h3>
          <div className="space-y-4">
            {Object.entries(resourceAllocation)?.map(([role, data]) => (
              <div key={role} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{role}</div>
                  <div className="text-sm text-muted-foreground">
                    {data?.count} asignacion{data?.count > 1 ? 'es' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">{data?.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Hitos</h3>
          <div className="space-y-3">
            {filteredProjects?.slice(0, 5)?.map((project) => (
              <div key={project?.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(project?.status)}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{project?.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(project?.endDate)}</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Plus"
              iconPosition="left"
              className="w-full justify-start"
            >
              Nuevo Proyecto
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="FileText"
              iconPosition="left"
              className="w-full justify-start"
            >
              Generar Reporte
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Calendar"
              iconPosition="left"
              className="w-full justify-start"
            >
              Programar Reunión
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Bell"
              iconPosition="left"
              className="w-full justify-start"
            >
              Configurar Alertas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;