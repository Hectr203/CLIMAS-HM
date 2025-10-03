import React, { useState, useEffect } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';

        const AttendancePanel = ({ currentShift }) => {
          const [attendanceData, setAttendanceData] = useState([]);
          const [currentTime, setCurrentTime] = useState(new Date());

          const mockPersonnel = [
            { id: 1, name: 'Carlos Martínez', role: 'Técnico Senior', status: 'present', checkIn: '07:55', checkOut: null },
            { id: 2, name: 'Ana Rodríguez', role: 'Especialista', status: 'present', checkIn: '08:02', checkOut: null },
            { id: 3, name: 'Luis García', role: 'Supervisor', status: 'present', checkIn: '07:50', checkOut: null },
            { id: 4, name: 'María López', role: 'Fabricador', status: 'present', checkIn: '08:05', checkOut: null },
            { id: 5, name: 'José Hernández', role: 'Asistente', status: 'late', checkIn: '08:15', checkOut: null },
            { id: 6, name: 'Roberto Silva', role: 'Inspector QC', status: 'absent', checkIn: null, checkOut: null },
            { id: 7, name: 'Carmen Díaz', role: 'Técnico QC', status: 'present', checkIn: '07:58', checkOut: null },
            { id: 8, name: 'Fernando Ruiz', role: 'Coordinador', status: 'present', checkIn: '07:45', checkOut: null }
          ];

          useEffect(() => {
            setAttendanceData(mockPersonnel);
            
            // Update current time every minute
            const timer = setInterval(() => {
              setCurrentTime(new Date());
            }, 60000);

            return () => clearInterval(timer);
          }, []);

          const formatTime = (timeString) => {
            if (!timeString) return '--:--';
            return timeString;
          };

          const getStatusColor = (status) => {
            const colors = {
              'present': 'bg-green-100 text-green-700',
              'late': 'bg-yellow-100 text-yellow-700',
              'absent': 'bg-red-100 text-red-700',
              'checked-out': 'bg-gray-100 text-gray-700'
            };
            return colors?.[status] || 'bg-gray-100 text-gray-700';
          };

          const getStatusLabel = (status) => {
            const labels = {
              'present': 'Presente',
              'late': 'Tarde',
              'absent': 'Ausente',
              'checked-out': 'Salió'
            };
            return labels?.[status] || 'Desconocido';
          };

          const handleCheckOut = (personnelId) => {
            const currentTimeStr = currentTime?.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            setAttendanceData(prev => prev?.map(person => 
              person?.id === personnelId 
                ? { 
                    ...person, 
                    checkOut: currentTimeStr,
                    status: 'checked-out'
                  }
                : person
            ));
          };

          const getAttendanceStats = () => {
            const total = attendanceData?.length;
            const present = attendanceData?.filter(p => p?.status === 'present')?.length;
            const late = attendanceData?.filter(p => p?.status === 'late')?.length;
            const absent = attendanceData?.filter(p => p?.status === 'absent')?.length;
            
            return { total, present, late, absent };
          };

          const stats = getAttendanceStats();

          return (
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center space-x-2">
                  <Icon name="Clock" size={20} />
                  <span>Control de Asistencia</span>
                </h3>
                <div className="text-sm text-muted-foreground">
                  {currentTime?.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              {/* Attendance Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-green-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-green-700">{stats?.present}</div>
                  <div className="text-xs text-green-600">Presente</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-yellow-700">{stats?.late}</div>
                  <div className="text-xs text-yellow-600">Tarde</div>
                </div>
              </div>
              {/* Shift Hours */}
              <div className="bg-muted p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Horario de Turno:</span>
                  <span className="font-medium">8:00 - 18:00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Total Personal:</span>
                  <span className="font-medium">{stats?.total}</span>
                </div>
              </div>
              {/* Personnel List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {attendanceData?.map((person) => (
                  <div key={person?.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{person?.name}</div>
                      <div className="text-xs text-muted-foreground">{person?.role}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(person?.status)}`}>
                        {getStatusLabel(person?.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {person?.checkIn ? `E: ${formatTime(person?.checkIn)}` : ''}
                        {person?.checkOut ? ` S: ${formatTime(person?.checkOut)}` : ''}
                      </div>
                    </div>

                    {person?.status === 'present' || person?.status === 'late' ? (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleCheckOut(person?.id)}
                        iconName="LogOut"
                        className="ml-2"
                      >
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  iconName="FileText"
                >
                  Generar Reporte Diario
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  iconName="Bell"
                >
                  Notificar Ausencias
                </Button>
              </div>
              {/* Shift Status Alert */}
              <div className={`mt-4 p-3 rounded-lg ${
                currentShift === 'morning' ?'bg-green-50 border border-green-200' :'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={currentShift === 'morning' ? 'CheckCircle' : 'XCircle'} 
                    size={16} 
                    className={currentShift === 'morning' ? 'text-green-600' : 'text-red-600'} 
                  />
                  <div className="text-sm">
                    <div className={`font-medium ${
                      currentShift === 'morning' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {currentShift === 'morning' ? 'Turno Activo' : 'Fuera de Horario'}
                    </div>
                    <div className={currentShift === 'morning' ? 'text-green-700' : 'text-red-700'}>
                      {currentShift === 'morning' ?'Personal en horario laboral' :'Turno terminado - registro cerrado'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default AttendancePanel;