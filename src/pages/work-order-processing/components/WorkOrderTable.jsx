import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const WorkOrderTable = ({ workOrders, onStatusUpdate, onAssignTechnician, onViewDetails, onEditOrder }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (orderId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded?.has(orderId)) {
      newExpanded?.delete(orderId);
    } else {
      newExpanded?.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return 'bg-red-100 text-red-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Progreso': return 'bg-blue-100 text-blue-800';
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'En Pausa': return 'bg-orange-100 text-orange-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Orden de Trabajo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Técnico Asignado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fecha Límite
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {workOrders?.map((order) => (
              <React.Fragment key={order?.id}>
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(order?.id)}
                        className="w-6 h-6"
                      >
                        <Icon 
                          name={expandedRows?.has(order?.id) ? 'ChevronDown' : 'ChevronRight'} 
                          size={16} 
                        />
                      </Button>
                      <div>
                        <div className="text-sm font-medium text-foreground">{order?.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">{order?.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{order?.projectName}</div>
                    <div className="text-xs text-muted-foreground">{order?.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order?.priority)}`}>
                      {order?.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} color="white" />
                      </div>
                      <div>
                        <div className="text-sm text-foreground">{order?.assignedTechnician}</div>
                        <div className="text-xs text-muted-foreground">{order?.technicianRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order?.status)}`}>
                      {order?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {order?.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(order)}
                        iconName="Eye"
                        iconSize={16}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditOrder(order)}
                        iconName="Edit"
                        iconSize={16}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignTechnician(order)}
                        iconName="UserPlus"
                        iconSize={16}
                      >
                        Asignar
                      </Button>
                    </div>
                  </td>
                </tr>
                
                {expandedRows?.has(order?.id) && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 bg-muted/30">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Descripción del Trabajo</h4>
                            <p className="text-sm text-muted-foreground">{order?.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Materiales Requeridos</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {order?.requiredMaterials?.map((material, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <Icon name="Package" size={12} />
                                  <span>{material?.name} - {material?.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Progreso</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Completado</span>
                                <span className="text-foreground font-medium">{order?.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${order?.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {order?.attachments && order?.attachments?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Documentos Adjuntos</h4>
                            <div className="flex flex-wrap gap-2">
                              {order?.attachments?.map((attachment, index) => (
                                <div key={index} className="flex items-center space-x-2 bg-card border border-border rounded-lg p-2">
                                  <Icon name="FileText" size={16} />
                                  <span className="text-sm text-foreground">{attachment?.name}</span>
                                  <Button variant="ghost" size="icon" className="w-6 h-6">
                                    <Icon name="Download" size={12} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="outline"
                              size="sm"
                              iconName="MessageSquare"
                              iconSize={16}
                            >
                              Agregar Nota
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onStatusUpdate(order, 'En Pausa')}
                              iconName="Pause"
                              iconSize={16}
                            >
                              Pausar
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => onStatusUpdate(order, 'Completada')}
                              iconName="Check"
                              iconSize={16}
                            >
                              Completar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkOrderTable;