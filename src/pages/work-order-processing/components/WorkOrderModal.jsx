import React, { useState, useEffect } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { Checkbox } from "../../../components/ui/Checkbox";
import useOperac from "../../../hooks/useOperac";
import useClient from "../../../hooks/useClient";
import usePerson from "../../../hooks/usePerson";

const WorkOrderModal = ({ isOpen, onClose, workOrder, mode = "edit", onSaveSuccess }) => {
  const { createWorkOrder, updateWorkOrder } = useOperac();
  const { clients, getClients, loading: loadingClients, error: errorClients } = useClient();
  const { getPersonsByDepartment, departmentPersons, loading: loadingPersons } = usePerson();

  const isViewMode = mode === "view";

  const [formData, setFormData] = useState({
    assignedTechnician: "",
    priority: "Media",
    status: "Pendiente",
    dueDate: "",
    notes: "",
    requiredPPE: [],
    medicalRequirements: false,
    client: "",
    type: "",
  });

  // 🔹 Cargar clientes y técnicos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      getClients();
      // Cargar empleados de Taller y Mantenimiento
      getPersonsByDepartment("Taller,Mantenimiento");
    }
  }, [isOpen]);

  // 🔹 Cargar datos si existe una orden
  useEffect(() => {
    if (workOrder) {
      setFormData({
        assignedTechnician: workOrder.tecnicoAsignado || "",
        priority: workOrder.prioridad || "Media",
        status: workOrder.estado || "Pendiente",
        dueDate: workOrder.fechaLimite || "",
        notes: workOrder.notasAdicionales || "",
        requiredPPE: [
          ...(workOrder.cascoSeguridad ? ["Casco de Seguridad"] : []),
          ...(workOrder.gafasProteccion ? ["Gafas de Protección"] : []),
          ...(workOrder.guantesTrabajo ? ["Guantes de Trabajo"] : []),
          ...(workOrder.calzadoSeguridad ? ["Calzado de Seguridad"] : []),
          ...(workOrder.arnesSeguridad ? ["Arnés de Seguridad"] : []),
          ...(workOrder.respiradorN95 ? ["Respirador N95"] : []),
          ...(workOrder.chalecoReflectivo ? ["Chaleco Reflectivo"] : []),
        ],
        medicalRequirements: workOrder.requiereEstudiosMedicosActualizados || false,
        client: workOrder.cliente || "",
        type: workOrder.tipo || "",
      });
    }
  }, [workOrder, isOpen]);

  const priorityOptions = [
    { value: "Crítica", label: "Crítica" },
    { value: "Alta", label: "Alta" },
    { value: "Media", label: "Media" },
    { value: "Baja", label: "Baja" },
  ];

  const statusOptions = [
    { value: "Pendiente", label: "Pendiente" },
    { value: "En Progreso", label: "En Progreso" },
    { value: "En Pausa", label: "En Pausa" },
    { value: "Completada", label: "Completada" },
    { value: "Cancelada", label: "Cancelada" },
  ];

  const ppeOptions = [
    "Casco de Seguridad",
    "Gafas de Protección",
    "Guantes de Trabajo",
    "Calzado de Seguridad",
    "Arnés de Seguridad",
    "Respirador N95",
    "Chaleco Reflectivo",
  ];

  const handleInputChange = (field, value) => {
    if (isViewMode) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePPEChange = (item, checked) => {
    if (isViewMode) return;
    setFormData((prev) => ({
      ...prev,
      requiredPPE: checked
        ? [...prev.requiredPPE, item]
        : prev.requiredPPE.filter((ppe) => ppe !== item),
    }));
  };

  const handleSave = async () => {
    const payload = {
      tecnicoAsignado: formData.assignedTechnician,
      prioridad: formData.priority,
      estado: formData.status,
      fechaLimite: formData.dueDate,
      notasAdicionales: formData.notes,
      cascoSeguridad: formData.requiredPPE.includes("Casco de Seguridad"),
      gafasProteccion: formData.requiredPPE.includes("Gafas de Protección"),
      guantesTrabajo: formData.requiredPPE.includes("Guantes de Trabajo"),
      calzadoSeguridad: formData.requiredPPE.includes("Calzado de Seguridad"),
      arnesSeguridad: formData.requiredPPE.includes("Arnés de Seguridad"),
      respiradorN95: formData.requiredPPE.includes("Respirador N95"),
      chalecoReflectivo: formData.requiredPPE.includes("Chaleco Reflectivo"),
      requiereEstudiosMedicosActualizados: formData.medicalRequirements,
      cliente: formData.client,
      tipo: formData.type,
    };

    try {
      let savedOrder;
      if (workOrder?.id) {
        savedOrder = await updateWorkOrder(workOrder.id, payload);
      } else {
        savedOrder = await createWorkOrder(payload);
      }

      onClose();
      if (onSaveSuccess) {
        onSaveSuccess(savedOrder || { ...payload, id: workOrder?.id || Date.now() });
      }
    } catch (error) {
      console.error("❌ Error al guardar:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {isViewMode
              ? "Detalles de Orden de Trabajo"
              : workOrder
              ? "Orden de Trabajo"
              : "Nueva Orden de Trabajo"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-6">
          {/* Asignación y estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Técnico Asignado"
              options={
                Array.isArray(departmentPersons)
                  ? departmentPersons.map((p) => ({
                      value: p.nombreCompleto,
                      label: `${p.nombreCompleto} - ${p.departamento || ""}`,
                    }))
                  : []
              }
              value={formData.assignedTechnician}
              onChange={(value) => handleInputChange("assignedTechnician", value)}
              disabled={isViewMode}
              placeholder={
                loadingPersons
                  ? "Cargando técnicos..."
                  : departmentPersons.length === 0
                  ? "No hay técnicos disponibles"
                  : "Selecciona un técnico"
              }
              loading={loadingPersons}
            />

            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData.priority}
              onChange={(value) => handleInputChange("priority", value)}
              disabled={isViewMode}
            />

            <Select
              label="Estado"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => handleInputChange("status", value)}
              disabled={isViewMode}
            />

            <Input
              label="Fecha Límite"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              disabled={isViewMode}
            />
          </div>

          {/* Cliente y tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Cliente <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.client}
                onChange={(value) => handleInputChange("client", value)}
                options={
                  Array.isArray(clients) && clients.length > 0
                    ? clients.map((c) => ({
                        value: c.id || c._id,
                        label: c.companyName || c.empresa || c.nombre || "Sin nombre",
                      }))
                    : []
                }
                placeholder={
                  loadingClients
                    ? "Cargando clientes..."
                    : clients.length === 0
                    ? "No hay clientes registrados"
                    : "Selecciona un cliente"
                }
                loading={loadingClients}
                disabled={isViewMode}
                error={errorClients ? "Error al cargar clientes" : ""}
                searchable
              />
              {errorClients && (
                <p className="text-xs text-destructive">Error al cargar clientes</p>
              )}
            </div>

            <Input
              label="Tipo"
              placeholder="Ej. Mantenimiento Preventivo"
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              disabled={isViewMode}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notas Adicionales
            </label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              disabled={isViewMode}
            />
          </div>

          {/* PPE */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              PPE Requerido
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ppeOptions.map((item) => (
                <Checkbox
                  key={item}
                  label={item}
                  checked={formData.requiredPPE.includes(item)}
                  onChange={(e) => handlePPEChange(item, e.target.checked)}
                  disabled={isViewMode}
                />
              ))}
            </div>
          </div>

          {/* Estudios Médicos */}
          <div className="bg-muted/30 rounded-lg p-4">
            <Checkbox
              label="Requiere Estudios Médicos"
              checked={formData.medicalRequirements}
              onChange={(e) => handleInputChange("medicalRequirements", e.target.checked)}
              disabled={isViewMode}
            />
          </div>
        </div>

        {/* Footer */}
        {!isViewMode && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="default" onClick={handleSave} iconName="Save" iconSize={16}>
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderModal;
