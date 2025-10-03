import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import { Checkbox } from '../../../components/ui/Checkbox';

        const SafetyChecklistPanel = ({ workOrders, onSafetyComplete }) => {
          const [selectedOrder, setSelectedOrder] = useState(null);
          const [checklist, setChecklist] = useState({});

          const safetyItems = [
            {
              id: 'ppe',
              title: 'Equipo de Protección Personal (EPP)',
              items: [
                'Casco de seguridad',
                'Gafas de protección',
                'Guantes de trabajo',
                'Calzado de seguridad',
                'Chaleco reflectivo'
              ]
            },
            {
              id: 'tools',
              title: 'Herramientas y Equipos',
              items: [
                'Herramientas en buen estado',
                'Equipos calibrados',
                'Extensiones eléctricas revisadas',
                'Escaleras/andamios seguros',
                'Equipos de soldadura verificados'
              ]
            },
            {
              id: 'workspace',
              title: 'Área de Trabajo',
              items: [
                'Área limpia y ordenada',
                'Iluminación adecuada',
                'Ventilación apropiada',
                'Salidas de emergencia libres',
                'Extintores accesibles'
              ]
            },
            {
              id: 'procedures',
              title: 'Procedimientos',
              items: [
                'Planos técnicos disponibles',
                'Instrucciones de trabajo claras',
                'Procedimientos de emergencia',
                'Contactos de emergencia visibles',
                'Permisos de trabajo actualizados'
              ]
            }
          ];

          const handleOrderSelect = (order) => {
            setSelectedOrder(order);
            // Initialize checklist with false values
            const initialChecklist = {};
            safetyItems?.forEach(section => {
              section?.items?.forEach((item, index) => {
                initialChecklist[`${section?.id}-${index}`] = false;
              });
            });
            setChecklist(initialChecklist);
          };

          const handleChecklistChange = (itemKey, checked) => {
            setChecklist(prev => ({
              ...prev,
              [itemKey]: checked
            }));
          };

          const getCompletionPercentage = () => {
            const totalItems = Object?.keys(checklist)?.length;
            const checkedItems = Object?.values(checklist)?.filter(Boolean)?.length;
            return totalItems > 0 ? Math?.round((checkedItems / totalItems) * 100) : 0;
          };

          const isChecklistComplete = () => {
            return Object?.values(checklist)?.every(Boolean);
          };

          const handleSubmitChecklist = () => {
            if (selectedOrder && isChecklistComplete()) {
              onSafetyComplete?.(selectedOrder?.id, true);
              setSelectedOrder(null);
              setChecklist({});
            }
          };

          return (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Icon name="Shield" className="text-orange-500" size={24} />
                <h2 className="text-xl font-bold">Lista de Verificación de Seguridad</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                              Técnicos: {order?.assignedTechnicians?.length}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            order?.safetyChecklistCompleted 
                              ? 'bg-green-100 text-green-700' :'bg-red-100 text-red-700'
                          }`}>
                            {order?.safetyChecklistCompleted ? 'Completo' : 'Pendiente'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {workOrders?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="Shield" size={48} className="mx-auto mb-2 opacity-50" />
                      <div>No hay órdenes pendientes</div>
                    </div>
                  )}
                </div>

                {/* Safety Checklist */}
                <div className="lg:col-span-2">
                  {selectedOrder ? (
                    <div className="space-y-4">
                      {/* Order Info */}
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Lista de Seguridad - {selectedOrder?.id}</h4>
                        <div className="text-sm space-y-1">
                          <div><strong>Proyecto:</strong> {selectedOrder?.projectRef}</div>
                          <div><strong>Cliente:</strong> {selectedOrder?.clientName}</div>
                          <div><strong>Técnicos:</strong> {selectedOrder?.assignedTechnicians?.map(t => t?.name)?.join(', ')}</div>
                        </div>
                        
                        {/* Progress */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progreso de Verificación</span>
                            <span className="font-medium">{getCompletionPercentage()}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                getCompletionPercentage() === 100 ? 'bg-green-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${getCompletionPercentage()}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Checklist Sections */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {safetyItems?.map((section) => (
                          <div key={section?.id} className="bg-muted/30 rounded-lg p-4">
                            <h5 className="font-medium mb-3 flex items-center space-x-2">
                              <Icon name="CheckSquare" size={16} />
                              <span>{section?.title}</span>
                            </h5>
                            <div className="space-y-2">
                              {section?.items?.map((item, index) => {
                                const itemKey = `${section?.id}-${index}`;
                                return (
                                  <div key={itemKey} className="flex items-center space-x-3">
                                    <Checkbox
                                      id={itemKey}
                                      checked={checklist?.[itemKey] || false}
                                      onChange={(e) => handleChecklistChange(itemKey, e?.target?.checked)}
                                    />
                                    <label htmlFor={itemKey} className="text-sm cursor-pointer">
                                      {item}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button
                          onClick={handleSubmitChecklist}
                          disabled={!isChecklistComplete()}
                          className="flex-1"
                          iconName="Shield"
                        >
                          Completar Verificación
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedOrder(null)}
                        >
                          Cancelar
                        </Button>
                      </div>

                      {/* Completion Alert */}
                      {!isChecklistComplete() && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Icon name="AlertTriangle" size={16} className="text-orange-600 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium text-orange-800">Verificación Incompleta</div>
                              <div className="text-orange-700">
                                Complete todos los elementos antes de continuar con la fabricación
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isChecklistComplete() && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium text-green-800">Verificación Completa</div>
                              <div className="text-green-700">
                                Todos los elementos de seguridad han sido verificados
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="MousePointer" size={48} className="mx-auto mb-2 opacity-50" />
                      <div>Seleccione una orden para completar la lista de seguridad</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        };

        export default SafetyChecklistPanel;