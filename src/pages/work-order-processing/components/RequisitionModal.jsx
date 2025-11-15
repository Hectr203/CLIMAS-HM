import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import useRequisi from "../../../hooks/useRequisi";
import useOperac from "../../../hooks/useOperac";
import useInventory from "../../../hooks/useInventory";

const RequisitionModal = ({ isOpen, onClose, requisition, onSave }) => {
  const { createRequisition, updateRequisition, getRequisitionById } = useRequisi();
  const { oportunities, getOportunities } = useOperac();
  const { articulos, getArticulos } = useInventory();

  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
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
    manualItems: [],
    justification: "",
    notes: "",
  });

  const [newItem, setNewItem] = useState({
    idArticulo: "",
    codigoArticulo: "",
    name: "",
    quantity: "",
    unit: "unidades",
    description: "",
    urgency: "Normal",
  });

  const [newManualItem, setNewManualItem] = useState({
    name: "",
    quantity: "",
    unit: "unidades",
    description: "",
    urgency: "Normal",
  });

  useEffect(() => {
    if (requisition) {
      setFormData({
        requestNumber: requisition?.requestNumber || "",
        orderNumber: requisition?.orderNumber || "",
        projectName: requisition?.projectName || "",
        requestedBy: requisition?.requestedBy === "Usuario Actual" ? "" : requisition?.requestedBy || "",
        requestDate:
          requisition?.requestDate || new Date().toISOString().split("T")[0],
        status: requisition?.status || "Pendiente",
        priority: requisition?.priority || "Media",
        description: requisition?.description || "",
        items: requisition?.items || [],
        manualItems: requisition?.manualItems || [],
        justification: requisition?.justification || "",
        notes: requisition?.notes || "",
      });
    } else {
      // Reset form for new requisition
      const currentDate = new Date()?.toISOString()?.split('T')?.[0];
      setFormData({
        requestNumber: `REQ-${Date.now()}`,
        orderNumber: "",
        projectName: "",
        requestedBy: "",
        requestDate: currentDate,
        status: 'Pendiente',
        priority: 'Media',
        description: '',
        items: [],
        manualItems: [],
        justification: "",
        notes: "",
      });
    }
  }, [requisition, isOpen]);

  useEffect(() => {
    if (isOpen) {
      getOportunities();
      getArticulos();
    }
  }, [isOpen]);

  // Cargar materiales cuando se abre una requisición existente
  useEffect(() => {
    async function fetchMateriales() {
      // Limpiar datos anteriores
      setFormData(prev => ({
        ...prev,
        items: [],
        manualItems: []
      }));

      if (!requisition?.id) return;

      setLoadingMaterials(true);
      try {
        const requisicionCompleta = await getRequisitionById(requisition.id);
        
        if (requisicionCompleta) {
          // Cargar materiales del inventario (con referencia)
          if (requisicionCompleta.materiales && Array.isArray(requisicionCompleta.materiales)) {
            const materialesInventario = requisicionCompleta.materiales.map(mat => ({
              id: mat.id || Date.now() + Math.random(),
              idArticulo: mat.id || mat.idArticulo || '',
              codigoArticulo: mat.codigoArticulo || '',
              name: mat.nombreMaterial || mat.nombre || mat.name || '',
              quantity: mat.cantidad || mat.quantity || 0,
              unit: mat.unidad || mat.unit || 'unidades',
              urgency: mat.urgencia || mat.urgency || 'Normal',
              description: mat.descripcionEspecificaciones || mat.descripcion || mat.description || ''
            }));
            
            setFormData(prev => ({
              ...prev,
              items: materialesInventario
            }));
          }

          // Cargar materiales manuales
          if (requisicionCompleta.materialesManuales && Array.isArray(requisicionCompleta.materialesManuales)) {
            const materialesManuales = requisicionCompleta.materialesManuales.map(mat => ({
              id: Date.now() + Math.random(),
              name: mat.nombreMaterial || mat.nombre || mat.name || '',
              quantity: mat.cantidad || mat.quantity || 0,
              unit: mat.unidad || mat.unit || 'unidades',
              urgency: mat.urgencia || mat.urgency || 'Normal',
              description: mat.descripcionEspecificaciones || mat.descripcion || mat.description || ''
            }));
            
            setFormData(prev => ({
              ...prev,
              manualItems: materialesManuales
            }));
          }
        }
      } catch (error) {
        console.error('Error al cargar materiales de la requisición:', error);
      } finally {
        setLoadingMaterials(false);
      }
    }

    fetchMateriales();
  }, [requisition?.id, isOpen]);

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

  // Filtrar artículos por búsqueda
  const filteredArticulos = articulos?.filter(art => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      art.nombre?.toLowerCase().includes(search) ||
      art.codigoArticulo?.toLowerCase().includes(search) ||
      art.categoria?.toLowerCase().includes(search) ||
      art.marca?.toLowerCase().includes(search)
    );
  }) || [];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewManualItemChange = (field, value) => {
    setNewManualItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddItem = () => {
    if (newItem?.name && newItem?.quantity) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem, id: Date.now() }],
      }));
      setNewItem({
        idArticulo: "",
        codigoArticulo: "",
        name: "",
        quantity: "",
        unit: "unidades",
        description: "",
        urgency: "Normal",
      });
    }
  };

  const handleAddManualItem = () => {
    if (newManualItem?.name && newManualItem?.quantity) {
      setFormData((prev) => ({
        ...prev,
        manualItems: [...prev.manualItems, { ...newManualItem, id: Date.now() }],
      }));
      setNewManualItem({
        name: "",
        quantity: "",
        unit: "unidades",
        description: "",
        urgency: "Normal",
      });
    }
  };

  const handleSelectInventoryItem = (articulo) => {
    setNewItem({
      idArticulo: articulo.id,
      codigoArticulo: articulo.codigoArticulo || '',
      name: articulo.nombre || '',
      quantity: '',
      unit: articulo.unidad || 'unidades',
      description: '',
      urgency: 'Normal'
    });
    setShowInventoryModal(false);
    setSearchTerm('');
  };

  const handleRemoveItem = (itemId, type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== itemId),
    }));
  };

  const handleSave = async () => {
  try {
    // Formatear fecha a dd/MM/yyyy
    const fecha = new Date(formData.requestDate);
    const formattedDate = `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${fecha.getFullYear()}`;

    // Construir materiales de inventario
    const materiales = formData.items.map((item) => ({
      id: item.idArticulo || undefined, // para que el backend lo identifique como referencia
      codigoArticulo: item.codigoArticulo || "",
      nombreMaterial: item.name || "",
      cantidad: Number(item.quantity) || 0,
      unidad:
        item.unit?.charAt(0).toUpperCase() + item.unit?.slice(1).toLowerCase() || "Unidades",
      urgencia: item.urgency || "Normal",
      descripcionEspecificaciones: item.description || "",
    }));

    // Construir materiales manuales
    const materialesManuales = formData.manualItems.map((item) => ({
      nombreMaterial: item.name || "",
      cantidad: Number(item.quantity) || 0,
      unidad:
        item.unit?.charAt(0).toUpperCase() + item.unit?.slice(1).toLowerCase() || "Unidades",
      urgencia: item.urgency || "Normal",
      descripcionEspecificaciones: item.description || "",
    }));

    // Payload final
    const payload = {
      numeroOrdenTrabajo: formData.orderNumber,
      nombreProyecto: formData.projectName,
      solicitadoPor: formData.requestedBy,
      fechaSolicitud: formattedDate,
      prioridad: formData.priority,
      estado: formData.status,
      descripcionSolicitud: formData.description,
      materiales, // <-- inventario
      materialesManuales, // <-- manuales
      justificacionSolicitud: formData.justification || "",
      notasAdicionales: formData.notes || "",
      proyectoNombre: formData.projectName,
    };

    // 🔍 DEBUG: Verificar payload antes de enviar
    console.log('=== PAYLOAD A ENVIAR ===');
    console.log('Materiales inventario:', materiales);
    console.log('Materiales manuales:', materialesManuales);
    console.log('Payload completo:', JSON.stringify(payload, null, 2));
    console.log('materialesManuales en payload:', payload.materialesManuales);
    console.log('Cantidad de materiales manuales:', materialesManuales.length);

    // Enviar
    let response;
    if (requisition?.id) {
      response = await updateRequisition(requisition.id, payload);
    } else {
      response = await createRequisition(payload);
    }

    // 🔍 DEBUG: Verificar respuesta del backend
    console.log('=== RESPUESTA DEL BACKEND ===');
    console.log('Response completa:', response);
    console.log('Materiales guardados:', response?.materiales);
    console.log('Materiales manuales guardados:', response?.materialesManuales);

    if (response) {
      onSave(response);
      onClose();
    }
  } catch (error) {
    console.error(" Error al guardar la requisición:", error);
  }
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
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
  label="Número de Orden de Trabajo"
  options={
    oportunities?.map((op) => ({
      label: op.ordenTrabajo,
      value: op.ordenTrabajo,
    })) || []
  }
  value={formData?.orderNumber}
  onChange={(value) => {
    handleInputChange("orderNumber", value);

    // Buscar la oportunidad seleccionada
    const selected = oportunities.find((op) => op.ordenTrabajo === value);
    if (selected) {
      // Llenar automáticamente el nombre del proyecto
      handleInputChange("projectName", selected.proyectoNombre || "");
    }
  }}
  required
/>


            <Input
  label="Nombre del Proyecto"
  placeholder="Nombre del proyecto"
  value={formData?.projectName}
  readOnly
  className="bg-gray-100 cursor-not-allowed"
  required
/>

            <Input
  label="Solicitado por"
  placeholder="Usuario Actual"
  value={formData?.requestedBy}
  onChange={(e) => handleInputChange("requestedBy", e?.target?.value)}
  required
/>

            <Input
              label="Fecha de Solicitud"
              type="date"
              value={formData?.requestDate}
              onChange={(e) => handleInputChange("requestDate", e?.target?.value)}
              required
            />

            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData?.priority}
              onChange={(value) => handleInputChange("priority", value)}
              required
            />

            <Select
              label="Estado"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange("status", value)}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción de la Solicitud
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
              rows={3}
              placeholder="Describe el propósito de esta requisición..."
              value={formData?.description}
              onChange={(e) => handleInputChange("description", e?.target?.value)}
            />
          </div>

          {/* Material por Inventario */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Agregar Material del Inventario
            </h4>
            
            {/* Botón para abrir selector de inventario */}
            <div className="mb-3">
              <Button
                variant="outline"
                onClick={() => setShowInventoryModal(true)}
                iconName="Package"
                iconSize={16}
                className="w-full"
              >
                Buscar en Inventario
              </Button>
            </div>

            {/* Material seleccionado */}
            {newItem.name && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Material Seleccionado
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewItem({
                      idArticulo: "",
                      codigoArticulo: "",
                      name: "",
                      quantity: "",
                      unit: "unidades",
                      description: "",
                      urgency: "Normal",
                    })}
                    iconName="X"
                    iconSize={14}
                  />
                </div>
                <p className="text-sm text-blue-800 font-medium">{newItem.name}</p>
                {newItem.codigoArticulo && (
                  <p className="text-xs text-blue-600">Código: {newItem.codigoArticulo}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
  label="Cantidad"
  type="number"
  placeholder="1"
  value={newItem?.quantity}
  onChange={(e) => {
    const value = Number(e?.target?.value);
    if (value > 0) handleNewItemChange("quantity", value);
  }}
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

            <Input
              label="Descripción/Especificaciones"
              placeholder="Especificaciones técnicas..."
              value={newItem?.description}
              onChange={(e) =>
                handleNewItemChange("description", e?.target?.value)
              }
            />

            <Button
              variant="outline"
              onClick={handleAddItem}
              iconName="Plus"
              iconSize={16}
              disabled={!newItem?.name || !newItem?.quantity}
              className="mt-3"
            >
              Agregar Material
            </Button>
          </div>

          {/* Modal de búsqueda de inventario */}
          {showInventoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
              <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground">
                    Seleccionar Material del Inventario
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowInventoryModal(false);
                      setSearchTerm('');
                    }}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>

                <div className="p-4 border-b border-border">
                  <Input
                    placeholder="Buscar por nombre, código, categoría o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon="Search"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {filteredArticulos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="Package" size={48} className="mx-auto mb-3 opacity-30" />
                      <p>No se encontraron materiales</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredArticulos.map((articulo) => (
                        <div
                          key={articulo.id}
                          className="border border-border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleSelectInventoryItem(articulo)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-foreground mb-1">
                                {articulo.nombre}
                              </h4>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {articulo.codigoArticulo && (
                                  <span className="bg-muted px-2 py-1 rounded">
                                    Código: {articulo.codigoArticulo}
                                  </span>
                                )}
                                {articulo.categoria && (
                                  <span className="bg-muted px-2 py-1 rounded">
                                    {articulo.categoria}
                                  </span>
                                )}
                                {articulo.marca && (
                                  <span className="bg-muted px-2 py-1 rounded">
                                    {articulo.marca}
                                  </span>
                                )}
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Stock: {articulo.cantidad || 0} {articulo.unidad || 'unidades'}
                                </span>
                              </div>
                            </div>
                            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Material Manual */}
          <div className="bg-muted/30 rounded-lg p-4 mt-6">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Agregar Material Manualmente
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              <Input
                label="Nombre del Material"
                placeholder="Ej. Tornillos, Pintura, etc."
                value={newManualItem?.name}
                onChange={(e) =>
                  handleNewManualItemChange("name", e?.target?.value)
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
  label="Cantidad"
  type="number"
  placeholder="1"
  value={newManualItem?.quantity}
  onChange={(e) => {
    const value = Number(e?.target?.value);
    if (value > 0) handleNewManualItemChange("quantity", value);
  }}
/>
                <Select
                  label="Unidad"
                  options={unitOptions}
                  value={newManualItem?.unit}
                  onChange={(value) =>
                    handleNewManualItemChange("unit", value)
                  }
                />
              </div>

              <Select
                label="Urgencia"
                options={urgencyOptions}
                value={newManualItem?.urgency}
                onChange={(value) =>
                  handleNewManualItemChange("urgency", value)
                }
              />
            </div>

            <Input
              label="Descripción/Especificaciones"
              placeholder="Detalles o especificaciones..."
              value={newManualItem?.description}
              onChange={(e) =>
                handleNewManualItemChange("description", e?.target?.value)
              }
            />

            <Button
              variant="outline"
              onClick={handleAddManualItem}
              iconName="Plus"
              iconSize={16}
              disabled={!newManualItem?.name || !newManualItem?.quantity}
              className="mt-3"
            >
              Agregar Material
            </Button>
          </div>

          {/* Lista de materiales */}
          {loadingMaterials ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Cargando materiales...</span>
            </div>
          ) : (formData.items.length > 0 || formData.manualItems.length > 0) && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Materiales Solicitados</h4>
              <div className="space-y-2">
                {[...formData.items, ...formData.manualItems].map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="text-sm font-medium text-foreground">
                            {item?.nombreMaterial || item?.name}
                          </h5>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item?.urgency === "Urgente"
                                ? "bg-red-100 text-red-800"
                                : item?.urgency === "Normal"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
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
                        onClick={() =>
                          handleRemoveItem(
                            item.id,
                            formData.items.some((i) => i.id === item.id)
                              ? "items"
                              : "manualItems"
                          )
                        }
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
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
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
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
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
  type="button"
  onClick={handleSave}
  className="bg-blue-600 hover:bg-blue-700 text-white"
  disabled={!formData?.projectName}
>
  {requisition?.id ? "Guardar Cambios" : "Crear Requisición"}
</Button>

        </div>
      </div>
    </div>
  );
};

export default RequisitionModal;