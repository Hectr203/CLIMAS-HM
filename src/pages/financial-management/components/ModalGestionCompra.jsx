import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ModalGestionCompra = ({ 
  isOpen, 
  onClose, 
  expense, 
  onAuthorize, 
  onDelete, 
  mode = 'edit'
}) => {

  const [authData, setAuthData] = useState({
    paymentMethod: '',
    priority: 'normal',
    approverComments: '',
    approvedBy: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Opciones de selects
  const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia_bancaria', label: 'Transferencia Bancaria' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta_corporativa', label: 'Tarjeta Corporativa' }
];


  const priorityOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
  ];

  // Cargar datos si la orden ya está aprobada (modo view)
  useEffect(() => {
    if (expense) {
      setAuthData({
        paymentMethod: expense?.metodoPago || '',
        priority: expense?.prioridadAprobacion || 'normal',
        approverComments: expense?.comentariosAprobador || '',
        approvedBy: expense?.aprobadoPor || '',
      });
    }
  }, [expense]);

  // Manejo de cambios en inputs
  const handleInputChange = (field, value) => {
    setAuthData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Enviar autorización al backend
  const handleSubmit = async (e) => {
  e?.preventDefault();
  setIsSubmitting(true);

  try {
    const payload = {
      decision: "approved",
      metodoPago: authData.paymentMethod,
      prioridad: authData.priority,
      comentariosAprobador: authData.approverComments,
      aprobadoPor: "Juan Pérez - Gerente",
    };

    console.log("Enviando datos de aprobación:", payload);

    // Llamar al callback que conecta con approveGasto()
    await onAuthorize?.(expense?.id, payload);

    onClose?.();
  } catch (error) {
    console.error("Error authorizing payment:", error);
  } finally {
    setIsSubmitting(false);
  }
};



  // Eliminar orden
  const handleDelete = async () => {
    if (!expense?.id) return;
    const ok = window.confirm('¿Eliminar este pago? Esta acción no se puede deshacer.');
    if (!ok) return;

    setIsDeleting(true);
    try {
      await onDelete?.(expense.id);
      onClose?.();
    } catch (err) {
      console.error('Error eliminando pago:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {isViewMode ? 'Detalles de Autorización' : 'Autorización de Pago'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isViewMode ? 'Visualiza los detalles del gasto autorizado' : 'Revisar y autorizar el gasto seleccionado'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting || isDeleting}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Detalles del gasto */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-foreground">Detalles del Gasto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Código Proyecto:</span>
                <p className="text-foreground">{expense?.project}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Proveedor:</span>
                <p className="text-foreground">{expense?.proveedor?.nombre || expense?.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Notas:</span>
                <p className="text-foreground">{expense?.notas || expense?.description}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Monto:</span>
                <p className="text-foreground font-bold text-lg">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(expense?.totalOrden || expense?.amount || 0)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha de Creación:</span>
                <p className="text-foreground">{expense?.fechaOrden?.split('T')[0]}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Solicitante:</span>
                <p className="text-foreground">{expense?.creadoPor || 'Juan Pérez'}</p>
              </div>
            </div>
          </div>

          {/* Detalles de Pago */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icon name="CreditCard" size={16} className="text-primary" />
              <h3 className="font-medium text-foreground">Detalles de Pago</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Método de Pago"
                options={paymentMethods}
                value={authData.paymentMethod}
                onChange={(value) => handleInputChange('paymentMethod', value)}
                disabled={isViewMode}
                required
              />
              <Select
                label="Prioridad"
                options={priorityOptions}
                value={authData.priority}
                onChange={(value) => handleInputChange('priority', value)}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Comentarios del Aprobador</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              rows={4}
              placeholder="Agregue comentarios sobre la autorización..."
              value={authData.approverComments}
              onChange={(e) => handleInputChange('approverComments', e?.target?.value)}
              disabled={isViewMode}
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            {!isViewMode && (
              <Button
                type="button"
                variant="destructive"
                iconName="Trash2"
                iconPosition="left"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Eliminando…' : 'Eliminar pago'}
              </Button>
            )}

            <div className="flex items-center space-x-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isDeleting}>
                {isViewMode ? 'Cerrar' : 'Cancelar'}
              </Button>
              {!isViewMode && (
                <Button
                  type="submit"
                  variant="success"
                  loading={isSubmitting}
                  disabled={isDeleting}
                  iconName="Check"
                  iconPosition="left"
                >
                  Autorizar Pago
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalGestionCompra;
