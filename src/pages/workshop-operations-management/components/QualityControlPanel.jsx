import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import { Checkbox } from '../../../components/ui/Checkbox';

        const QualityControlPanel = ({ workOrders, onQualityUpdate }) => {
          const [selectedOrder, setSelectedOrder] = useState(null);
          const [qualityData, setQualityData] = useState({
            checks: {},
            photos: [],
            notes: '',
            decision: null
          });

          const qualityChecks = [
            {
              category: 'Dimensiones',
              items: [
                'Medidas según planos',
                'Tolerancias correctas',
                'Alineación apropiada'
              ]
            },
            {
              category: 'Materiales',
              items: [
                'Material especificado',
                'Acabados correctos',
                'Sin defectos visibles'
              ]
            },
            {
              category: 'Ensamble',
              items: [
                'Soldaduras de calidad',
                'Conexiones seguras',
                'Funcionamiento correcto'
              ]
            },
            {
              category: 'Documentación',
              items: [
                'Certificados de material',
                'Registros de pruebas',
                'Fotografías de evidencia'
              ]
            }
          ];

          const handleOrderSelect = (order) => {
            setSelectedOrder(order);
            // Initialize quality checks
            const initialChecks = {};
            qualityChecks?.forEach(category => {
              category?.items?.forEach((item, index) => {
                initialChecks[`${category?.category}-${index}`] = false;
              });
            });
            setQualityData({
              checks: initialChecks,
              photos: [],
              notes: '',
              decision: null
            });
          };

          const handleCheckChange = (checkKey, checked) => {
            setQualityData(prev => ({
              ...prev,
              checks: {
                ...prev?.checks,
                [checkKey]: checked
              }
            }));
          };

          const handlePhotoUpload = (event) => {
            const files = Array.from(event?.target?.files);
            const newPhotos = files?.map(file => ({
              name: file?.name,
              size: file?.size,
              url: URL?.createObjectURL(file),
              type: 'evidence'
            }));
            setQualityData(prev => ({
              ...prev,
              photos: [...prev?.photos, ...newPhotos]
            }));
          };

          const getCompletionPercentage = () => {
            const totalChecks = Object?.keys(qualityData?.checks)?.length;
            const completedChecks = Object?.values(qualityData?.checks)?.filter(Boolean)?.length;
            return totalChecks > 0 ? Math?.round((completedChecks / totalChecks) * 100) : 0;
          };

          const areAllChecksComplete = () => {
            return Object?.values(qualityData?.checks)?.every(Boolean);
          };

          const handleQualityDecision = (decision) => {
            setQualityData(prev => ({ ...prev, decision }));
          };

          const handleSubmitQuality = () => {
            if (selectedOrder && qualityData?.decision) {
              onQualityUpdate?.(selectedOrder?.id, {
                status: qualityData?.decision === 'approve' ? 'approved' : 'rejected',
                checks: qualityData?.checks,
                photos: qualityData?.photos,
                notes: qualityData?.notes
              });
              setSelectedOrder(null);
              setQualityData({
                checks: {},
                photos: [],
                notes: '',
                decision: null
              });
            }
          };

          return (
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="CheckCircle" className="text-green-500" size={20} />
                <h3 className="font-medium">Control de Calidad</h3>
              </div>
              {/* Orders List */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Órdenes en Revisión</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {workOrders?.map((order) => (
                    <div
                      key={order?.id}
                      onClick={() => handleOrderSelect(order)}
                      className={`p-2 border rounded cursor-pointer text-sm transition-colors ${
                        selectedOrder?.id === order?.id
                          ? 'border-primary bg-primary/10' :'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{order?.id}</div>
                          <div className="text-xs text-muted-foreground">{order?.clientName}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          order?.qualityControlStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          order?.qualityControlStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          order?.qualityControlStatus === 'review'? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order?.qualityControlStatus === 'approved' ? 'Aprobado' :
                           order?.qualityControlStatus === 'rejected' ? 'Rechazado' :
                           order?.qualityControlStatus === 'review' ? 'Revisión' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder ? (
                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm font-medium">{selectedOrder?.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedOrder?.clientName} • {selectedOrder?.progress}% completado
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Verificaciones</span>
                        <span>{getCompletionPercentage()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="h-1 rounded-full bg-green-500 transition-all"
                          style={{ width: `${getCompletionPercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Quality Checks */}
                  <div className="max-h-48 overflow-y-auto space-y-3">
                    {qualityChecks?.map((category) => (
                      <div key={category?.category} className="space-y-2">
                        <h5 className="text-sm font-medium">{category?.category}</h5>
                        {category?.items?.map((item, index) => {
                          const checkKey = `${category?.category}-${index}`;
                          return (
                            <div key={checkKey} className="flex items-center space-x-2 ml-2">
                              <Checkbox
                                id={checkKey}
                                checked={qualityData?.checks?.[checkKey] || false}
                                onChange={(e) => handleCheckChange(checkKey, e?.target?.checked)}
                              />
                              <label htmlFor={checkKey} className="text-sm cursor-pointer">
                                {item}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Photo Evidence */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Evidencia Final
                    </label>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="quality-photos"
                      />
                      <label htmlFor="quality-photos" className="cursor-pointer">
                        <Icon name="Camera" size={24} className="mx-auto mb-1 text-muted-foreground" />
                        <div className="text-xs text-muted-foreground">
                          Fotos del producto final
                        </div>
                      </label>
                    </div>

                    {qualityData?.photos?.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        {qualityData?.photos?.map((photo, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={photo?.url} 
                              alt={photo?.name}
                              className="w-full h-12 object-cover rounded"
                            />
                            <button
                              onClick={() => setQualityData(prev => ({
                                ...prev,
                                photos: prev?.photos?.filter((_, i) => i !== index)
                              }))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Observaciones
                    </label>
                    <textarea
                      value={qualityData?.notes}
                      onChange={(e) => setQualityData(prev => ({ ...prev, notes: e?.target?.value }))}
                      className="w-full p-2 border rounded text-sm resize-none"
                      rows={2}
                      placeholder="Observaciones sobre la calidad..."
                    />
                  </div>

                  {/* Decision */}
                  {areAllChecksComplete() && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Decisión</label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={qualityData?.decision === 'approve' ? 'default' : 'outline'}
                          onClick={() => handleQualityDecision('approve')}
                          iconName="Check"
                          className="flex-1"
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant={qualityData?.decision === 'reject' ? 'destructive' : 'outline'}
                          onClick={() => handleQualityDecision('reject')}
                          iconName="X"
                          className="flex-1"
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    onClick={handleSubmitQuality}
                    disabled={!qualityData?.decision}
                    className="w-full"
                    iconName="Send"
                  >
                    Enviar Revisión
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="MousePointer" size={32} className="mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Seleccione una orden para revisar</div>
                </div>
              )}
            </div>
          );
        };

        export default QualityControlPanel;