import React from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';

        const WorkflowBoard = ({ workOrders, onStatusChange, onOrderSelect }) => {
          const columns = [
            { 
              id: 'material-reception', 
              title: 'Recepción Material', 
              icon: 'Package', 
              color: 'bg-blue-500' 
            },
            { 
              id: 'safety-checklist', 
              title: 'Lista Seguridad', 
              icon: 'Shield', 
              color: 'bg-orange-500' 
            },
            { 
              id: 'manufacturing', 
              title: 'Fabricación', 
              icon: 'Wrench', 
              color: 'bg-purple-500' 
            },
            { 
              id: 'quality-control', 
              title: 'Control Calidad', 
              icon: 'CheckCircle', 
              color: 'bg-green-500' 
            },
            { 
              id: 'ready-shipment', 
              title: 'Listo Envío', 
              icon: 'Truck', 
              color: 'bg-teal-500' 
            }
          ];

          const getPriorityColor = (priority) => {
            const colors = {
              'low': 'border-gray-300',
              'medium': 'border-yellow-400',
              'high': 'border-orange-500',
              'urgent': 'border-red-500'
            };
            return colors?.[priority] || 'border-gray-300';
          };

          const getProgressColor = (progress) => {
            if (progress < 30) return 'bg-red-500';
            if (progress < 70) return 'bg-yellow-500';
            return 'bg-green-500';
          };

          const handleMoveOrder = (orderId, newStatus) => {
            onStatusChange?.(orderId, newStatus);
          };

          return (
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Icon name="Workflow" className="text-primary" size={24} />
                <h2 className="text-xl font-bold">Flujo Operativo Taller</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-96 overflow-y-auto">
                {columns?.map((column) => (
                  <div key={column?.id} className="bg-muted/30 rounded-lg p-3">
                    {/* Column Header */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className={`w-3 h-3 rounded-full ${column?.color}`}></div>
                      <Icon name={column?.icon} size={16} className="text-foreground" />
                      <span className="font-medium text-sm">{column?.title}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {workOrders?.filter(order => order?.status === column?.id)?.length}
                      </span>
                    </div>

                    {/* Work Order Cards */}
                    <div className="space-y-3">
                      {workOrders
                        ?.filter(order => order?.status === column?.id)
                        ?.map((order) => (
                        <div 
                          key={order?.id}
                          className={`bg-background border-2 ${getPriorityColor(order?.priority)} rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200`}
                          onClick={() => onOrderSelect?.(order)}
                        >
                          {/* Order Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-sm">{order?.id}</div>
                              <div className="text-xs text-muted-foreground">{order?.projectRef}</div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order?.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              order?.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              order?.priority === 'medium'? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {order?.priorityLabel}
                            </div>
                          </div>

                          {/* Client Info */}
                          <div className="mb-3">
                            <div className="font-medium text-sm text-foreground">{order?.clientName}</div>
                          </div>

                          {/* Assigned Technicians */}
                          <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Técnicos:</div>
                            {order?.assignedTechnicians?.slice(0, 2)?.map((tech, index) => (
                              <div key={index} className="text-xs">
                                {tech?.name} - {tech?.role}
                              </div>
                            ))}
                            {order?.assignedTechnicians?.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{order?.assignedTechnicians?.length - 2} más
                              </div>
                            )}
                          </div>

                          {/* Material Status */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Materiales:</span>
                              <span className="font-medium">
                                {order?.materials?.received}/{order?.materials?.total}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full ${
                                  order?.materials?.status === 'complete' ? 'bg-green-500' :
                                  order?.materials?.status === 'partial'? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(order?.materials?.received / order?.materials?.total) * 100}%` }}
                              ></div>
                            </div>
                            {order?.materials?.issues?.length > 0 && (
                              <div className="text-xs text-red-600 mt-1">
                                {order?.materials?.issues?.length} problema(s)
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progreso:</span>
                              <span className="font-medium">{order?.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(order?.progress)}`}
                                style={{ width: `${order?.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Completion Date */}
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-3">
                            <Icon name="Calendar" size={12} />
                            <span>Est: {order?.estimatedCompletion}</span>
                          </div>

                          {/* Status Indicators */}
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

                          {/* Action Buttons */}
                          <div className="mt-3 pt-3 border-t border-muted">
                            <div className="flex space-x-1">
                              {column?.id !== 'ready-shipment' && (
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
                                    handleMoveOrder(order?.id, nextStatuses?.[column?.id]);
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
                              >
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Empty Column State */}
                    {workOrders?.filter(order => order?.status === column?.id)?.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Icon name={column?.icon} size={32} className="mx-auto mb-2 opacity-50" />
                        <div className="text-sm">Sin órdenes</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        };

        export default WorkflowBoard;