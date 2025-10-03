import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const MaterialReceptionPanel = ({ workOrders, onMaterialReception }) => {
          const [selectedOrder, setSelectedOrder] = useState(null);
          const [receptionData, setReceptionData] = useState({
            received: 0,
            notes: '',
            issues: [],
            photos: []
          });
          const [newIssue, setNewIssue] = useState('');

          const handleOrderSelect = (order) => {
            setSelectedOrder(order);
            setReceptionData({
              received: order?.materials?.received || 0,
              notes: '',
              issues: order?.materials?.issues || [],
              photos: []
            });
          };

          const handleAddIssue = () => {
            if (newIssue?.trim()) {
              setReceptionData(prev => ({
                ...prev,
                issues: [...prev?.issues, newIssue?.trim()]
              }));
              setNewIssue('');
            }
          };

          const handleRemoveIssue = (index) => {
            setReceptionData(prev => ({
              ...prev,
              issues: prev?.issues?.filter((_, i) => i !== index)
            }));
          };

          const handleSubmitReception = () => {
            if (selectedOrder) {
              const status = receptionData?.received >= selectedOrder?.materials?.total ? 'complete' : 'partial';
              onMaterialReception?.(selectedOrder?.id, {
                ...receptionData,
                status
              });
              setSelectedOrder(null);
              setReceptionData({
                received: 0,
                notes: '',
                issues: [],
                photos: []
              });
            }
          };

          const handlePhotoUpload = (event) => {
            const files = Array.from(event?.target?.files);
            // Simulated photo handling
            const newPhotos = files?.map(file => ({
              name: file?.name,
              size: file?.size,
              url: URL?.createObjectURL(file)
            }));
            setReceptionData(prev => ({
              ...prev,
              photos: [...prev?.photos, ...newPhotos]
            }));
          };

          return (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Icon name="Package" className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold">Recepción de Materiales</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders List */}
                <div>
                  <h3 className="font-medium mb-3">Órdenes Pendientes</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {workOrders?.map((order) => (
                      <div
                        key={order?.id}
                        onClick={() => handleOrderSelect(order)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order?.id
                            ? 'border-primary bg-primary/10' :'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{order?.id}</div>
                            <div className="text-sm text-muted-foreground">{order?.clientName}</div>
                            <div className="text-sm">
                              Materiales: {order?.materials?.received}/{order?.materials?.total}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            order?.materials?.status === 'complete' ? 'bg-green-100 text-green-700' :
                            order?.materials?.status === 'partial'? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {order?.materials?.status === 'complete' ? 'Completo' :
                             order?.materials?.status === 'partial' ? 'Parcial' : 'Pendiente'}
                          </div>
                        </div>
                        {order?.materials?.issues?.length > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            {order?.materials?.issues?.length} problema(s) reportado(s)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {workOrders?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="Package" size={48} className="mx-auto mb-2 opacity-50" />
                      <div>No hay órdenes pendientes de recepción</div>
                    </div>
                  )}
                </div>

                {/* Reception Form */}
                <div>
                  {selectedOrder ? (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Verificación Material - {selectedOrder?.id}</h4>
                        <div className="text-sm space-y-1">
                          <div><strong>Proyecto:</strong> {selectedOrder?.projectRef}</div>
                          <div><strong>Cliente:</strong> {selectedOrder?.clientName}</div>
                          <div><strong>Total requerido:</strong> {selectedOrder?.materials?.total} items</div>
                        </div>
                      </div>

                      {/* Received Count */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cantidad Recibida
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={selectedOrder?.materials?.total}
                          value={receptionData?.received}
                          onChange={(e) => setReceptionData(prev => ({
                            ...prev,
                            received: parseInt(e?.target?.value) || 0
                          }))}
                          placeholder="0"
                        />
                      </div>

                      {/* Issues */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Problemas/Faltantes
                        </label>
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              value={newIssue}
                              onChange={(e) => setNewIssue(e?.target?.value)}
                              placeholder="Describir problema o faltante..."
                              onKeyPress={(e) => e?.key === 'Enter' && handleAddIssue()}
                            />
                            <Button
                              onClick={handleAddIssue}
                              size="sm"
                              iconName="Plus"
                            >
                              Agregar
                            </Button>
                          </div>

                          {receptionData?.issues?.map((issue, index) => (
                            <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded border border-red-200">
                              <span className="text-sm text-red-800">{issue}</span>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleRemoveIssue(index)}
                                iconName="X"
                                className="text-red-600 hover:text-red-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Photo Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Evidencia Fotográfica
                        </label>
                        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                          />
                          <label htmlFor="photo-upload" className="cursor-pointer">
                            <Icon name="Camera" size={32} className="mx-auto mb-2 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                              Haga clic para tomar/subir fotos
                            </div>
                          </label>
                        </div>

                        {receptionData?.photos?.length > 0 && (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {receptionData?.photos?.map((photo, index) => (
                              <div key={index} className="relative">
                                <img 
                                  src={photo?.url} 
                                  alt={photo?.name}
                                  className="w-full h-16 object-cover rounded"
                                />
                                <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                                     onClick={() => setReceptionData(prev => ({
                                       ...prev,
                                       photos: prev?.photos?.filter((_, i) => i !== index)
                                     }))}>
                                  ×
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Notas Adicionales
                        </label>
                        <textarea
                          value={receptionData?.notes}
                          onChange={(e) => setReceptionData(prev => ({
                            ...prev,
                            notes: e?.target?.value
                          }))}
                          className="w-full p-3 border rounded-lg resize-none"
                          rows={3}
                          placeholder="Observaciones, condiciones especiales, etc..."
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={handleSubmitReception}
                          className="flex-1"
                          iconName="Check"
                        >
                          Registrar Recepción
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedOrder(null)}
                        >
                          Cancelar
                        </Button>
                      </div>

                      {/* Status Alert */}
                      {receptionData?.received < selectedOrder?.materials?.total && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium text-yellow-800">Material Incompleto</div>
                              <div className="text-yellow-700">
                                Se reportarán faltantes a Proyectos y se esperará reposición
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="MousePointer" size={48} className="mx-auto mb-2 opacity-50" />
                      <div>Seleccione una orden para verificar materiales</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        };

        export default MaterialReceptionPanel;