import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const ProgressTracking = ({ project, onPhotoUpload }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const progressPhotos = project?.progressTracking?.photos || [];
  const pendingPayments = project?.progressTracking?.pendingPayments || [];
  const completedMilestones = project?.progressTracking?.completedMilestones || [];

  const milestones = [
    { id: 'site-preparation', label: 'Preparación del Sitio', icon: 'MapPin' },
    { id: 'equipment-delivery', label: 'Entrega de Equipos', icon: 'Truck' },
    { id: 'installation-start', label: 'Inicio Instalación', icon: 'Play' },
    { id: 'system-testing', label: 'Pruebas del Sistema', icon: 'TestTube' },
    { id: 'client-approval', label: 'Aprobación Cliente', icon: 'ThumbsUp' },
    { id: 'project-completion', label: 'Finalización Proyecto', icon: 'CheckCircle' }
  ];

  const handlePhotoUpload = () => {
    setShowUploadModal(true);
  };

  const handlePhotoCapture = () => {
    // Simulate photo capture with metadata
    const newPhoto = {
      id: Date.now(),
      url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5",
      timestamp: new Date()?.toLocaleString(),
      location: "Área de trabajo - Piso 1",
      description: "Avance de instalación",
      metadata: {
        gps: "19.4326, -99.1332",
        temperature: "23°C",
        humidity: "65%"
      }
    };
    
    onPhotoUpload(project?.id, 'progressPhotos', newPhoto);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress Photos Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Control de Avances</h3>
            <p className="text-muted-foreground text-sm">
              Documentación fotográfica con metadatos de ubicación y tiempo
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Camera"
              iconPosition="left"
              onClick={handlePhotoUpload}
            >
              Tomar Foto
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Upload"
              iconPosition="left"
            >
              Subir Fotos
            </Button>
            <Button
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Exportar Reporte
            </Button>
          </div>
        </div>

        {/* Photo Grid */}
        {progressPhotos?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {progressPhotos?.map((photo) => (
              <div
                key={photo?.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={photo?.url}
                    alt={photo?.description}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                
                {/* Photo Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                  <Icon
                    name="ZoomIn"
                    size={24}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Photo Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                  <div className="text-white text-sm font-medium">
                    {photo?.description}
                  </div>
                  <div className="text-white/80 text-xs flex items-center space-x-2 mt-1">
                    <Icon name="Clock" size={12} />
                    <span>{photo?.timestamp}</span>
                    <Icon name="MapPin" size={12} />
                    <span>{photo?.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No hay fotos de avance</h4>
            <p className="text-muted-foreground mb-4">
              Comience a documentar el progreso del proyecto con fotografías
            </p>
            <Button
              iconName="Camera"
              iconPosition="left"
              onClick={handlePhotoUpload}
            >
              Tomar Primera Foto
            </Button>
          </div>
        )}

        {/* Photo Analytics */}
        {progressPhotos?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{progressPhotos?.length}</div>
              <div className="text-sm text-muted-foreground">Fotos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(progressPhotos?.map(p => p?.location))?.size}
              </div>
              <div className="text-sm text-muted-foreground">Ubicaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor((Date.now() - new Date(project?.createdDate)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-muted-foreground">Días de Trabajo</div>
            </div>
          </div>
        )}
      </div>
      {/* Milestones Progress */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Hitos del Proyecto</h4>
        
        <div className="space-y-3">
          {milestones?.map((milestone) => {
            const isCompleted = completedMilestones?.includes(milestone?.id);
            return (
              <div
                key={milestone?.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200' :'bg-background border-border'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isCompleted ? 'bg-green-100' : 'bg-muted'
                  }`}>
                    <Icon
                      name={milestone?.icon}
                      size={16}
                      className={isCompleted ? 'text-green-600' : 'text-muted-foreground'}
                    />
                  </div>
                  <span className={`font-medium ${
                    isCompleted ? 'text-green-800' : 'text-foreground'
                  }`}>
                    {milestone?.label}
                  </span>
                </div>

                {isCompleted ? (
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Check"
                  >
                    Marcar Completo
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Payment Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Estado de Pagos</h4>
        
        {pendingPayments?.length > 0 ? (
          <div className="space-y-3">
            {pendingPayments?.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon name="AlertTriangle" size={16} className="text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-800">
                      Pago Pendiente: {payment?.description}
                    </div>
                    <div className="text-sm text-yellow-600">
                      Vencimiento: {payment?.dueDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-yellow-800">
                    ${payment?.amount?.toLocaleString()}
                  </div>
                  <Button
                    variant="warning"
                    size="sm"
                    iconName="CreditCard"
                    iconPosition="left"
                  >
                    Confirmar Pago
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Icon name="CheckCircle" size={48} className="text-green-600 mx-auto mb-3" />
              <h4 className="font-medium text-green-800 mb-2">Pagos al Día</h4>
              <p className="text-green-600 text-sm">
                No hay pagos pendientes para este proyecto
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Photo Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">Documentar Avance</h4>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setShowUploadModal(false)}
              />
            </div>

            <div className="space-y-4">
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Capture el progreso del trabajo
                </p>
                <Button
                  iconName="Camera"
                  iconPosition="left"
                  onClick={handlePhotoCapture}
                >
                  Tomar Foto
                </Button>
              </div>

              <div className="space-y-3">
                <Input
                  label="Descripción"
                  placeholder="Descripción del avance..."
                />
                <Input
                  label="Ubicación"
                  placeholder="Área específica del trabajo..."
                />
              </div>

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center space-x-2 mb-1">
                  <Icon name="MapPin" size={12} />
                  <span>GPS: Se capturará automáticamente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={12} />
                  <span>Timestamp: {new Date()?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="relative">
              <img
                src={selectedPhoto?.url}
                alt={selectedPhoto?.description}
                className="max-w-full max-h-[80vh] rounded-lg"
              />
              
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedPhoto(null)}
              />

              {/* Photo Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
                <div className="font-medium mb-2">{selectedPhoto?.description}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Icon name="Clock" size={14} className="inline mr-1" />
                    {selectedPhoto?.timestamp}
                  </div>
                  <div>
                    <Icon name="MapPin" size={14} className="inline mr-1" />
                    {selectedPhoto?.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;