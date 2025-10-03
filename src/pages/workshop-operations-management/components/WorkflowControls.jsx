import React from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';

        const WorkflowControls = ({ selectedOrder, currentShift, totalOrders }) => {
          const isWorkingHours = currentShift === 'morning';

          return (
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-4 flex items-center space-x-2">
                <Icon name="Settings" size={20} />
                <span>Controles Operativos</span>
              </h3>

              {/* Shift Status */}
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Estado del Turno</div>
                    <div className="text-sm text-muted-foreground">8:00 - 18:00</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isWorkingHours 
                      ? 'bg-green-100 text-green-700' :'bg-red-100 text-red-700'
                  }`}>
                    {isWorkingHours ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">Resumen Órdenes</div>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <div className="text-sm text-muted-foreground">Órdenes activas</div>
              </div>

              {/* Selected Order Info */}
              {selectedOrder && (
                <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="font-medium mb-2">Orden Seleccionada</div>
                  <div className="text-sm space-y-1">
                    <div><strong>ID:</strong> {selectedOrder?.id}</div>
                    <div><strong>Cliente:</strong> {selectedOrder?.clientName}</div>
                    <div><strong>Estado:</strong> {selectedOrder?.statusLabel}</div>
                    <div><strong>Progreso:</strong> {selectedOrder?.progress}%</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  iconName="FileText"
                >
                  Generar Reporte
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  iconName="Bell"
                >
                  Notificar Proyectos
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  iconName="RefreshCw"
                >
                  Actualizar Estado
                </Button>
              </div>

              {/* Working Hours Reminder */}
              {!isWorkingHours && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800">Fuera de Horario</div>
                      <div className="text-yellow-700">
                        Turno de trabajo: 8:00 - 18:00
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        };

        export default WorkflowControls;