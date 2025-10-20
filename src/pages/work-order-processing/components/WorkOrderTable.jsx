import React, { useState, useEffect, useMemo } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import useOperac from "../../../hooks/useOperac";
import WorkOrderModal from "../components/WorkOrderModal";

const WorkOrderTable = ({ workOrders, onStatusUpdate, onAssignTechnician, onViewDetails, onEditOrder, loading, error }) => {
  const { oportunities, getOportunities } = useOperac();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: "prioridad", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Si no se pasaron datos desde arriba, los carga con el hook
    if (!workOrders?.length) {
      getOportunities();
    }
  }, []);

  // 🔹 Usar las órdenes filtradas si existen, o las del hook si no
  const dataSource = useMemo(() => workOrders?.length ? workOrders : (oportunities || []), [workOrders, oportunities]);


  const sortedOrders = useMemo(() => {
    const sorted = [...dataSource];
    if (!sortConfig.key) return sorted;
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [dataSource, sortConfig]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedData = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const toggleRowExpansion = (orderId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) newExpanded.delete(orderId);
    else newExpanded.add(orderId);
    setExpandedRows(newExpanded);
  };

  // Modal handlers
  const handleView = (order) => {
    setSelectedOrder(order);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Crítica": return "bg-red-100 text-red-800";
      case "Alta": return "bg-orange-100 text-orange-800";
      case "Media": return "bg-yellow-100 text-yellow-800";
      case "Baja": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pendiente": return "bg-yellow-100 text-yellow-800";
      case "En Progreso": return "bg-blue-100 text-blue-800";
      case "Completada": return "bg-green-100 text-green-800";
      case "En Pausa": return "bg-orange-100 text-orange-800";
      case "Cancelada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-all"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <Icon
          name={
            sortConfig.key === sortKey
              ? sortConfig.direction === "asc"
                ? "ChevronUp"
                : "ChevronDown"
              : "ChevronsUpDown"
          }
          size={14}
        />
      </div>
    </th>
  );

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <Icon name="Loader2" className="animate-spin mr-2" size={18} />
        <span className="text-muted-foreground">Cargando órdenes de trabajo...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-error">
        <Icon name="AlertCircle" className="inline-block mr-2" size={18} />
        Error al cargar los datos: {error.message}
      </div>
    );

  if (!sortedOrders?.length)
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Icon name="ClipboardX" className="inline-block mr-2" size={18} />
        No hay órdenes registradas.
      </div>
    );

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <SortableHeader label="Técnico Asignado" sortKey="tecnicoAsignado" />
              <SortableHeader label="Prioridad" sortKey="prioridad" />
              <SortableHeader label="Estado" sortKey="estado" />
              <SortableHeader label="Fecha Límite" sortKey="fechaLimite" />
              <SortableHeader label="Cliente" sortKey="cliente" />
              <SortableHeader label="Tipo Proyecto" sortKey="tipo" />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Notas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-card divide-y divide-border">
            {paginatedData.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(order.id)}
                        className="w-6 h-6"
                      >
                        <Icon
                          name={expandedRows.has(order.id) ? "ChevronDown" : "ChevronRight"}
                          size={16}
                        />
                      </Button>
                      <div>{order.tecnicoAsignado}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.prioridad)}`}>
                      {order.prioridad}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.estado)}`}>
                      {order.estado}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.fechaLimite}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.cliente || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.tipo || "—"}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {order.notasAdicionales || "-"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        iconSize={16}
                        onClick={() => handleView(order)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Edit"
                        iconSize={16}
                        onClick={() => handleEdit(order)}
                      >
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>

                {expandedRows.has(order.id) && (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 bg-muted/30">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Equipo de Protección Personal</h4>
                        <ul className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            { key: "cascoSeguridad", label: "Casco de Seguridad" },
                            { key: "gafasProteccion", label: "Gafas de Protección" },
                            { key: "guantesTrabajo", label: "Guantes de Trabajo" },
                            { key: "calzadoSeguridad", label: "Calzado de Seguridad" },
                            { key: "arnesSeguridad", label: "Arnés de Seguridad" },
                            { key: "respiradorN95", label: "Respirador N95" },
                            { key: "chalecoReflectivo", label: "Chaleco Reflectivo" },
                          ].map(({ key, label }) => (
                            <li key={key} className="flex items-center space-x-2">
                              <Icon name={order[key] ? "CheckCircle" : "XCircle"} size={14} />
                              <span>{label}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm text-muted-foreground">
                          <strong>Requiere estudios médicos actualizados:</strong>{" "}
                          {order.requiereEstudiosMedicosActualizados ? "Sí" : "No"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {isModalOpen && (
  <WorkOrderModal
    isOpen={isModalOpen}
    onClose={handleCloseModal}
    workOrder={selectedOrder}
    mode={modalMode}
    onSaveSuccess={(updatedOrder) => {
      if (onEditOrder) {
        onEditOrder(updatedOrder);
      }
      handleCloseModal();
    }}
  />
)}

      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <Icon name="ChevronLeft" size={14} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <Icon name="ChevronRight" size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkOrderTable;
