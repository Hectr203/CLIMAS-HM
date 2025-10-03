import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const ChangeOrderPanel = ({ workOrders, onChangeOrder }) => {
          const [selectedOrder, setSelectedOrder] = useState(null);
          const [changeData, setChangeData] = useState({
            type: '',
            description: '',
            reason: '',
            impact: '',
            requestedBy: '',
            approved: false
          });
          const [showHistory, setShowHistory] = useState(false);

          const changeTypes = [
            { value: 'client', label: 'Cambio del Cliente' },
            { value: 'engineering', label: 'Cambio de Ingeniería' },
            { value: 'material', label: 'Cambio de Material' },
            { value: 'process', label: 'Cambio de Proceso' }
          ];

          const handleOrderSelect = (order) => {
            setSelectedOrder(order);
            setChangeData({
              type: '',
              description: '',
              reason: '',
              impact: '',
              requestedBy: '',
              approved: false
            });
            setShowHistory(false);
          };

          const handleSubmitChange = () => {
            if (selectedOrder && changeData?.type && changeData?.description) {
              onChangeOrder?.(selectedOrder?.id, changeData);
              setChangeData({
                type: '',
                description: '',
                reason: '',
                impact: '',
                requestedBy: '',
                approved: false
              });
            }
          };

          const getChangeTypeIcon = (type) => {
            const icons = {
              'client': 'User',
              'engineering': 'Cog',
              'material': 'Package',
              'process': 'Settings'
            };
            return icons?.[type] || 'Edit';
          };

          const getChangeTypeColor = (type) => {
            const colors = {
              'client': 'text-blue-600 bg-blue-50',
              'engineering': 'text-purple-600 bg-purple-50',
              'material': 'text-green-600 bg-green-50',
              'process': 'text-orange-600 bg-orange-50'
            };
            return colors?.[type] || 'text-gray-600 bg-gray-50';
          };

          return (
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Edit" className="text-orange-500" size={20} />
                  <h3 className="font-medium">Órdenes de Cambio</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  iconName="History"
                >
                  {showHistory ? 'Nueva' : 'Historial'}
                </Button>
              </div>
              {!showHistory ? (
                <div className="space-y-4">
                  {/* Orders List */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Órdenes Activas</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {workOrders?.slice(0, 5)?.map((order) => (
                        <div
                          key={order?.id}
                          onClick={() => handleOrderSelect(order)}
                          className={`p-2 border rounded cursor-pointer text-sm transition-colors ${
                            selectedOrder?.id === order?.id
                              ? 'border-primary bg-primary/10' :'border-muted hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{order?.id}</div>
                              <div className="text-xs text-muted-foreground">{order?.clientName}</div>
                            </div>
                            {order?.changeOrders?.length > 0 && (
                              <div className="flex items-center space-x-1 text-orange-600">
                                <Icon name="Edit" size={12} />
                                <span className="text-xs">{order?.changeOrders?.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder && (
                    <div className="space-y-3 border-t pt-4">
                      {/* Order Info */}
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-sm font-medium">{selectedOrder?.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedOrder?.clientName} • {selectedOrder?.statusLabel}
                        </div>
                      </div>

                      {/* Change Type */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Cambio</label>
                        <div className="grid grid-cols-2 gap-1">
                          {changeTypes?.map((type) => (
                            <button
                              key={type?.value}
                              onClick={() => setChangeData(prev => ({ ...prev, type: type?.value }))}
                              className={`p-2 text-xs border rounded transition-colors ${
                                changeData?.type === type?.value
                                  ? 'border-primary bg-primary/10 text-primary' :'border-muted hover:border-primary/50'
                              }`}
                            >
                              {type?.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Descripción del Cambio</label>
                        <textarea
                          value={changeData?.description}
                          onChange={(e) => setChangeData(prev => ({ ...prev, description: e?.target?.value }))}
                          className="w-full p-2 border rounded text-sm resize-none"
                          rows={2}
                          placeholder="Describir el cambio requerido..."
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Razón</label>
                        <Input
                          value={changeData?.reason}
                          onChange={(e) => setChangeData(prev => ({ ...prev, reason: e?.target?.value }))}
                          placeholder="¿Por qué es necesario este cambio?"
                          className="text-sm"
                        />
                      </div>

                      {/* Impact */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Impacto</label>
                        <Input
                          value={changeData?.impact}
                          onChange={(e) => setChangeData(prev => ({ ...prev, impact: e?.target?.value }))}
                          placeholder="Tiempo adicional, materiales, etc."
                          className="text-sm"
                        />
                      </div>

                      {/* Requested By */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Solicitado Por</label>
                        <Input
                          value={changeData?.requestedBy}
                          onChange={(e) => setChangeData(prev => ({ ...prev, requestedBy: e?.target?.value }))}
                          placeholder="Nombre del solicitante"
                          className="text-sm"
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        onClick={handleSubmitChange}
                        disabled={!changeData?.type || !changeData?.description}
                        className="w-full"
                        size="sm"
                        iconName="Plus"
                      >
                        Registrar en Bitácora
                      </Button>
                    </div>
                  )}

                  {!selectedOrder && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Icon name="MousePointer" size={32} className="mx-auto mb-2 opacity-50" />
                      <div className="text-sm">Seleccione una orden para registrar cambios</div>
                    </div>
                  )}
                </div>
              ) : (
                /* Change History */
                (<div className="space-y-3">
                  <h4 className="text-sm font-medium">Historial de Cambios</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {workOrders
                      ?.filter(order => order?.changeOrders?.length > 0)
                      ?.map((order) => (
                      <div key={order?.id}>
                        {order?.changeOrders?.map((change, index) => (
                          <div key={`${order?.id}-${index}`} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Icon 
                                  name={getChangeTypeIcon(change?.type)} 
                                  size={16}
                                />
                                <div>
                                  <div className="text-sm font-medium">{order?.id}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {change?.date || 'Fecha no disponible'}
                                  </div>
                                </div>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(change?.type || 'client')}`}>
                                {changeTypes?.find(t => t?.value === change?.type)?.label || 'Cliente'}
                              </div>
                            </div>
                            <div className="text-sm text-foreground mb-1">
                              {change?.description}
                            </div>
                            {change?.reason && (
                              <div className="text-xs text-muted-foreground">
                                Razón: {change?.reason}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {workOrders?.filter(order => order?.changeOrders?.length > 0)?.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Icon name="History" size={32} className="mx-auto mb-2 opacity-50" />
                      <div className="text-sm">No hay cambios registrados</div>
                    </div>
                  )}
                </div>)
              )}
            </div>
          );
        };

        export default ChangeOrderPanel;