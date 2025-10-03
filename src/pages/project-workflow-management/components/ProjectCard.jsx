import React from 'react';
import Icon from '../../../components/AppIcon';


const ProjectCard = ({ project, onSelect, onStageTransition }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 hover:shadow-md transition-all cursor-pointer ${getPriorityColor(project?.priority)}`}
      onClick={() => onSelect?.(project)}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-foreground line-clamp-2 flex-1 mr-2">
          {project?.name}
        </h4>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getPriorityBadgeColor(project?.priority)}`}>
          {getPriorityLabel(project?.priority)}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Building" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{project?.client}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name="Hash" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{project?.code}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {project?.assignedPersonnel?.slice(0, 2)?.join(', ')}
            {project?.assignedPersonnel?.length > 2 && ` +${project?.assignedPersonnel?.length - 2}`}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <Icon name="Calendar" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date(project?.deadline)?.toLocaleDateString('es-MX')}
          </span>
        </div>
        <div className="text-sm font-medium text-foreground">
          {project?.progress}%
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${project?.progress}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        {project?.hasClientCatalog && (
          <div className="flex items-center space-x-1">
            <Icon name="FileCheck" size={14} className="text-green-600" />
            <span className="text-xs text-green-600">Catálogo cliente</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          <Icon name="DollarSign" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            ${project?.budget?.toLocaleString('es-MX')}
          </span>
        </div>
      </div>

      {project?.notes && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
          <Icon name="Info" size={12} className="inline mr-1" />
          {project?.notes}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;