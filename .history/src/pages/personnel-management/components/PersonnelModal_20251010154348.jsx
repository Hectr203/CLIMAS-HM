import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { Checkbox } from "../../../components/ui/Checkbox";
import usePerson from "../../../hooks/usePerson"; // 👈 Importa tu hook personalizado

const PersonnelModal = ({ isOpen, onClose, employee, mode, onSave }) => {
  const { createPerson, editPerson, loading } = usePerson(); // 👈 usamos tu hook

  const [formData, setFormData] = useState(
    employee || {
      name: "",
      employeeId: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      hireDate: "",
      status: "Activo",
      medicalStudies: {
        lastExam: "",
        nextExam: "",
        status: "Pendiente",
        documents: [],
      },
      ppe: {
        helmet: false,
        vest: false,
        boots: false,
        gloves: false,
        glasses: false,
        mask: false,
      },
      certifications: [],
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    }
  );

  const [activeTab, setActiveTab] = useState("general");
  if (!isOpen) return null;

  // === Opciones de selects ===
  const departmentOptions = [
    { value: "Administración", label: "Administración" },
    { value: "Proyectos", label: "Proyectos" },
    { value: "Taller", label: "Taller" },
    { value: "Ventas", label: "Ventas" },
    { value: "Mantenimiento", label: "Mantenimiento" },
  ];

  const positionOptions = [
    { value: "Técnico HVAC", label: "Técnico HVAC" },
    { value: "Supervisor", label: "Supervisor" },
    { value: "Ingeniero", label: "Ingeniero" },
    { value: "Administrador", label: "Administrador" },
    { value: "Vendedor", label: "Vendedor" },
    { value: "Operario", label: "Operario" },
  ];

  const statusOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
    { value: "Suspendido", label: "Suspendido" },
  ];

  const medicalStatusOptions = [
    { value: "Completo", label: "Completo" },
    { value: "Pendiente", label: "Pendiente" },
    { value: "Vencido", label: "Vencido" },
  ];

  const relationshipOptions = [
    { value: "Cónyuge", label: "Cónyuge" },
    { value: "Padre/Madre", label: "Padre/Madre" },
    { value: "Hijo/Hija", label: "Hijo/Hija" },
    { value: "Hermano/Hermana", label: "Hermano/Hermana" },
    { value: "Otro", label: "Otro" },
  ];

  // === Manejo de cambios ===
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePPEChange = (item, checked) => {
    setFormData((prev) => ({
      ...prev,
      ppe: { ...prev.ppe, [item]: checked },
    }));
  };

  // === Guardar empleado ===
  const handleSave = async () => {
    try {
      const payload = {
        nombreCompleto: formData.name,
        empleadoId: formData.employeeId,
        email: formData.email,
        telefono: formData.phone,
        departamento: formData.department,
        puesto: formData.position,
        fechaIngreso: formData.hireDate,
        estado: formData.status,
        activo: true,
      };

      console.log("📦 Enviando datos del empleado:", payload);

      let response;
      if (mode === "create") {
        response = await createPerson(payload);
        alert("✅ Empleado creado exitosamente");
      } else if (mode === "edit" && employee?.id) {
        response = await editPerson(employee.id, payload);
        alert("✅ Cambios guardados correctamente");
      }

      if (onSave) onSave(response);
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar empleado:", error);
      alert("Hubo un error al guardar el empleado. Revisa la consola.");
    }
  };

  // === Tabs ===
  const tabs = [
    { id: "general", label: "Información General", icon: "User" },
    { id: "medical", label: "Estudios Médicos", icon: "Heart" },
    { id: "ppe", label: "EPP", icon: "Shield" },
    { id: "emergency", label: "Contacto de Emergencia", icon: "Phone" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-1050 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon
              name={mode === "create" ? "UserPlus" : mode === "edit" ? "Edit" : "Eye"}
              size={24}
              className="text-primary"
            />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === "create"
                  ? "Nuevo Empleado"
                  : mode === "edit"
                  ? "Editar Empleado"
                  : "Perfil del Empleado"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "create"
                  ? "Agregar nuevo empleado al sistema"
                  : mode === "edit"
                  ? "Modificar información del empleado"
                  : "Ver detalles del empleado"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de tabs (idéntico al tuyo, omitido para no duplicar) */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Aquí va todo el contenido de tabs que ya tenías */}
        </div>

        {/* Footer */}
        {mode !== "view" && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              iconName="Save"
              iconPosition="left"
              iconSize={16}
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : mode === "create"
                ? "Crear Empleado"
                : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelModal;
