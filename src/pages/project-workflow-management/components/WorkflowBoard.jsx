import React from 'react';
import Icon from '../../../components/AppIcon';

const WorkflowBoard = ({ stages, projects, onProjectSelect, onStageTransition }) => {
  const getProjectsByStage = (stageId) => {
    return projects?.filter(project => project?.stage === stageId) || [];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {stages?.map((stage) => (
        <div key={stage?.id} className="bg-card rounded-lg shadow-sm border">
          <div className={`p-4 ${stage?.color} text-white rounded-t-lg`}>
            <div className="flex items-center space-x-2">
              <Icon name={stage?.icon} size={20} />
              <h3 className="font-semibold text-sm">{stage?.name}</h3>
            </div>
            <p className="text-xs mt-1 opacity-90">{stage?.description}</p>
            <div className="text-xs mt-2 bg-white/20 rounded px-2 py-1 inline-block">
              {getProjectsByStage(stage?.id)?.length} proyectos
            </div>
          </div>
          
          <div className="p-4 space-y-3 min-h-[400px]">
            {getProjectsByStage(stage?.id)?.map((project) => (
              <div
                key={project?.id}
                onClick={() => onProjectSelect?.(project)}
                className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getPriorityColor(project?.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm text-foreground line-clamp-2">
                    {project?.name}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project?.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    project?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    project?.priority === 'medium'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {project?.priority === 'urgent' ? 'Urgente' :
                     project?.priority === 'high' ? 'Alta' :
                     project?.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">{project?.client}</p>
                <p className="text-xs text-muted-foreground mb-2">{project?.code}</p>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Users" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {project?.assignedPersonnel?.slice(0, 2)?.join(', ')}
                    {project?.assignedPersonnel?.length > 2 && ` +${project?.assignedPersonnel?.length - 2}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(project?.deadline)?.toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    {project?.progress}%
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all"
                    style={{ width: `${project?.progress}%` }}
                  ></div>
                </div>

                {project?.hasClientCatalog && (
                  <div className="flex items-center space-x-1 mt-2">
                    <Icon name="FileCheck" size={12} className="text-green-600" />
                    <span className="text-xs text-green-600">Catálogo cliente</span>
                  </div>
                )}
              </div>
            ))}
            
            {getProjectsByStage(stage?.id)?.length === 0 && (
              <div className="text-center py-8">
                <Icon name="Inbox" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin proyectos</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowBoard;