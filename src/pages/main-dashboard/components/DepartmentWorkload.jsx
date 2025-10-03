import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DepartmentWorkload = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const departments = [
    {
      id: 'administration',
      name: 'Administración',
      icon: 'FileText',
      color: 'bg-primary',
      activeProjects: 8,
      pendingTasks: 12,
      completedThisWeek: 15,
      workload: 75,
      staff: [
        { name: 'María González', role: 'Coordinadora', status: 'active', tasks: 5 },
        { name: 'Roberto Silva', role: 'Analista', status: 'active', tasks: 4 },
        { name: 'Ana Martínez', role: 'Asistente', status: 'busy', tasks: 3 }
      ]
    },
    {
      id: 'projects',
      name: 'Proyectos',
      icon: 'FolderOpen',
      color: 'bg-success',
      activeProjects: 12,
      pendingTasks: 8,
      completedThisWeek: 22,
      workload: 85,
      staff: [
        { name: 'Carlos Mendoza', role: 'Jefe de Proyecto', status: 'active', tasks: 6 },
        { name: 'Diego Ramírez', role: 'Supervisor', status: 'active', tasks: 5 },
        { name: 'Luis Herrera', role: 'Técnico Senior', status: 'busy', tasks: 4 }
      ]
    },
    {
      id: 'workshop',
      name: 'Taller',
      icon: 'Wrench',
      color: 'bg-warning',
      activeProjects: 6,
      pendingTasks: 18,
      completedThisWeek: 28,
      workload: 92,
      staff: [
        { name: 'José López', role: 'Supervisor Taller', status: 'busy', tasks: 8 },
        { name: 'Miguel Torres', role: 'Técnico', status: 'active', tasks: 6 },
        { name: 'Pedro Sánchez', role: 'Técnico', status: 'active', tasks: 4 }
      ]
    },
    {
      id: 'sales',
      name: 'Ventas',
      icon: 'Users',
      color: 'bg-accent',
      activeProjects: 15,
      pendingTasks: 6,
      completedThisWeek: 18,
      workload: 68,
      staff: [
        { name: 'Ana García', role: 'Gerente Ventas', status: 'active', tasks: 4 },
        { name: 'Fernando Ruiz', role: 'Ejecutivo', status: 'active', tasks: 3 },
        { name: 'Carmen Jiménez', role: 'Ejecutivo', status: 'active', tasks: 2 }
      ]
    }
  ];

  const getWorkloadColor = (workload) => {
    if (workload >= 90) return 'bg-error';
    if (workload >= 75) return 'bg-warning';
    if (workload >= 50) return 'bg-success';
    return 'bg-muted';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'offline': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Carga de Trabajo por Departamento</h3>
            <p className="text-sm text-muted-foreground">Distribución de tareas y personal activo</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              Semana
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              Mes
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {departments?.map((dept) => (
            <div key={dept?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dept?.color} text-white`}>
                    <Icon name={dept?.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{dept?.name}</h4>
                    <p className="text-sm text-muted-foreground">{dept?.staff?.length} miembros</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{dept?.workload}%</div>
                  <div className="text-xs text-muted-foreground">Capacidad</div>
                </div>
              </div>

              {/* Workload Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Carga de trabajo</span>
                  <span className="font-medium text-foreground">{dept?.workload}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getWorkloadColor(dept?.workload)}`}
                    style={{ width: `${dept?.workload}%` }}
                  />
                </div>
              </div>

              {/* Department Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{dept?.activeProjects}</div>
                  <div className="text-xs text-muted-foreground">Proyectos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{dept?.pendingTasks}</div>
                  <div className="text-xs text-muted-foreground">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{dept?.completedThisWeek}</div>
                  <div className="text-xs text-muted-foreground">Completadas</div>
                </div>
              </div>

              {/* Staff List */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground mb-2">Personal</h5>
                {dept?.staff?.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <Icon name="User" size={14} color="white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{member?.name}</div>
                        <div className="text-xs text-muted-foreground">{member?.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-foreground">{member?.tasks} tareas</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(member?.status)}`} 
                           title={getStatusText(member?.status)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Ocupado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span>Desconectado</span>
            </div>
          </div>
          <Button variant="outline" size="sm" iconName="Users" iconPosition="left">
            Gestionar Personal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentWorkload;