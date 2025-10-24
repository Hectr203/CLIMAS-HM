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
    orderNumber: "",
  assignedTechnician: { id: "", nombre: "" },
  priority: "Media",
  status: "Pendiente",
  dueDate: "",
  workDescription: "", 
  additionalNotes: "", 
  requiredPPE: [],
  medicalRequirements: false,
  client: { id: "", nombre: "", contacto: "", email: "", telefono: "" },
  type: "",
});

  const [assignClient, setAssignClient] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getClients();
      getPersonsByDepartment("Taller,Mantenimiento");
    }
  }, [isOpen]);

  useEffect(() => {
  if (workOrder) {
    setFormData({
      orderNumber: workOrder.ordenTrabajo || "",
      assignedTechnician: {
        id: workOrder.tecnicoAsignado?.id || "",
        nombre: workOrder.tecnicoAsignado?.nombre || "",
      },
      priority: workOrder.prioridad || "Media",
      status: workOrder.estado || "Pendiente",
      dueDate: workOrder.fechaLimite || "",
      workDescription: workOrder.descripcion || "",
      additionalNotes: workOrder.notasAdicionales || "",
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
      client: {
  id: workOrder.cliente?.id || "",
  nombre:
    workOrder.cliente?.nombre ||
    workOrder.cliente?.empresa ||
    workOrder.cliente?.companyName ||
    "",
  contacto: workOrder.cliente?.contacto || "",
  email: workOrder.cliente?.email || "",
  telefono: workOrder.cliente?.telefono || "",
},

      type: workOrder.tipo || "",
    });

    // 👇 Activa automáticamente el checkbox de cliente si tiene uno asignado
    setAssignClient(!!workOrder.cliente?.id);
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
  ordenTrabajo: formData.orderNumber,    
  prioridad: formData.priority,
  estado: formData.status,
  fechaLimite: formData.dueDate,
  descripcion: formData.workDescription, 
  notasAdicionales: formData.additionalNotes, 
  cascoSeguridad: formData.requiredPPE.includes("Casco de Seguridad"),
  gafasProteccion: formData.requiredPPE.includes("Gafas de Protección"),
  guantesTrabajo: formData.requiredPPE.includes("Guantes de Trabajo"),
  calzadoSeguridad: formData.requiredPPE.includes("Calzado de Seguridad"),
  arnesSeguridad: formData.requiredPPE.includes("Arnés de Seguridad"),
  respiradorN95: formData.requiredPPE.includes("Respirador N95"),
  chalecoReflectivo: formData.requiredPPE.includes("Chaleco Reflectivo"),
  requiereEstudiosMedicosActualizados: formData.medicalRequirements,
  tipo: formData.type,
};

    //Aqui manda a traer los datos correspondientes de cliente
    if (assignClient && formData.client.id) {
      payload.cliente = {
        id: formData.client.id,
        nombre: formData.client.nombre,
      };
    }
    //Aqui manda a traer los datos correspondientes de tecnico
    if (formData.assignedTechnician.id) {
      payload.tecnicoAsignado = {
        id: formData.assignedTechnician.id,
        nombre: formData.assignedTechnician.nombre,
      };
    }

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
          
{/* Número de Orden de Trabajo */}
<div className="mb-4">
  <label className="block text-sm font-medium text-foreground mb-2">
    Número de Orden de Trabajo
  </label>
  <Input
    placeholder="Ej. OT-2025-001"
    value={formData.orderNumber || ""}
    onChange={(e) => handleInputChange("orderNumber", e.target.value)}
    disabled={isViewMode}
  />
</div>


          
          {/* Asignación y estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={
                <>
                  Técnico Asignado <span className="text-red-500">*</span>
                </>
              }
              options={
                Array.isArray(departmentPersons)
                  ? departmentPersons.map((p) => ({
                      value: p.id,
                      label: `${p.nombreCompleto} - ${p.departamento || ""}`,
                      nombre: p.nombreCompleto,
                    }))
                  : []
              }
              value={formData.assignedTechnician.id}
              onChange={(value) => {
                const selected = departmentPersons.find((p) => p.id === value);
                handleInputChange("assignedTechnician", {
                  id: value,
                  nombre: selected?.nombreCompleto || "",
                });
              }}
              disabled={isViewMode}
              placeholder={
                loadingPersons
                  ? "Cargando técnicos..."
                  : departmentPersons.length === 0
                  ? "No hay técnicos disponibles"
                  : "Selecciona un técnico"
              }
            />

            <Select
              label={
                <>
                  Prioridad <span className="text-red-500">*</span>
                </>
              }
              options={priorityOptions}
              value={formData.priority}
              onChange={(value) => handleInputChange("priority", value)}
              disabled={isViewMode}
            />

            <Select
              label={
                <>
                  Estado <span className="text-red-500">*</span>
                </>
              }
              options={statusOptions}
              value={formData.status}
              onChange={(value) => handleInputChange("status", value)}
              disabled={isViewMode}
            />

            <Input
              label={
                <>
                  Fecha Límite <span className="text-red-500">*</span>
                </>
              }
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              disabled={isViewMode}
            />
          </div>

          {/* Descripción de Trabajo */}
<div>
  <label className="block text-sm font-medium text-foreground mb-2">
    Descripción de Trabajo
  </label>
  <textarea
    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
    rows={4}
    value={formData.workDescription || ""}
    onChange={(e) => handleInputChange("workDescription", e.target.value)}
    disabled={isViewMode}
  />
</div>

{/* Notas Adicionales */}
<div>
  <label className="block text-sm font-medium text-foreground mb-2">
    Notas Adicionales
  </label>
  <textarea
    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
    rows={4}
    value={formData.additionalNotes || ""}
    onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
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

          {/* Estudios Médicos + Cliente + Tipo */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <Checkbox
              label="Requiere Estudios Médicos"
              checked={formData.medicalRequirements}
              onChange={(e) => handleInputChange("medicalRequirements", e.target.checked)}
              disabled={isViewMode}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Cliente con checkbox a la izquierda */}
  <div>
    <div className="flex items-center gap-2 mb-2">
      {/* 👇 Checkbox primero */}
      <Checkbox
        checked={assignClient}
        onChange={(e) => setAssignClient(e.target.checked)}
        disabled={isViewMode}
        label="" // sin texto
      />
      <label className="text-sm font-medium text-foreground">Cliente</label>
    </div>

    {assignClient && (
      <Select
  value={formData.client.id}
  onChange={(value) => {
    const selected = clients.find(
      (c) => c.id === value || c._id === value
    );
    handleInputChange("client", {
      id: value,
      nombre:
        selected?.companyName ||
        selected?.empresa ||
        selected?.nombre ||
        "",
      contacto: selected?.contacto || "",
      email: selected?.email || "",
      telefono: selected?.telefono || "",
    });
  }}
  options={
    Array.isArray(clients)
      ? clients.map((c) => ({
          value: c.id || c._id,
          label:
            c.companyName ||
            c.empresa ||
            c.nombre ||
            "Sin nombre",
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
/>

    )}
{assignClient && formData.client.id && (
  <div className="mt-4">
    <div className="relative flex flex-col items-start p-4  border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-all max-w-full overflow-hidden">
      {/* Línea lateral decorativa */}
      <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-l-lg"></div>

      {/* Encabezado con ícono */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
            <Icon name="Building2" className="text-blue-600 w-5 h-5" />
          </div>
          <h4 className="text-base font-semibold text-gray-900">
            {formData.client.nombre || "Cliente sin nombre"}
          </h4>
        </div>

        {/* Botón copiar */}
        <button
          onClick={() => {
            const datos = `
Cliente: ${formData.client.nombre || "No especificado"}
Contacto: ${formData.client.contacto || "No especificado"}
Teléfono: ${formData.client.telefono || "No especificado"}
Email: ${formData.client.email || "No especificado"}
`;
            navigator.clipboard.writeText(datos);
          }}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md shadow-sm transition-all"
        >
          Copiar
        </button>
      </div>

      {/* Información del cliente */}
      <div className="flex flex-col gap-2 text-xs text-gray-700 pl-1">
        <div className="flex items-center gap-2">
          <Icon name="User" className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-700">Contacto:</span>
          <span className="truncate">{formData.client.contacto || "No especificado"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Phone" className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-700">Teléfono:</span>
          <span className="truncate">{formData.client.telefono || "No especificado"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Mail" className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-700">Email:</span>
          <span className="truncate">{formData.client.email || "No especificado"}</span>
        </div>
      </div>
    </div>
  </div>
)}



  </div>

              {/* Tipo */}
              <Select
                label="Tipo"
                value={formData.type}
                onChange={(value) => handleInputChange("type", value)}
                options={[
                  { value: "Instalación", label: "Instalación" },
                  { value: "Mantenimiento Preventivo", label: "Mantenimiento Preventivo" },
                  { value: "Mantenimiento Correctivo", label: "Mantenimiento Correctivo" },
                  { value: "Inspección", label: "Inspección" },
                ]}
                placeholder="Selecciona un tipo de servicio"
                disabled={isViewMode}
              />
            </div>
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
