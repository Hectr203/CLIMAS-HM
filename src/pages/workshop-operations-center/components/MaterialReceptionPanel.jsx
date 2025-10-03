import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MaterialReceptionPanel = ({ 
  workOrders = [], 
  onMaterialReception, 
  onReportToProjects, 
  onRequestToPurchases 
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [materialPhotos, setMaterialPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const handleMaterialCheck = (workOrderId, materialIndex, status, condition) => {
    const workOrder = workOrders?.find(wo => wo?.id === workOrderId);
    if (!workOrder) return;

    const updatedItems = workOrder?.materialsReceived?.items?.map((item, index) => 
      index === materialIndex 
        ? { ...item, received: status === 'received', condition }
        : item
    );

    const allReceived = updatedItems?.every(item => item?.received);
    const hasDefects = updatedItems?.some(item => item?.condition === 'defective');

    onMaterialReception?.(workOrderId, {
      status: allReceived ? 'completed' : 'in_progress',
      items: updatedItems,
      photos: materialPhotos,
      notes: notes
    });

    // Report defects to Projects
    if (hasDefects) {
      const defectiveItems = updatedItems?.filter(item => item?.condition === 'defective');
      onReportToProjects?.(workOrderId, 'defect_report', {
        defectiveItems,
        photos: materialPhotos,
        notes
      });
    }

    // Request replacements from Purchases
    const missingItems = updatedItems?.filter(item => !item?.received);
    if (missingItems?.length > 0) {
      onRequestToPurchases?.(workOrderId, 'replacement_request', {
        missingItems,
        notes
      });
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event?.target?.files || []);
    const photoUrls = files?.map(file => URL.createObjectURL(file));
    setMaterialPhotos(prev => [...prev, ...photoUrls]);
  };

  const handleCompleteReception = (workOrder) => {
    const allItemsProcessed = workOrder?.materialsReceived?.items?.every(item => 
      item?.received !== undefined
    );
    
    if (!allItemsProcessed) {
      alert('Por favor verifica todos los materiales antes de completar la recepción.');
      return;
    }

    const completeItems = workOrder?.materialsReceived?.items?.filter(item => 
      item?.received && item?.condition === 'good'
    );
    
    const hasCompleteItems = completeItems?.length > 0;

    onMaterialReception?.(workOrder?.id, {
      status: hasCompleteItems ? 'completed' : 'pending',
      items: workOrder?.materialsReceived?.items,
      photos: materialPhotos,
      notes: notes,
      completedAt: new Date()?.toISOString()
    });

    // Reset form
    setSelectedOrder(null);
    setMaterialPhotos([]);
    setNotes('');
    setSelectedMaterials([]);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Icon name="Package" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recepción de Materiales</h2>
            <p className="text-sm text-muted-foreground">Verificación y registro de materiales recibidos</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Camera">
            Cámara
          </Button>
          <Button variant="outline" size="sm" iconName="FileText">
            Reporte
          </Button>
        </div>
      </div>

      {workOrders?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay materiales pendientes</h3>
          <p className="text-muted-foreground">Todos los materiales han sido recibidos y verificados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {workOrders?.map((workOrder) => (
            <div key={workOrder?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{workOrder?.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">{workOrder?.projectReference}</p>
                  <p className="text-xs text-muted-foreground">Cliente: {workOrder?.clientName}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  workOrder?.priority === 'Crítica' ? 'bg-red-100 text-red-800' :
                  workOrder?.priority === 'Alta' ? 'bg-orange-100 text-orange-800' :
                  workOrder?.priority === 'Media'? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {workOrder?.priority}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground mb-2">Lista de Materiales:</h4>
                
                {workOrder?.materialsReceived?.items?.map((material, materialIndex) => (
                  <div key={materialIndex} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{material?.name}</p>
                      <p className="text-xs text-muted-foreground">Cantidad: {material?.quantity}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Material status buttons */}
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant={material?.received && material?.condition === 'good' ? 'default' : 'outline'}
                          onClick={() => handleMaterialCheck(workOrder?.id, materialIndex, 'received', 'good')}
                          className="text-xs px-2 py-1"
                        >
                          <Icon name="CheckCircle" size={12} className="mr-1" />
                          Bueno
                        </Button>
                        <Button
                          size="sm"
                          variant={material?.condition === 'defective' ? 'destructive' : 'outline'}
                          onClick={() => handleMaterialCheck(workOrder?.id, materialIndex, 'received', 'defective')}
                          className="text-xs px-2 py-1"
                        >
                          <Icon name="XCircle" size={12} className="mr-1" />
                          Defecto
                        </Button>
                        <Button
                          size="sm"
                          variant={!material?.received ? 'secondary' : 'outline'}
                          onClick={() => handleMaterialCheck(workOrder?.id, materialIndex, 'missing', null)}
                          className="text-xs px-2 py-1"
                        >
                          <Icon name="AlertTriangle" size={12} className="mr-1" />
                          Faltante
                        </Button>
                      </div>

                      {/* Status indicator */}
                      <div className="w-3 h-3 rounded-full">
                        {material?.received && material?.condition === 'good' && (
                          <div className="w-3 h-3 bg-green-500 rounded-full" title="Material recibido en buen estado" />
                        )}
                        {material?.condition === 'defective' && (
                          <div className="w-3 h-3 bg-red-500 rounded-full" title="Material defectuoso reportado" />
                        )}
                        {!material?.received && (
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Material faltante" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Photo upload section */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm text-foreground">Documentación Fotográfica</h4>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" iconName="Camera">
                      Tomar Foto
                    </Button>
                  </label>
                </div>
                
                {materialPhotos?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {materialPhotos?.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Material evidence ${index + 1}`}
                          className="w-full h-16 object-cover rounded border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 w-5 h-5"
                          onClick={() => setMaterialPhotos(prev => prev?.filter((_, i) => i !== index))}
                        >
                          <Icon name="X" size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes section */}
              <div className="mt-4">
                <Input
                  placeholder="Notas sobre recepción de materiales..."
                  value={notes}
                  onChange={(e) => setNotes(e?.target?.value)}
                  className="mb-3"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReportToProjects?.(workOrder?.id, 'material_status', {
                    items: workOrder?.materialsReceived?.items,
                    photos: materialPhotos,
                    notes
                  })}
                  iconName="Send"
                >
                  Reportar a Proyectos
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCompleteReception(workOrder)}
                  iconName="CheckCircle"
                >
                  Completar Recepción
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialReceptionPanel;