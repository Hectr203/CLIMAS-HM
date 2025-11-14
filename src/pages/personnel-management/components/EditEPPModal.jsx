import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import usePerson from '../../../hooks/usePerson';

const EditEPPModal = ({ isOpen, onClose, employee, onSave }) => {
  const [localError, setLocalError] = useState(null);
  const { updatePersonByEmpleadoId } = usePerson();
  const { showSuccess } = useNotifications();

  const [formData, setFormData] = useState({
    employeeId: '',
    ppe: {
      helmet: false,
      vest: false,
      boots: false,
      gloves: false,
      glasses: false,
      mask: false
    }
  });

  // Cargar datos del empleado
  useEffect(() => {
    if (employee) {
      const ppe = Array.isArray(employee.equipos)
        ? employee.equipos[0] || { helmet: false, vest: false, boots: false, gloves: false, glasses: false, mask: false }
        : employee.ppe || { helmet: false, vest: false, boots: false, gloves: false, glasses: false, mask: false };

      setFormData({
        employeeId: employee.empleadoId || '',
        ppe
      });
    }
  }, [employee, isOpen]);

  const handlePPEChange = (item, checked) => {
    setFormData(prev => ({
      ...prev,
      ppe: {
        ...prev.ppe,
        [item]: checked
      }
    }));
  };

  const handleSave = async () => {
    setLocalError(null);
    try {
      const payload = {
        equipos: [formData.ppe]
      };

      const result = await updatePersonByEmpleadoId(formData.employeeId, payload);
      showSuccess('EPP actualizado correctamente ✅');

      if (onSave) onSave(result);
      onClose();
    } catch (error) {
      console.error("Error al guardar EPP:", error);
      if (error?.status === 409 && error?.data?.error?.includes('correo')) {
        setLocalError(error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1050 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="Shield" size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Editar Equipo de Protección Personal</h2>
              <p className="text-sm text-muted-foreground">Modificar información de EPP del empleado</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Equipo de Protección Personal</h4>
                <div className="space-y-3">
                  <Checkbox
                    label="Casco de Seguridad"
                    checked={formData.ppe.helmet || false}
                    onChange={(e) => handlePPEChange('helmet', e.target.checked)}
                  />
                  <Checkbox
                    label="Chaleco Reflectivo"
                    checked={formData.ppe.vest || false}
                    onChange={(e) => handlePPEChange('vest', e.target.checked)}
                  />
                  <Checkbox
                    label="Botas de Seguridad"
                    checked={formData.ppe.boots || false}
                    onChange={(e) => handlePPEChange('boots', e.target.checked)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Equipo Adicional</h4>
                <div className="space-y-3">
                  <Checkbox
                    label="Guantes de Trabajo"
                    checked={formData.ppe.gloves || false}
                    onChange={(e) => handlePPEChange('gloves', e.target.checked)}
                  />
                  <Checkbox
                    label="Gafas de Seguridad"
                    checked={formData.ppe.glasses || false}
                    onChange={(e) => handlePPEChange('glasses', e.target.checked)}
                  />
                  <Checkbox
                    label="Mascarilla"
                    checked={formData.ppe.mask || false}
                    onChange={(e) => handlePPEChange('mask', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            iconName="Save"
            iconPosition="left"
            disabled={localError?.status === 409 && localError?.data?.error?.includes('correo')}
          >
            Guardar EPP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEPPModal;

