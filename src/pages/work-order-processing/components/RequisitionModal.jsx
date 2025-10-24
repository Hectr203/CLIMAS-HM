import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const RequisitionModal = ({ isOpen, onClose, requisition, onSave }) => {
  const [formData, setFormData] = useState({
    requestNumber: '',
    orderNumber: '',
    projectName: '',
    requestedBy: '',
    requestDate: '',
    status: 'Pendiente',
    priority: 'Media',
    description: '',
    items: [],
    justification: '',
    notes: ''
  });

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: 'unidades',
    description: '',
    urgency: 'Normal'
  });

  useEffect(() => {
    if (requisition) {
      setFormData({
        requestNumber: requisition?.requestNumber || '',
        orderNumber: requisition?.orderNumber || '',
        projectName: requisition?.projectName || '',
        requestedBy: requisition?.requestedBy || '',
        requestDate: requisition?.requestDate || new Date()?.toISOString()?.split('T')?.[0],
        status: requisition?.status || 'Pendiente',
        priority: requisition?.priority || 'Media',
        description: requisition?.description || '',
        items: requisition?.items || [],
        justification: requisition?.justification || '',
        notes: requisition?.notes || ''
      });
    } else {
      // Reset form for new requisition
      const currentDate = new Date()?.toISOString()?.split('T')?.[0];
      setFormData({
        requestNumber: `REQ-${Date.now()}`,
        orderNumber: '',
        projectName: '',
        requestedBy: 'Usuario Actual',
        requestDate: currentDate,
        status: 'Pendiente',
        priority: 'Media',
        description: '',
        items: [],
        justification: '',
        notes: ''
      });
    }
  }, [requisition, isOpen]);

  const priorityOptions = [
    { value: 'Crítica', label: 'Crítica' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' }
  ];

  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Aprobada', label: 'Aprobada' },
    { value: 'Rechazada', label: 'Rechazada' },
    { value: 'En Proceso', label: 'En Proceso' },
    { value: 'Completada', label: 'Completada' }
  ];

  const unitOptions = [
    { value: 'unidades', label: 'Unidades' },
    { value: 'metros', label: 'Metros' },
    { value: 'litros', label: 'Litros' },
    { value: 'kilogramos', label: 'Kilogramos' },
    { value: 'cajas', label: 'Cajas' },
    { value: 'paquetes', label: 'Paquetes' },
    { value: 'cilindros', label: 'Cilindros' },
    { value: 'rollos', label: 'Rollos' }
  ];

  const urgencyOptions = [
    { value: 'Urgente', label: 'Urgente' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Baja', label: 'Baja' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddItem = () => {
    if (newItem?.name && newItem?.quantity) {
      setFormData(prev => ({
        ...prev,
        items: [...prev?.items, { ...newItem, id: Date.now() }]
      }));
      setNewItem({
        name: '',
        quantity: '',
        unit: 'unidades',
        description: '',
        urgency: 'Normal'
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev?.items?.filter(item => item?.id !== itemId)
    }));
  };

  const handleSave = () => {
    // Generate new request number if it's a new requisition
    const finalData = {
      ...requisition,
      ...formData,
      requestNumber: formData?.requestNumber || `REQ-${Date.now()}`,
      id: requisition?.id || Date.now()
    };
    
    onSave(finalData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {requisition?.id ? 'Editar Requisición' : 'Nueva Requisición de Material'}
            </h2>
            {formData?.requestNumber && (
              <p className="text-sm text-muted-foreground mt-1">
                {formData?.requestNumber}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número de Orden de Trabajo"
              placeholder="OT-2024-XXX"
              value={formData?.orderNumber}
              onChange={(e) => handleInputChange('orderNumber', e?.target?.value)}
            />

            <Input
              label="Nombre del Proyecto"
              placeholder="Nombre del proyecto"
              value={formData?.projectName}
              onChange={(e) => handleInputChange('projectName', e?.target?.value)}
              required
            />

            <Input
              label="Solicitado por"
              value={formData?.requestedBy}
              onChange={(e) => handleInputChange('requestedBy', e?.target?.value)}
              required
            />

            <Input
              label="Fecha de Solicitud"
              type="date"
              value={formData?.requestDate}
              onChange={(e) => handleInputChange('requestDate', e?.target?.value)}
              required
            />

            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange('priority', value)}
              required
            />

            <Select
              label="Estado"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción de la Solicitud
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows={3}
              placeholder="Describe el propósito de esta requisición..."
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
            />
          </div>

          {/* Add New Item Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Agregar Material</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              <Input
                label="Nombre del Material"
                placeholder="Ej: Compresor 5HP"
                value={newItem?.name}
                onChange={(e) => handleNewItemChange('name', e?.target?.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Cantidad"
                  type="number"
                  placeholder="1"
                  value={newItem?.quantity}
                  onChange={(e) => handleNewItemChange('quantity', e?.target?.value)}
                />
                <Select
                  label="Unidad"
                  options={unitOptions}
                  value={newItem?.unit}
                  onChange={(value) => handleNewItemChange('unit', value)}
                />
              </div>

              <Select
                label="Urgencia"
                options={urgencyOptions}
                value={newItem?.urgency}
                onChange={(value) => handleNewItemChange('urgency', value)}
              />
            </div>

            <div className="mb-3">
              <Input
                label="Descripción/Especificaciones"
                placeholder="Especificaciones técnicas del material..."
                value={newItem?.description}
                onChange={(e) => handleNewItemChange('description', e?.target?.value)}
              />
            </div>

            <Button
              variant="outline"
              onClick={handleAddItem}
              iconName="Plus"
              iconSize={16}
              disabled={!newItem?.name || !newItem?.quantity}
            >
              Agregar Material
            </Button>
          </div>

          {/* Items List */}
          {formData?.items?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Materiales Solicitados</h4>
              <div className="space-y-2">
                {formData?.items?.map((item, index) => (
                  <div key={item?.id || index} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="text-sm font-medium text-foreground">{item?.name}</h5>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item?.urgency === 'Urgente' ? 'bg-red-100 text-red-800' :
                            item?.urgency === 'Normal'? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item?.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item?.quantity} {item?.unit}
                        </p>
                        {item?.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item?.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item?.id)}
                        iconName="Trash2"
                        iconSize={14}
                      >
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Justification */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Justificación de la Solicitud
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows={3}
              placeholder="Justifica por qué son necesarios estos materiales..."
              value={formData?.justification}
              onChange={(e) => handleInputChange('justification', e?.target?.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notas Adicionales
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows={2}
              placeholder="Notas adicionales..."
              value={formData?.notes}
              onChange={(e) => handleInputChange('notes', e?.target?.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            iconName="Save"
            iconSize={16}
            disabled={!formData?.projectName || formData?.items?.length === 0}
          >
            {requisition?.id ? 'Actualizar Requisición' : 'Crear Requisición'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequisitionModal;