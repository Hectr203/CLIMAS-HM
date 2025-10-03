import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AttendancePanel = ({ currentShift = {}, onAttendanceUpdate }) => {
  const [attendanceList, setAttendanceList] = useState([
    {
      id: 1,
      name: 'Carlos Mendoza',
      role: 'Técnico Senior',
      checkIn: '08:00',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-001'
    },
    {
      id: 2,
      name: 'Ana García',
      role: 'Especialista HVAC',
      checkIn: '08:15',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-001'
    },
    {
      id: 3,
      name: 'Roberto Silva',
      role: 'Técnico Junior',
      checkIn: '08:05',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-002'
    },
    {
      id: 4,
      name: 'María López',
      role: 'Supervisora',
      checkIn: '07:45',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-002'
    },
    {
      id: 5,
      name: 'Diego Ramírez',
      role: 'Técnico Senior',
      checkIn: '08:00',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-003'
    },
    {
      id: 6,
      name: 'Laura Jiménez',
      role: 'Especialista HVAC',
      checkIn: null,
      checkOut: null,
      status: 'absent',
      workOrder: null,
      reason: 'Cita médica programada'
    },
    {
      id: 7,
      name: 'Patricia Morales',
      role: 'Supervisora',
      checkIn: '08:10',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-004'
    },
    {
      id: 8,
      name: 'Alejandro Ruiz',
      role: 'Técnico Senior',
      checkIn: '08:00',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-004'
    },
    {
      id: 9,
      name: 'Fernando Castro',
      role: 'Especialista IoT',
      checkIn: '08:30',
      checkOut: null,
      status: 'late',
      workOrder: 'WO-2024-005'
    },
    {
      id: 10,
      name: 'Gabriela Vázquez',
      role: 'Técnico Senior',
      checkIn: '08:00',
      checkOut: null,
      status: 'present',
      workOrder: 'WO-2024-005'
    },
    {
      id: 11,
      name: 'José Hernández',
      role: 'Técnico Junior',
      checkIn: null,
      checkOut: null,
      status: 'absent',
      workOrder: null,
      reason: 'No justificado'
    },
    {
      id: 12,
      name: 'Carmen Torres',
      role: 'Especialista HVAC',
      checkIn: '08:20',
      checkOut: null,
      status: 'late',
      workOrder: null
    }
  ]);

  const handleCheckIn = (technicianId) => {
    const currentTime = new Date()?.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    setAttendanceList(prev => prev?.map(tech =>
      tech?.id === technicianId
        ? { ...tech, checkIn: currentTime, status: currentTime > '08:15' ? 'late' : 'present' }
        : tech
    ));

    updateAttendanceStats();
  };

  const handleCheckOut = (technicianId) => {
    const currentTime = new Date()?.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    setAttendanceList(prev => prev?.map(tech =>
      tech?.id === technicianId
        ? { ...tech, checkOut: currentTime, status: 'completed' }
        : tech
    ));

    updateAttendanceStats();
  };

  const updateAttendanceStats = () => {
    const presentCount = attendanceList?.filter(tech => 
      tech?.status === 'present' || tech?.status === 'late'
    )?.length;
    
    onAttendanceUpdate?.({
      attendanceCount: presentCount,
      totalTechnicians: attendanceList?.length,
      attendanceRate: Math.round((presentCount / attendanceList?.length) * 100)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'late': return 'text-orange-600 bg-orange-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return 'CheckCircle';
      case 'late': return 'Clock';
      case 'absent': return 'XCircle';
      case 'completed': return 'LogOut';
      default: return 'User';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'late': return 'Tardanza';
      case 'absent': return 'Ausente';
      case 'completed': return 'Salida';
      default: return 'Indefinido';
    }
  };

  const presentTechnicians = attendanceList?.filter(tech => tech?.status === 'present' || tech?.status === 'late')?.length;
  const absentTechnicians = attendanceList?.filter(tech => tech?.status === 'absent')?.length;
  const lateTechnicians = attendanceList?.filter(tech => tech?.status === 'late')?.length;

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Control de Asistencia</h2>
            <p className="text-sm text-muted-foreground">
              Turno {currentShift?.start} - {currentShift?.end} | {currentShift?.date}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{presentTechnicians}/{attendanceList?.length}</div>
          <div className="text-sm text-muted-foreground">Presentes</div>
        </div>
      </div>
      {/* Attendance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <div>
              <div className="font-semibold text-green-800">{presentTechnicians - lateTechnicians}</div>
              <div className="text-xs text-green-600">A Tiempo</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={20} className="text-orange-600" />
            <div>
              <div className="font-semibold text-orange-800">{lateTechnicians}</div>
              <div className="text-xs text-orange-600">Tardanzas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="XCircle" size={20} className="text-red-600" />
            <div>
              <div className="font-semibold text-red-800">{absentTechnicians}</div>
              <div className="text-xs text-red-600">Ausentes</div>
            </div>
          </div>
        </div>
      </div>
      {/* Attendance List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {attendanceList?.map((technician) => (
          <div key={technician?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">{technician?.name}</h4>
                <p className="text-xs text-muted-foreground">{technician?.role}</p>
                {technician?.workOrder && (
                  <p className="text-xs text-blue-600">Asignado a: {technician?.workOrder}</p>
                )}
                {technician?.reason && (
                  <p className="text-xs text-red-600">Motivo: {technician?.reason}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Check in/out times */}
              <div className="text-right">
                {technician?.checkIn && (
                  <div className="text-sm font-medium text-foreground">
                    Entrada: {technician?.checkIn}
                  </div>
                )}
                {technician?.checkOut && (
                  <div className="text-sm text-muted-foreground">
                    Salida: {technician?.checkOut}
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(technician?.status)}`}>
                <Icon name={getStatusIcon(technician?.status)} size={12} />
                <span>{getStatusText(technician?.status)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-1">
                {!technician?.checkIn && technician?.status === 'absent' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCheckIn(technician?.id)}
                    iconName="LogIn"
                    className="text-xs px-2 py-1"
                  >
                    Check In
                  </Button>
                )}
                {technician?.checkIn && !technician?.checkOut && technician?.status !== 'absent' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCheckOut(technician?.id)}
                    iconName="LogOut"
                    className="text-xs px-2 py-1"
                  >
                    Check Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quick actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" iconName="Download">
            Exportar Reporte
          </Button>
          <Button variant="outline" size="sm" iconName="Calendar">
            Ver Historial
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Última actualización: {new Date()?.toLocaleTimeString('es-MX')}
        </div>
      </div>
    </div>
  );
};

export default AttendancePanel;