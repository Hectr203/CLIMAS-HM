import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

        const WorkflowBoard = ({ workOrders = [], onStatusChange, onOrderSelect }) => {
          const columns = [
            { id: 'material-reception', title: 'Recepción Material', icon: 'Package', color: 'bg-blue-500' },
            { id: 'safety-checklist', title: 'Lista Seguridad', icon: 'Shield', color: 'bg-orange-500' },
            { id: 'manufacturing', title: 'Fabricación', icon: 'Wrench', color: 'bg-purple-500' },
            { id: 'quality-control', title: 'Control Calidad', icon: 'CheckCircle', color: 'bg-green-500' },
            { id: 'ready-shipment', title: 'Listo Envío', icon: 'Truck', color: 'bg-teal-500' }
          ];

          const getPriorityColor = (priority) => {
            const colors = { low: 'border-gray-300', medium: 'border-yellow-400', high: 'border-orange-500', urgent: 'border-red-500' };
            return colors[priority] || 'border-gray-300';
          };

          const getProgressColor = (progress) => {
            if (progress < 30) return 'bg-red-500';
            if (progress < 70) return 'bg-yellow-500';
            return 'bg-green-500';
          };

          const handleMoveOrder = (orderId, newStatus) => onStatusChange?.(orderId, newStatus);

          return (
            <div className="bg-card border rounded-lg">
              {/* Title */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Icon name="Workflow" className="text-primary" size={20} />
                  <h3 className="text-lg font-semibold">Flujo Operativo Taller</h3>
                </div>
              </div>

              {/* Single scrollable board area: vertical scrollbar here (max height keeps page scrollbar unchanged) */}
              <div className="overflow-x-auto overflow-y-auto max-h-[64vh] p-4">
                <div className="flex space-x-4">
                  {columns.map((column) => {
                    const orders = workOrders.filter((o) => o?.status === column.id);
                    return (
                      <div key={column.id} className="bg-muted/30 rounded-lg p-3 flex flex-col flex-shrink-0 w-72 md:w-80 lg:w-96">
                        {/* Fixed header area for each column to align starts */}
                        <div className="flex items-center space-x-2 mb-3 h-16 flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${column.color}`} />
                          <Icon name={column.icon} size={16} className="text-foreground" />
                          <span className="font-medium text-sm truncate">{column.title}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full ml-auto">{orders.length}</span>
                        </div>

                        {/* Cards area - no per-column scrollbars; cards will flow and the outer container will scroll */}
                        <div className="space-y-3">
                          {orders.length === 0 && (
                            <div className="text-center text-muted-foreground py-6">
                              <Icon name={column.icon} size={28} className="mx-auto mb-2 opacity-50" />
                              <div className="text-sm">Sin órdenes</div>
                            </div>
                          )}

                          {orders.map((order) => (
                            <div
                              key={order?.id}
                              className={`bg-background border-2 ${getPriorityColor(order?.priority)} rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden h-80 md:h-96 flex flex-col justify-between`}
                              onClick={() => onOrderSelect?.(order)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="min-w-0">
                                <div className="font-medium text-sm truncate">{order?.id}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[16rem]">{order?.projectRef}</div>
                              </div>

                                <div className={`px-2 py-1 rounded-full text-xs font-medium max-w-[8rem] overflow-hidden truncate ${
                                  order?.priority === 'urgent'
                                    ? 'bg-red-100 text-red-700'
                                    : order?.priority === 'high'
                                    ? 'bg-orange-100 text-orange-700'
                                    : order?.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  <span className="truncate">{order?.priorityLabel}</span>
                                </div>
                              </div>

                              <div className="mb-3">
                                <div className="font-medium text-sm text-foreground truncate max-w-[16rem]">{order?.clientName}</div>
                              </div>

                              <div className="mb-3">
                                <div className="text-xs text-muted-foreground mb-1">Técnicos:</div>
                                {order?.assignedTechnicians?.slice(0, 2)?.map((tech, idx) => (
                                  <div key={idx} className="text-xs truncate">
                                    <span className="truncate block max-w-[12rem]">{tech?.name} - {tech?.role}</span>
                                  </div>
                                ))}
                                {order?.assignedTechnicians?.length > 2 && (
                                  <div className="text-xs text-muted-foreground">+{order?.assignedTechnicians?.length - 2} más</div>
                                )}
                              </div>

                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Materiales:</span>
                                  <span className="font-medium">{order?.materials?.received}/{order?.materials?.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className={`h-1 rounded-full ${
                                      order?.materials?.status === 'complete' ? 'bg-green-500' : order?.materials?.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${(order?.materials?.received / order?.materials?.total) * 100}%` }}
                                  />
                                </div>
                                {order?.materials?.issues?.length > 0 && (
                                  <div className="text-xs text-red-600 mt-1">{order?.materials?.issues?.length} problema(s)</div>
                                )}
                              </div>

                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progreso:</span>
                                  <span className="font-medium">{order?.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${getProgressColor(order?.progress)}`} style={{ width: `${order?.progress}%` }} />
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-3">
                                <Icon name="Calendar" size={12} />
                                <span>Est: {order?.estimatedCompletion}</span>
                              </div>

                              <div className="flex items-center space-x-2 text-xs">
                                {order?.safetyChecklistCompleted && (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <Icon name="Shield" size={12} />
                                    <span>Seguro</span>
                                  </div>
                                )}
                                {order?.qualityControlStatus === 'approved' && (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <Icon name="CheckCircle" size={12} />
                                    <span>QC OK</span>
                                  </div>
                                )}
                                {order?.changeOrders?.length > 0 && (
                                  <div className="flex items-center space-x-1 text-orange-600">
                                    <Icon name="Edit" size={12} />
                                    <span>{order?.changeOrders?.length}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-3 border-t border-muted">
                                <div className="flex space-x-1">
                                  {column.id !== 'ready-shipment' && (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      onClick={(e) => {
                                        e?.stopPropagation();
                                        const nextStatuses = {
                                          'material-reception': 'safety-checklist',
                                          'safety-checklist': 'manufacturing',
                                          'manufacturing': 'quality-control',
                                          'quality-control': 'ready-shipment'
                                        };
                                        handleMoveOrder(order?.id, nextStatuses[column.id]);
                                      }}
                                      className="flex-1"
                                    >
                                      Siguiente
                                    </Button>
                                  )}
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={(e) => {
                                      e?.stopPropagation();
                                      // Handle photo evidence
                                    }}
                                    iconName="Camera"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        };

        export default WorkflowBoard;