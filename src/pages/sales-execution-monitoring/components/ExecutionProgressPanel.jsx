import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ExecutionProgressPanel = ({ project, onUpdate }) => {
  const [progressUpdate, setProgressUpdate] = useState({
    overallProgress: project?.progress?.overallProgress || 0,
    currentPhase: project?.progress?.currentPhase || '',
    nextMilestone: project?.progress?.nextMilestone || '',
    notes: ''
  });

  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const handleMilestoneUpdate = (milestoneId, updates) => {
    const updatedMilestones = project?.milestones?.map(milestone =>
      milestone?.id === milestoneId 
        ? { ...milestone, ...updates }
        : milestone
    );

    // Calculate overall progress based on completed milestones
    const completedMilestones = updatedMilestones?.filter(m => m?.status === 'completed')?.length || 0;
    const totalMilestones = updatedMilestones?.length || 1;
    const calculatedProgress = Math.round((completedMilestones / totalMilestones) * 100);

    onUpdate?.({
      milestones: updatedMilestones,
      progress: {
        ...project?.progress,
        overallProgress: calculatedProgress
      }
    });
  };

  const handleProgressUpdate = () => {
    onUpdate?.(progressUpdate);
    setProgressUpdate(prev => ({ ...prev, notes: '' }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'in_progress': return 'Clock';
      case 'pending': return 'Circle';
      case 'delayed': return 'AlertTriangle';
      default: return 'Circle';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h5 className="font-medium text-sm">Monitoreo de Ejecución</h5>
        <p className="text-xs text-muted-foreground">
          Punto de contacto del cliente durante la obra (Paso 20 del flujo)
        </p>

        {/* Overall Progress */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Progreso General</span>
            <span className="text-sm font-bold text-blue-600">
              {project?.progress?.overallProgress || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${project?.progress?.overallProgress || 0}%` }}
            ></div>
          </div>
          {project?.progress?.currentPhase && (
            <p className="text-xs text-muted-foreground">
              <strong>Fase actual:</strong> {project?.progress?.currentPhase}
            </p>
          )}
          {project?.progress?.daysRemaining && (
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Días restantes:</strong> {project?.progress?.daysRemaining}
            </p>
          )}
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <h6 className="font-medium text-sm">Hitos del Proyecto</h6>
          
          <div className="space-y-2">
            {project?.milestones?.map((milestone) => (
              <div
                key={milestone?.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedMilestone(selectedMilestone === milestone?.id ? null : milestone?.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getStatusIcon(milestone?.status)} 
                        size={16} 
                        className={getStatusColor(milestone?.status)?.split(' ')?.[0]} 
                      />
                      <span className="font-medium text-sm">{milestone?.name}</span>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        <strong>Meta:</strong> {new Date(milestone?.targetDate)?.toLocaleDateString()}
                      </p>
                      {milestone?.completedDate && (
                        <p className="text-xs text-green-600">
                          <strong>Completado:</strong> {new Date(milestone?.completedDate)?.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(milestone?.status)}`}>
                      {milestone?.status === 'completed' ? 'Completado' :
                       milestone?.status === 'in_progress' ? 'En Progreso' :
                       milestone?.status === 'pending' ? 'Pendiente' : 'Retrasado'}
                    </span>
                    <span className="text-xs font-medium">
                      {milestone?.progress || 0}%
                    </span>
                  </div>
                </div>

                {/* Milestone Details */}
                {selectedMilestone === milestone?.id && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    <div>
                      <label className="text-xs font-medium block mb-1">Progreso (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={milestone?.progress || 0}
                        onChange={(e) => handleMilestoneUpdate(milestone?.id, {
                          progress: parseInt(e?.target?.value)
                        })}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">Estado</label>
                      <select
                        value={milestone?.status}
                        onChange={(e) => {
                          const updates = { status: e?.target?.value };
                          if (e?.target?.value === 'completed') {
                            updates.completedDate = new Date()?.toISOString()?.split('T')?.[0];
                            updates.progress = 100;
                          }
                          handleMilestoneUpdate(milestone?.id, updates);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completado</option>
                        <option value="delayed">Retrasado</option>
                      </select>
                    </div>

                    {milestone?.status === 'completed' && (
                      <div>
                        <label className="text-xs font-medium block mb-1">Fecha de Completado</label>
                        <Input
                          type="date"
                          value={milestone?.completedDate || ''}
                          onChange={(e) => handleMilestoneUpdate(milestone?.id, {
                            completedDate: e?.target?.value
                          })}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Update Form */}
        <div className="space-y-3">
          <h6 className="font-medium text-sm">Actualización de Progreso</h6>
          
          <div>
            <label className="text-sm font-medium block mb-1">Fase Actual</label>
            <Input
              type="text"
              value={progressUpdate?.currentPhase}
              onChange={(e) => setProgressUpdate(prev => ({ ...prev, currentPhase: e?.target?.value }))}
              placeholder="Descripción de la fase actual..."
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Próximo Hito</label>
            <Input
              type="text"
              value={progressUpdate?.nextMilestone}
              onChange={(e) => setProgressUpdate(prev => ({ ...prev, nextMilestone: e?.target?.value }))}
              placeholder="Próximo hito o actividad..."
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Notas de Progreso</label>
            <textarea
              value={progressUpdate?.notes}
              onChange={(e) => setProgressUpdate(prev => ({ ...prev, notes: e?.target?.value }))}
              placeholder="Observaciones, logros, obstáculos encontrados..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleProgressUpdate}
            iconName="Update"
            iconPosition="left"
            size="sm"
            className="w-full"
          >
            Actualizar Progreso
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Hitos Completados</p>
            <p className="text-sm font-bold">
              {project?.milestones?.filter(m => m?.status === 'completed')?.length || 0}/
              {project?.milestones?.length || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Progreso Promedio</p>
            <p className="text-sm font-bold">
              {Math.round((project?.milestones?.reduce((acc, m) => acc + (m?.progress || 0), 0) || 0) / (project?.milestones?.length || 1))}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionProgressPanel;