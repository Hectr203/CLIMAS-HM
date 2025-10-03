import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ProjectInfoPanel = ({ project }) => {
  if (!project) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'review': 'bg-purple-100 text-purple-800',
      'completed': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-green-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors?.[priority] || 'text-gray-600';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        {project?.image && (
          <Image
            src={project?.image}
            alt={project?.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            {project?.name}
          </h2>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm text-primary">
              {project?.code}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status)}`}>
              {project?.statusLabel}
            </span>
          </div>
        </div>
      </div>
      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground border-b border-border pb-2">
            Información General
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="text-foreground font-medium">{project?.type}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Departamento:</span>
              <span className="text-foreground">{project?.department}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prioridad:</span>
              <div className="flex items-center space-x-1">
                <Icon 
                  name="AlertCircle" 
                  size={14} 
                  className={getPriorityColor(project?.priority)}
                />
                <span className="text-foreground">{project?.priorityLabel}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ubicación:</span>
              <span className="text-foreground">{project?.location}</span>
            </div>
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground border-b border-border pb-2">
            Cronograma y Presupuesto
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha Inicio:</span>
              <span className="text-foreground">{formatDate(project?.startDate)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha Fin:</span>
              <span className="text-foreground">{formatDate(project?.endDate)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Presupuesto:</span>
              <span className="text-foreground font-medium">{formatCurrency(project?.budget)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Progreso:</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project?.progress}%` }}
                  />
                </div>
                <span className="text-foreground font-medium">{project?.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Client Info */}
      {project?.client && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-medium text-foreground mb-3">
            Información del Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="text-foreground font-medium">{project?.client?.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Contacto:</span>
              <span className="text-foreground">{project?.client?.contact}</span>
            </div>
          </div>
        </div>
      )}
      {/* Assigned Personnel */}
      {project?.assignedPersonnel?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-medium text-foreground mb-3">
            Personal Asignado
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project?.assignedPersonnel?.map((person, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{person?.name}</div>
                  <div className="text-xs text-muted-foreground">{person?.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Work Orders */}
      {project?.workOrders?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-medium text-foreground mb-3">
            Órdenes de Trabajo
          </h3>
          
          <div className="space-y-2">
            {project?.workOrders?.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-foreground">{order?.code}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order?.status)}`}>
                  {order?.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectInfoPanel;