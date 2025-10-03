import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectExecutionCard = ({ project, onSelect, onPhaseChange }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'text-green-600 bg-green-100';
    if (progress >= 70) return 'text-blue-600 bg-blue-100';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (phase) => {
    switch (phase) {
      case 'work-order-generated': return 'FileText';
      case 'startup-tracking': return 'PlayCircle';
      case 'execution-monitoring': return 'Activity';
      case 'delivery-coordination': return 'Truck';
      case 'billing-process': return 'Receipt';
      default: return 'Circle';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getPriorityColor(project?.priority)}`}
      onClick={() => onSelect?.(project)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-foreground line-clamp-2">
            {project?.clientName}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {project?.workOrderRef}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`text-xs px-2 py-1 rounded-full ${
            project?.priority === 'urgent' ? 'bg-red-100 text-red-800' :
            project?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            project?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {project?.priority === 'urgent' ? 'Urgente' :
             project?.priority === 'high' ? 'Alta' :
             project?.priority === 'medium' ? 'Media' : 'Baja'}
          </span>
        </div>
      </div>
      {/* Project Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{project?.projectDetails?.location}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name="User" size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{project?.salesRep}</span>
        </div>

        {project?.fieldSupervisor && (
          <div className="flex items-center space-x-2">
            <Icon name="HardHat" size={12} className="text-blue-600" />
            <span className="text-xs text-blue-600">{project?.fieldSupervisor?.name}</span>
          </div>
        )}
      </div>
      {/* Progress Bar */}
      {project?.progress?.overallProgress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progreso</span>
            <span className={`text-xs px-2 py-1 rounded ${getProgressColor(project?.progress?.overallProgress)}`}>
              {project?.progress?.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${project?.progress?.overallProgress}%` }}
            ></div>
          </div>
          {project?.progress?.currentPhase && (
            <p className="text-xs text-muted-foreground mt-1">
              {project?.progress?.currentPhase}
            </p>
          )}
        </div>
      )}
      {/* Key Metrics */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs">
          <span className="text-muted-foreground">Valor: </span>
          <span className="font-medium text-foreground">
            ${project?.contractValue?.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon 
            name={project?.projectType === 'construction' ? 'Building' : 'Package'} 
            size={12} 
            className="text-muted-foreground" 
          />
          <span className="text-xs text-muted-foreground">
            {project?.projectType === 'construction' ? 'Obra' : 'Piezas'}
          </span>
        </div>
      </div>
      {/* Status Indicators */}
      <div className="space-y-2">
        {project?.changeRequests?.length > 0 && (
          <div className="flex items-center space-x-1">
            <Icon name="AlertTriangle" size={12} className="text-orange-600" />
            <span className="text-xs text-orange-600">
              {project?.changeRequests?.length} cambio(s) activo(s)
            </span>
          </div>
        )}

        {project?.communications?.length > 0 && (
          <div className="flex items-center space-x-1">
            <Icon name="MessageCircle" size={12} className="text-blue-600" />
            <span className="text-xs text-blue-600">
              Última comunicación: {new Date(project?.communications[project?.communications?.length - 1]?.date)?.toLocaleDateString()}
            </span>
          </div>
        )}

        {project?.delivery?.status === 'scheduled' && (
          <div className="flex items-center space-x-1">
            <Icon name="Calendar" size={12} className="text-green-600" />
            <span className="text-xs text-green-600">
              Entrega: {new Date(project?.delivery?.scheduledDate)?.toLocaleDateString()}
            </span>
          </div>
        )}

        {project?.billing?.status === 'in_progress' && (
          <div className="flex items-center space-x-1">
            <Icon name="Receipt" size={12} className="text-purple-600" />
            <span className="text-xs text-purple-600">
              Factura: {project?.billing?.invoiceNumber}
            </span>
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Icon name={getStatusIcon(project?.phase)} size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize">
            {project?.phase?.replace('-', ' ')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Eye"
            onClick={(e) => {
              e?.stopPropagation();
              onSelect?.(project);
            }}
            className="h-6 w-6 p-0"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="ArrowRight"
            onClick={(e) => {
              e?.stopPropagation();
              onPhaseChange?.(project);
            }}
            className="h-6 w-6 p-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectExecutionCard;