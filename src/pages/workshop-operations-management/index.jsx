import React, { useState, useEffect } from 'react';
        import Icon from '../../components/AppIcon';
        import Button from '../../components/ui/Button';
        import Sidebar from '../../components/ui/Sidebar';
        import Breadcrumb from '../../components/ui/Breadcrumb';
        import WorkflowBoard from './components/WorkflowBoard';
        import WorkflowControls from './components/WorkflowControls';
        import MaterialReceptionPanel from './components/MaterialReceptionPanel';
        import SafetyChecklistPanel from './components/SafetyChecklistPanel';
        import AttendancePanel from './components/AttendancePanel';
        import QualityControlPanel from './components/QualityControlPanel';
        import ChangeOrderPanel from './components/ChangeOrderPanel';

        const WorkshopOperationsManagement = () => {
          const [workOrders, setWorkOrders] = useState([]);
          const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
          const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
          const [activePanel, setActivePanel] = useState('workflow');
          const [selectedOrder, setSelectedOrder] = useState(null);
          const [isLoading, setIsLoading] = useState(true);
          const [currentShift, setCurrentShift] = useState('morning');

          // Mock workshop work orders data
          const mockWorkOrders = [
            {
              id: 'WO-2024-101',
              projectRef: 'PROJ-2024-001',
              clientName: 'ABC Corporation',
              status: 'material-reception',
              statusLabel: 'Recepción Material',
              priority: 'high',
              priorityLabel: 'Alta',
              assignedTechnicians: [
                { name: 'Carlos Martínez', role: 'Técnico Senior' },
                { name: 'Ana Rodríguez', role: 'Especialista' }
              ],
              materials: {
                received: 8,
                total: 10,
                status: 'partial',
                issues: ['Falta ducto de 12"', 'Rejilla dañada']
              },
              progress: 15,
              estimatedCompletion: '2024-04-15',
              safetyChecklistCompleted: false,
              qualityControlStatus: 'pending',
              changeOrders: []
            },
            {
              id: 'WO-2024-102',
              projectRef: 'PROJ-2024-001',
              clientName: 'ABC Corporation',
              status: 'safety-checklist',
              statusLabel: 'Lista Seguridad',
              priority: 'high',
              priorityLabel: 'Alta',
              assignedTechnicians: [
                { name: 'Luis García', role: 'Supervisor' }
              ],
              materials: {
                received: 10,
                total: 10,
                status: 'complete',
                issues: []
              },
              progress: 25,
              estimatedCompletion: '2024-04-18',
              safetyChecklistCompleted: false,
              qualityControlStatus: 'pending',
              changeOrders: []
            },
            {
              id: 'WO-2024-103',
              projectRef: 'PROJ-2024-002',
              clientName: 'XYZ Industries',
              status: 'manufacturing',
              statusLabel: 'Fabricación',
              priority: 'medium',
              priorityLabel: 'Media',
              assignedTechnicians: [
                { name: 'María López', role: 'Fabricador' },
                { name: 'José Hernández', role: 'Asistente' }
              ],
              materials: {
                received: 15,
                total: 15,
                status: 'complete',
                issues: []
              },
              progress: 65,
              estimatedCompletion: '2024-04-20',
              safetyChecklistCompleted: true,
              qualityControlStatus: 'in-progress',
              changeOrders: [
                { id: 1, description: 'Modificar dimensiones según ingeniería', date: '2024-04-10' }
              ]
            },
            {
              id: 'WO-2024-104',
              projectRef: 'PROJ-2024-003',
              clientName: 'Green Energy México',
              status: 'quality-control',
              statusLabel: 'Control Calidad',
              priority: 'urgent',
              priorityLabel: 'Urgente',
              assignedTechnicians: [
                { name: 'Roberto Silva', role: 'Inspector' },
                { name: 'Carmen Díaz', role: 'Técnico QC' }
              ],
              materials: {
                received: 20,
                total: 20,
                status: 'complete',
                issues: []
              },
              progress: 85,
              estimatedCompletion: '2024-04-12',
              safetyChecklistCompleted: true,
              qualityControlStatus: 'review',
              changeOrders: []
            },
            {
              id: 'WO-2024-105',
              projectRef: 'PROJ-2024-004',
              clientName: 'Tech Solutions SA',
              status: 'ready-shipment',
              statusLabel: 'Listo Envío',
              priority: 'high',
              priorityLabel: 'Alta',
              assignedTechnicians: [
                { name: 'Fernando Ruiz', role: 'Coordinador' }
              ],
              materials: {
                received: 12,
                total: 12,
                status: 'complete',
                issues: []
              },
              progress: 100,
              estimatedCompletion: '2024-04-11',
              safetyChecklistCompleted: true,
              qualityControlStatus: 'approved',
              changeOrders: []
            }
          ];

          useEffect(() => {
            const loadWorkOrders = async () => {
              setIsLoading(true);
              await new Promise(resolve => setTimeout(resolve, 1000));
              setWorkOrders(mockWorkOrders);
              setIsLoading(false);
            };

            loadWorkOrders();
          }, []);

          const handleOrderStatusChange = (orderId, newStatus) => {
            setWorkOrders(prev => prev?.map(order => 
              order?.id === orderId 
                ? { ...order, status: newStatus, statusLabel: getStatusLabel(newStatus) }
                : order
            ));
          };

          const getStatusLabel = (status) => {
            const statusLabels = {
              'material-reception': 'Recepción Material',
              'safety-checklist': 'Lista Seguridad',
              'manufacturing': 'Fabricación',
              'quality-control': 'Control Calidad',
              'ready-shipment': 'Listo Envío'
            };
            return statusLabels?.[status] || status;
          };

          const handleMaterialReception = (orderId, receptionData) => {
            setWorkOrders(prev => prev?.map(order => 
              order?.id === orderId 
                ? { 
                    ...order, 
                    materials: {
                      ...order?.materials,
                      received: receptionData?.received,
                      status: receptionData?.status,
                      issues: receptionData?.issues
                    },
                    status: receptionData?.status === 'complete' ? 'safety-checklist' : 'material-reception'
                  }
                : order
            ));
          };

          const handleSafetyChecklist = (orderId, completed) => {
            setWorkOrders(prev => prev?.map(order => 
              order?.id === orderId 
                ? { 
                    ...order, 
                    safetyChecklistCompleted: completed,
                    status: completed ? 'manufacturing' : 'safety-checklist'
                  }
                : order
            ));
          };

          const handleQualityControl = (orderId, qcData) => {
            setWorkOrders(prev => prev?.map(order => 
              order?.id === orderId 
                ? { 
                    ...order, 
                    qualityControlStatus: qcData?.status,
                    status: qcData?.status === 'approved' ? 'ready-shipment' : 'quality-control'
                  }
                : order
            ));
          };

          const handleChangeOrder = (orderId, changeData) => {
            setWorkOrders(prev => prev?.map(order => 
              order?.id === orderId 
                ? { 
                    ...order, 
                    changeOrders: [...(order?.changeOrders || []), {
                      id: Date.now(),
                      ...changeData,
                      date: new Date()?.toISOString()?.split('T')?.[0]
                    }]
                  }
                : order
            ));
          };

          const panelOptions = [
            { value: 'workflow', label: 'Flujo Taller', icon: 'Workflow' },
            { value: 'materials', label: 'Recepción Material', icon: 'Package' },
            { value: 'safety', label: 'Seguridad', icon: 'Shield' },
            { value: 'attendance', label: 'Asistencia', icon: 'Clock' },
            { value: 'quality', label: 'Control Calidad', icon: 'CheckCircle' },
            { value: 'changes', label: 'Órdenes Cambio', icon: 'Edit' }
          ];

          if (isLoading) {
            return (
              <div className="min-h-screen bg-background flex">
                <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Cargando proyectos...</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="min-h-screen bg-background">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block">
                <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
              </div>

              {/* Mobile Header Placeholder */}
              <div className="lg:hidden">
                <div className="p-4 bg-background border-b">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">Gestión Operativa - Taller</div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded bg-muted">
                      <Icon name="Menu" size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={`transition-all duration-300 ${
                sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
              } lg:pt-0`}>
                <div className="container mx-auto px-4 py-8">
                  {/* Breadcrumb */}
                  <div className="mb-6">
                    <Breadcrumb customItems={[
                      { label: 'Dashboard', path: '/dashboard', icon: 'Home' },
                      { label: 'Gestión Operativa - Área de Taller', path: '/workshop-operations-management', icon: 'Wrench', current: true }
                    ]} />
                  </div>
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Gestión Operativa - Área de Taller</h1>
                    <p className="text-muted-foreground">
                      Flujo completo desde recepción de materiales hasta control de calidad y envío (8:00-18:00)
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                    {/* Shift Indicator */}
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="Clock" size={16} className="text-primary" />
                        <span className="text-sm font-medium">
                          Turno: {currentShift === 'morning' ? '8:00 - 18:00' : 'Fuera de Horario'}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          currentShift === 'morning' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>

                    <div className="flex bg-muted rounded-lg p-1 overflow-x-auto no-scrollbar sticky top-20 z-40">
                      {panelOptions?.slice(0, 3)?.map((option) => (
                        <button
                          key={option?.value}
                          onClick={() => setActivePanel(option?.value)}
                          className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-smooth whitespace-nowrap min-w-[96px] ${
                            activePanel === option?.value
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon name={option?.icon} size={28} />
                          <span className="text-sm font-medium">{option?.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workshop Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Package" className="text-blue-500" size={20} />
                      <span className="font-medium">Recepción</span>
                    </div>
                    <div className="text-2xl font-bold">{workOrders?.filter(o => o?.status === 'material-reception')?.length}</div>
                    <div className="text-sm text-muted-foreground">Órdenes</div>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Shield" className="text-orange-500" size={20} />
                      <span className="font-medium">Seguridad</span>
                    </div>
                    <div className="text-2xl font-bold">{workOrders?.filter(o => o?.status === 'safety-checklist')?.length}</div>
                    <div className="text-sm text-muted-foreground">Listas</div>
                  </div>

                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Wrench" className="text-purple-500" size={20} />
                      <span className="font-medium">Fabricación</span>
                    </div>
                    <div className="text-2xl font-bold">{workOrders?.filter(o => o?.status === 'manufacturing')?.length}</div>
                    <div className="text-sm text-muted-foreground">En Proceso</div>
                  </div>

                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="CheckCircle" className="text-green-500" size={20} />
                      <span className="font-medium">Calidad</span>
                    </div>
                    <div className="text-2xl font-bold">{workOrders?.filter(o => o?.status === 'quality-control')?.length}</div>
                    <div className="text-sm text-muted-foreground">Revisión</div>
                  </div>

                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Truck" className="text-teal-500" size={20} />
                      <span className="font-medium">Envío</span>
                    </div>
                    <div className="text-2xl font-bold">{workOrders?.filter(o => o?.status === 'ready-shipment')?.length}</div>
                    <div className="text-sm text-muted-foreground">Listos</div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Primary Workflow Board */}
                  <div className="lg:col-span-2">
                    {activePanel === 'workflow' && (
                      <WorkflowBoard
                        workOrders={workOrders}
                        onStatusChange={handleOrderStatusChange}
                        onOrderSelect={setSelectedOrder}
                      />
                    )}

                    {activePanel === 'materials' && (
                      <MaterialReceptionPanel
                        workOrders={workOrders?.filter(o => o?.status === 'material-reception')}
                        onMaterialReception={handleMaterialReception}
                      />
                    )}

                    {activePanel === 'safety' && (
                      <SafetyChecklistPanel
                        workOrders={workOrders?.filter(o => o?.status === 'safety-checklist')}
                        onSafetyComplete={handleSafetyChecklist}
                      />
                    )}
                  </div>

                  {/* Secondary Controls Panel */}
                  <div className="space-y-6">
                    <WorkflowControls
                      selectedOrder={selectedOrder}
                      currentShift={currentShift}
                      totalOrders={workOrders?.length}
                    />

                    {/* Quick Actions */}
                    <div className="bg-card border rounded-lg p-4">
                      <h3 className="font-medium mb-4">Acciones Rápidas</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActivePanel('attendance')}
                          iconName="Clock"
                        >
                          Asistencia
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActivePanel('quality')}
                          iconName="CheckCircle"
                        >
                          Calidad
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActivePanel('changes')}
                          iconName="Edit"
                        >
                          Cambios
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          iconName="Camera"
                        >
                          Evidencias
                        </Button>
                      </div>
                    </div>

                    {/* Secondary Panels */}
                    {activePanel === 'attendance' && (
                      <AttendancePanel currentShift={currentShift} />
                    )}

                    {activePanel === 'quality' && (
                      <QualityControlPanel
                        workOrders={workOrders?.filter(o => o?.status === 'quality-control')}
                        onQualityUpdate={handleQualityControl}
                      />
                    )}

                    {activePanel === 'changes' && (
                      <ChangeOrderPanel
                        workOrders={workOrders}
                        onChangeOrder={handleChangeOrder}
                      />
                    )}
                  </div>
                </div>

                {/* Empty State */}
                {workOrders?.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Icon name="Wrench" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No hay órdenes de trabajo</h3>
                    <p className="text-muted-foreground mb-6">
                      Las órdenes aparecerán aquí cuando sean enviadas por el área de Proyectos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        };

        export default WorkshopOperationsManagement;