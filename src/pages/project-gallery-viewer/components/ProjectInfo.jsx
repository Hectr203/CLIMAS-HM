import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectInfo = ({ project, imageCount }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Project Details */}
        <div className="md:col-span-2">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Folder" size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {project?.name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Icon name="Hash" size={14} />
                  <span>{project?.code}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Icon name="Building" size={14} />
                  <span>{project?.client}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Icon name="MapPin" size={14} />
                  <span>{project?.location}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Statistics */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {imageCount}
            </div>
            <div className="text-sm text-muted-foreground">
              Imágenes totales
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(imageCount * 0.65)}
            </div>
            <div className="text-sm text-muted-foreground">
              Documentadas
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Math.round(imageCount * 0.25)}
            </div>
            <div className="text-sm text-muted-foreground">
              En revisión
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div className="flex items-center justify-end space-x-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Estado del proyecto</div>
            <div className="flex items-center space-x-2">
              <Icon name="Activity" size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {project?.status}
              </span>
            </div>
          </div>
          
          <div className="w-2 h-16 bg-green-600/20 rounded-full overflow-hidden">
            <div 
              className="w-full bg-green-600 rounded-full transition-all duration-500"
              style={{ height: '75%' }}
            />
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="Package" size={16} className="text-blue-600" />
            <div>
              <div className="text-xs text-muted-foreground">Materiales</div>
              <div className="font-medium text-foreground text-sm">
                {Math.round(imageCount * 0.15)} fotos
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="Cog" size={16} className="text-orange-600" />
            <div>
              <div className="text-xs text-muted-foreground">Fabricación</div>
              <div className="font-medium text-foreground text-sm">
                {Math.round(imageCount * 0.20)} fotos
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-purple-600" />
            <div>
              <div className="text-xs text-muted-foreground">Calidad</div>
              <div className="font-medium text-foreground text-sm">
                {Math.round(imageCount * 0.18)} fotos
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="Wrench" size={16} className="text-indigo-600" />
            <div>
              <div className="text-xs text-muted-foreground">Instalación</div>
              <div className="font-medium text-foreground text-sm">
                {Math.round(imageCount * 0.22)} fotos
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-green-600" />
            <div>
              <div className="text-xs text-muted-foreground">Pruebas</div>
              <div className="font-medium text-foreground text-sm">
                {Math.round(imageCount * 0.15)} fotos
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="FileCheck" size={16} className="text-emerald-600" />
            <div>
              <div className="text-xs text-muted-foreground">Entrega</div>
              <div className="font-medium text-foreground text-sm">
                {Math.round(imageCount * 0.10)} fotos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;