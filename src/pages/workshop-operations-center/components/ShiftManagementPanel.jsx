import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ShiftManagementPanel = ({ currentShift = {}, onAttendanceUpdate }) => {
  const shiftStats = [
    {
      label: 'Horario de Turno',
      value: `${currentShift?.start} - ${currentShift?.end}`,
      icon: 'Clock',
      color: 'text-blue-600'
    },
    {
      label: 'Fecha',
      value: new Date(currentShift?.date)?.toLocaleDateString('es-MX') || 'Hoy',
      icon: 'Calendar',
      color: 'text-green-600'
    },
    {
      label: 'Técnicos Presentes',
      value: `${currentShift?.attendanceCount}/${currentShift?.totalTechnicians}`,
      icon: 'Users',
      color: 'text-purple-600'
    },
    {
      label: 'Porcentaje de Asistencia',
      value: `${Math.round((currentShift?.attendanceCount / currentShift?.totalTechnicians) * 100) || 0}%`,
      icon: 'TrendingUp',
      color: 'text-orange-600'
    }
  ];

  const shiftTips = [
    {
      icon: 'Shield',
      title: 'Verificación de Seguridad',
      description: 'Asegurar que todos los técnicos completen el checklist de seguridad antes de iniciar trabajos.'
    },
    {
      icon: 'Clock',
      title: 'Control de Tiempo',
      description: 'Monitorear el progreso de las órdenes para cumplir con el horario del turno.'
    },
    {
      icon: 'Camera',
      title: 'Documentación',
      description: 'Registrar evidencia fotográfica de cada etapa del proceso de trabajo.'
    },
    {
      icon: 'Send',
      title: 'Comunicación',
      description: 'Mantener comunicación constante con los departamentos de Proyectos y Compras.'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Icon name="Calendar" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Gestión de Turno</h2>
            <p className="text-sm text-muted-foreground">Información y control del turno actual</p>
          </div>
        </div>
        <Button variant="outline" size="sm" iconName="RotateCcw">
          Actualizar Datos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {shiftStats?.map((stat, index) => (
          <div key={index} className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name={stat?.icon} size={20} className={stat?.color} />
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat?.label}</p>
                <p className="text-sm font-bold text-foreground">{stat?.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shiftTips?.map((tip, index) => (
          <div key={index} className="border border-border rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name={tip?.icon} size={12} color="white" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">{tip?.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{tip?.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftManagementPanel;