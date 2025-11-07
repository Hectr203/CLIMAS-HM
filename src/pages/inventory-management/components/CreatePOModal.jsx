import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CreatePOModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialItem = null, 
  lowStockItems = [] 
}) => {
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    supplier: '',
    notes: '',
    urgent: false,
    reference: '',
    paymentTerms: 'net30',
    priority: 'normal'
  });

  const paymentTermsOptions = [
    { value: 'immediate', label: 'Inmediato' },
    { value: 'net15', label: '15 días' },
    { value: 'net30', label: '30 días' },
    { value: 'net60', label: '60 días' },
  ];

  const priorityOptions = [
    { value: 'baja', label: 'Baja' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  useEffect(() => {
    if (initialItem) {
      // Si recibimos un item inicial, añadirlo a la lista de seleccionados
      const orderQty = initialItem.reorderPoint - initialItem.currentStock + 5;
      
      // Limpiar selección previa si venimos de una alerta específica
      if (initialItem.itemCode) {
        setSelectedItems([{
          id: initialItem.id,
          itemCode: initialItem.itemCode,
          name: initialItem.name || '',
          description: initialItem.description,
          supplier: initialItem.supplier?.name,
          currentStock: initialItem.currentStock,
          reorderPoint: initialItem.reorderPoint,
          unit: initialItem.unit,
          unitCost: initialItem.unitCost || 0,
          orderQty: orderQty > 0 ? orderQty : 5,
          subtotal: (initialItem.unitCost || 0) * (orderQty > 0 ? orderQty : 5)
        }]);
        
        setOrderDetails({
          ...orderDetails,
          supplier: initialItem.supplier?.name
        });
        
        // Si venimos de una alerta específica, avanzamos directamente al paso 2
        setStep(2);
      }
    } else {
      // Si no hay item inicial, resetear al paso 1
      setStep(1);
      setSelectedItems([]);
    }
  }, [initialItem]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleItemSelectionChange = (item, isSelected) => {
    if (isSelected) {
      // Verificar si el artículo ya está en la lista
      if (selectedItems.some(selected => selected.id === item.id)) {
        return; // Evitar añadir duplicados
      }
      
      // Calcular la cantidad recomendada
      const orderQty = item.reorderPoint - item.currentStock + 5;
      
      setSelectedItems([...selectedItems, {
        id: item.id,
        itemCode: item.itemCode,
        name: item.name || '',
        description: item.description,
        supplier: item.supplier?.name,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint,
        unit: item.unit,
        unitCost: item.unitCost || 0,
        orderQty: orderQty > 0 ? orderQty : 5,
        subtotal: (item.unitCost || 0) * (orderQty > 0 ? orderQty : 5)
      }]);
    } else {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    }
  };

  const handleQuantityChange = (id, newQty) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const qty = Math.max(1, parseInt(newQty) || 1);
        return {
          ...item,
          orderQty: qty,
          subtotal: item.unitCost * qty
        };
      }
      return item;
    }));
  };

  const handlePriceChange = (id, newPrice) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const price = Math.max(0, parseFloat(newPrice) || 0);
        return {
          ...item,
          unitCost: price,
          subtotal: price * item.orderQty
        };
      }
      return item;
    }));
  };

  const handleDetailChange = (field, value) => {
    setOrderDetails({
      ...orderDetails,
      [field]: value
    });
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const handleSubmit = () => {
    // Crear la estructura de la orden
    const orderData = {
      supplier: orderDetails.supplier,
      notes: orderDetails.notes,
      urgent: orderDetails.urgent,
      reference: orderDetails.reference,
      paymentTerms: orderDetails.paymentTerms,
      priority: orderDetails.priority,
      items: selectedItems,
      total: calculateTotal(),
      status: 'pending',
      orderDate: new Date(),
      orderNumber: `PO-${Date.now().toString().slice(-6)}`,
      itemCount: selectedItems.length
    };
    
    onSubmit(orderData);
  };

  // Limpiar estado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      // Esperamos un poco para resetear el estado para que no se vea el cambio durante la animación de cierre
      const timer = setTimeout(() => {
        if (!initialItem) {
          setSelectedItems([]);
          setOrderDetails({
            supplier: '',
            notes: '',
            urgent: false,
            reference: '',
            paymentTerms: 'net30',
            priority: 'normal'
          });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
        
        <div className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-card text-left align-middle shadow-xl transition-all">
          <div className="bg-muted px-6 py-4 flex items-center justify-between border-b border-border">
            <h3 className="text-lg font-medium text-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="ShoppingCart" size={18} className="text-primary" />
                <span>Crear Orden de Compra</span>
              </div>
            </h3>
            
            <button 
              onClick={onClose}
              className="rounded-md bg-transparent text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="px-6 py-4">
            {/* Progress Steps */}
            <div className="flex items-center mb-6 w-full">
              <div className={`flex-1 h-1 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              } mx-1`}>
                1
              </div>
              <div className={`flex-1 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              } mx-1`}>
                2
              </div>
              <div className={`flex-1 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              } mx-1`}>
                3
              </div>
              <div className={`flex-1 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            </div>

            {step === 1 && (
              <>
                <h4 className="text-md font-medium mb-4">Selecciona los artículos para ordenar</h4>
                <div className="max-h-96 overflow-y-auto border border-border rounded-md mb-4">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="p-2 text-left w-12">
                          <input 
                            type="checkbox" 
                            className="rounded border-border"
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Crear un mapa de IDs ya seleccionados para buscar duplicados más rápido
                                const selectedIds = new Set(selectedItems.map(item => item.id));
                                
                                // Seleccionar todos los artículos que no estén ya seleccionados
                                const itemsToAdd = lowStockItems
                                  .filter(item => !selectedIds.has(item.id))
                                  .map(item => {
                                    const orderQty = item.reorderPoint - item.currentStock + 5;
                                    return {
                                      id: item.id,
                                      itemCode: item.itemCode,
                                      name: item.name || '',
                                      description: item.description,
                                      supplier: item.supplier?.name,
                                      currentStock: item.currentStock,
                                      reorderPoint: item.reorderPoint,
                                      unit: item.unit,
                                      unitCost: item.unitCost || 0,
                                      orderQty: orderQty > 0 ? orderQty : 5,
                                      subtotal: (item.unitCost || 0) * (orderQty > 0 ? orderQty : 5)
                                    };
                                  });
                                
                                if (itemsToAdd.length > 0) {
                                  setSelectedItems([...selectedItems, ...itemsToAdd]);
                                }
                              } else {
                                setSelectedItems([]);
                              }
                            }}
                            checked={selectedItems.length === lowStockItems.length && lowStockItems.length > 0}
                          />
                        </th>
                        <th className="p-2 text-left">Código</th>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 text-left">Stock</th>
                        <th className="p-2 text-left">Proveedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-muted-foreground">
                            No hay artículos con stock bajo disponibles
                          </td>
                        </tr>
                      ) : (
                        lowStockItems.map((item) => (
                          <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                            <td className="p-2">
                              <input 
                                type="checkbox" 
                                className="rounded border-border"
                                checked={selectedItems.some(selectedItem => selectedItem.id === item.id)} 
                                onChange={(e) => handleItemSelectionChange(item, e.target.checked)}
                              />
                            </td>
                            <td className="p-2 font-mono text-sm">{item.itemCode}</td>
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.description}</td>
                            <td className="p-2">
                              <span className={
                                item.currentStock === 0 ? "text-error" : 
                                item.currentStock <= item.reorderPoint ? "text-warning" : ""
                              }>
                                {item.currentStock} / {item.reorderPoint} {item.unit}
                              </span>
                            </td>
                            <td className="p-2">{item.supplier?.name}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {selectedItems.length > 0 && (
                  <div className="text-sm text-muted-foreground mb-4">
                    {selectedItems.length} artículo(s) seleccionado(s)
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <h4 className="text-md font-medium mb-4">Detalles de los artículos</h4>
                <div className="max-h-96 overflow-y-auto border border-border rounded-md mb-4">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="p-2 text-left">Código</th>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Descripción</th>
                        <th className="p-2 text-left">Precio</th>
                        <th className="p-2 text-left">Cantidad</th>
                        <th className="p-2 text-left">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                          <td className="p-2 font-mono text-sm">{item.itemCode}</td>
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                className="w-24 text-right"
                                placeholder="0.00"
                              />
                              <span className="ml-1 text-xs text-muted-foreground">MXN</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="1"
                                value={item.orderQty}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                className="w-20"
                              />
                              <span className="ml-1">{item.unit}</span>
                            </div>
                          </td>
                          <td className="p-2 font-medium">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mb-4">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">
                      Total de la orden:
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h4 className="text-md font-medium mb-4">Información de la orden</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proveedor *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Nombre del proveedor"
                      value={orderDetails.supplier}
                      onChange={(e) => handleDetailChange('supplier', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={orderDetails.priority}
                      onChange={(e) => handleDetailChange('priority', e.target.value)}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referencia / No. de orden
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Número de referencia"
                      value={orderDetails.reference}
                      onChange={(e) => handleDetailChange('reference', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Términos de pago
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={orderDetails.paymentTerms}
                      onChange={(e) => handleDetailChange('paymentTerms', e.target.value)}
                    >
                      {paymentTermsOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows="3"
                    placeholder="Instrucciones o comentarios adicionales"
                    value={orderDetails.notes}
                    onChange={(e) => handleDetailChange('notes', e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-border mr-2"
                      checked={orderDetails.urgent}
                      onChange={(e) => handleDetailChange('urgent', e.target.checked)}
                    />
                    <span className="text-sm font-medium">Marcar como urgente</span>
                  </label>
                </div>
                
                <div className="bg-muted p-4 rounded-md mb-4">
                  <h5 className="font-medium mb-2">Resumen</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Artículos:</span> {selectedItems.length}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Proveedor:</span> {orderDetails.supplier || 'No especificado'}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Prioridad:</span> {priorityOptions.find(p => p.value === orderDetails.priority)?.label || 'Normal'}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total:</span> {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-muted px-6 py-4 flex justify-between border-t border-border">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                iconName="ArrowLeft"
                iconSize={16}
              >
                Anterior
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                variant="default"
                onClick={handleNextStep}
                iconName="ArrowRight"
                iconSize={16}
                disabled={step === 1 && selectedItems.length === 0}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSubmit}
                iconName="Check"
                iconSize={16}
                disabled={!orderDetails.supplier}
              >
                Crear Orden
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePOModal;