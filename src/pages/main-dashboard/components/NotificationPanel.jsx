import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationPanel = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const notifications = {
    recent: [
      {
        id: 1,
        type: 'project',
        title: 'Proyecto PRJ-2024-001 actualizado',
        message: 'Carlos Mendoza completó la fase de instalación',
        time: '2 min',
        icon: 'FolderOpen',
        color: 'text-primary'
      },
      {
        id: 2,
        type: 'approval',
        title: 'Solicitud de aprobación pendiente',
        message: 'Orden de compra OC-2024-156 requiere autorización',
        time: '15 min',
        icon: 'AlertCircle',
        color: 'text-warning'
      },
      {
        id: 3,
        type: 'financial',
        title: 'Pago registrado',
        message: 'Cliente Hotel Marriott - Factura F-2024-089',
        time: '1 h',
        icon: 'DollarSign',
        color: 'text-success'
      },
      {
        id: 4,
        type: 'personnel',
        title: 'Documentación vencida',
        message: 'Revisión médica de 3 empleados próxima a vencer',
        time: '2 h',
        icon: 'UserCheck',
        color: 'text-error'
      }
    ],
    approvals: [
      {
        id: 5,
        type: 'expense',
        title: 'Gastos de viaje - Ana García',
        message: 'Solicitud por $2,450 MXN para proyecto Guadalajara',
        time: '30 min',
        icon: 'Receipt',
        color: 'text-warning',
        amount: '$2,450'
      },
      {
        id: 6,
        type: 'purchase',
        title: 'Orden de compra - Materiales',
        message: 'OC-2024-157 por $15,600 MXN - Proveedor HVAC Solutions',
        time: '1 h',
        icon: 'ShoppingCart',
        color: 'text-warning',
        amount: '$15,600'
      },
      {
        id: 7,
        type: 'overtime',
        title: 'Horas extra - Equipo Taller',
        message: 'Autorización para 8 horas adicionales proyecto urgente',
        time: '3 h',
        icon: 'Clock',
        color: 'text-warning'
      }
    ],
    alerts: [
      {
        id: 8,
        type: 'inventory',
        title: 'Stock bajo - Filtros HEPA',
        message: 'Quedan 5 unidades, punto de reorden alcanzado',
        time: '4 h',
        icon: 'Package',
        color: 'text-error'
      },
      {
        id: 9,
        type: 'maintenance',
        title: 'Mantenimiento programado',
        message: 'Equipo compresor requiere servicio en 2 días',
        time: '6 h',
        icon: 'Wrench',
        color: 'text-warning'
      },
      {
        id: 10,
        type: 'contract',
        title: 'Contrato próximo a vencer',
        message: 'Cliente Centro Comercial Galerías - Vence 15/10/2024',
        time: '1 día',
        icon: 'FileText',
        color: 'text-error'
      }
    ]
  };

  const notificationDetails = {
    1: {
      fullDetails: 'El proyecto PRJ-2024-001 ubicado en Torre Corporativa Santa Fe ha avanzado significativamente. Carlos Mendoza, técnico senior, completó exitosamente la fase de instalación del sistema HVAC.',
      timeline: [
        { time: '14:30', event: 'Inicio de instalación', status: 'completed' },
        { time: '16:15', event: 'Conexión eléctrica completada', status: 'completed' },
        { time: '17:45', event: 'Pruebas de funcionamiento', status: 'completed' },
        { time: '18:20', event: 'Documentación actualizada', status: 'completed' }
      ],
      assignedTo: 'Carlos Mendoza',
      location: 'Torre Corporativa Santa Fe, Piso 15',
      nextPhase: 'Pruebas de certificación',
      estimatedCompletion: '2024-10-05'
    },
    2: {
      fullDetails: 'La orden de compra OC-2024-156 por un monto de $45,600 MXN requiere autorización inmediata para proceder con la adquisición de equipos especializados.',
      requestedBy: 'María López - Jefe de Compras',
      supplier: 'HVAC Solutions México',
      items: [
        { description: 'Unidad condensadora 5 TON', quantity: 2, price: '$18,500' },
        { description: 'Ductos galvanizados', quantity: '50m', price: '$8,600' }
      ],
      justification: 'Equipo crítico para proyecto Hotel Marriott - entrega urgente',
      budgetImpact: 'Dentro del presupuesto aprobado',
      deliveryDate: '2024-10-08'
    },
    3: {
      fullDetails: 'Se ha registrado exitosamente el pago correspondiente a la factura F-2024-089 del cliente Hotel Marriott por servicios de mantenimiento preventivo.',
      invoiceNumber: 'F-2024-089',
      client: 'Hotel Marriott Ciudad de México',
      paymentMethod: 'Transferencia bancaria',
      services: [
        { description: 'Mantenimiento preventivo aires acondicionados', amount: '$12,500' },
        { description: 'Reemplazo de filtros HEPA', amount: '$3,200' },
        { description: 'Inspección sistema centralizado', amount: '$2,800' }
      ],
      totalAmount: '$18,500 MXN',
      paymentDate: '2024-10-02',
      accountingStatus: 'Registrado en contabilidad'
    }
  };

  const tabs = [
    { id: 'recent', label: 'Recientes', count: notifications?.recent?.length },
    { id: 'approvals', label: 'Aprobaciones', count: notifications?.approvals?.length },
    { id: 'alerts', label: 'Alertas', count: notifications?.alerts?.length }
  ];

  const handleMarkAsRead = (id) => {
  // console.log eliminado
  };

  const handleApprove = (id) => {
  // console.log eliminado
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedNotification(null);
  };

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Centro de Notificaciones</h3>
            <p className="text-sm text-muted-foreground">Actividades recientes y elementos pendientes</p>
          </div>
          <Button variant="ghost" size="icon">
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </div>

      {!showDetails ? (
        <>
          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{tab?.label}</span>
                    {tab?.count > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === tab?.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {tab?.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications?.[activeTab]?.map((notification) => (
              <div key={notification?.id} className="p-4 border-b border-border hover:bg-muted/50 transition-smooth">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${notification?.color}`}>
                    <Icon name={notification?.icon} size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground">{notification?.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification?.message}</p>
                        {notification?.amount && (
                          <p className="text-sm font-medium text-foreground mt-1">{notification?.amount} MXN</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">{notification?.time}</span>
                    </div>
                    
                    {activeTab === 'approvals' && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Button 
                          variant="success" 
                          size="xs"
                          onClick={() => handleApprove(notification?.id)}
                        >
                          Aprobar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="xs"
                          onClick={() => handleViewDetails(notification)}
                        >
                          Ver detalles
                        </Button>
                      </div>
                    )}
                    
                    {activeTab !== 'approvals' && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Button 
                          variant="ghost" 
                          size="xs"
                          onClick={() => handleMarkAsRead(notification?.id)}
                        >
                          Marcar como leído
                        </Button>
                        <Button 
                          variant="primary" 
                          size="xs"
                          onClick={() => handleViewDetails(notification)}
                        >
                          Ver detalles
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" fullWidth>
              Ver todas las notificaciones
            </Button>
          </div>
        </>
      ) : (
        /* Details View */
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCloseDetails}
              className="flex items-center space-x-2"
            >
              <Icon name="ArrowLeft" size={16} />
              <span>Volver</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Icon name="Share" size={16} />
              </Button>
              <Button variant="outline" size="sm">
                <Icon name="Bookmark" size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${selectedNotification?.color}`}>
                <Icon name={selectedNotification?.icon} size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">{selectedNotification?.title}</h3>
                <p className="text-muted-foreground mb-4">{selectedNotification?.message}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{selectedNotification?.time}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedNotification?.type}</span>
                </div>
              </div>
            </div>

            {/* Full Details */}
            {notificationDetails?.[selectedNotification?.id] && (
              <div className="bg-muted/20 border border-border rounded-lg p-6 space-y-4">
                <h4 className="font-medium text-foreground">Detalles Completos</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {notificationDetails?.[selectedNotification?.id]?.fullDetails}
                </p>

                {/* Timeline for project notifications */}
                {notificationDetails?.[selectedNotification?.id]?.timeline && (
                  <div className="mt-6">
                    <h5 className="font-medium text-foreground mb-3">Cronología del Proyecto</h5>
                    <div className="space-y-3">
                      {notificationDetails?.[selectedNotification?.id]?.timeline?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                          <span className="text-sm text-muted-foreground min-w-16">{item?.time}</span>
                          <span className="text-sm text-foreground">{item?.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase items for approval notifications */}
                {notificationDetails?.[selectedNotification?.id]?.items && (
                  <div className="mt-6">
                    <h5 className="font-medium text-foreground mb-3">Artículos Solicitados</h5>
                    <div className="space-y-2">
                      {notificationDetails?.[selectedNotification?.id]?.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                          <div>
                            <span className="text-sm text-foreground">{item?.description}</span>
                            <span className="text-xs text-muted-foreground ml-2">({item?.quantity})</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{item?.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services for payment notifications */}
                {notificationDetails?.[selectedNotification?.id]?.services && (
                  <div className="mt-6">
                    <h5 className="font-medium text-foreground mb-3">Servicios Facturados</h5>
                    <div className="space-y-2">
                      {notificationDetails?.[selectedNotification?.id]?.services?.map((service, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                          <span className="text-sm text-foreground">{service?.description}</span>
                          <span className="text-sm font-medium text-foreground">{service?.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {notificationDetails?.[selectedNotification?.id]?.assignedTo && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">Asignado a</span>
                      <p className="text-sm text-foreground">{notificationDetails?.[selectedNotification?.id]?.assignedTo}</p>
                    </div>
                  )}
                  {notificationDetails?.[selectedNotification?.id]?.location && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">Ubicación</span>
                      <p className="text-sm text-foreground">{notificationDetails?.[selectedNotification?.id]?.location}</p>
                    </div>
                  )}
                  {notificationDetails?.[selectedNotification?.id]?.supplier && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">Proveedor</span>
                      <p className="text-sm text-foreground">{notificationDetails?.[selectedNotification?.id]?.supplier}</p>
                    </div>
                  )}
                  {notificationDetails?.[selectedNotification?.id]?.paymentMethod && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">Método de Pago</span>
                      <p className="text-sm text-foreground">{notificationDetails?.[selectedNotification?.id]?.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4 border-t border-border">
              {activeTab === 'approvals' ? (
                <>
                  <Button 
                    variant="success"
                    onClick={() => handleApprove(selectedNotification?.id)}
                  >
                    <Icon name="Check" size={16} className="mr-2" />
                    Aprobar
                  </Button>
                  <Button variant="outline">
                    <Icon name="AlertTriangle" size={16} className="mr-2" />
                    Rechazar
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="primary"
                    onClick={() => handleMarkAsRead(selectedNotification?.id)}
                  >
                    <Icon name="Check" size={16} className="mr-2" />
                    Marcar como leído
                  </Button>
                  <Button variant="outline">
                    <Icon name="ExternalLink" size={16} className="mr-2" />
                    Ir al proyecto
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;