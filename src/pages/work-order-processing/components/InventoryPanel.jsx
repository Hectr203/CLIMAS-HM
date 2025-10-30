import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useRequisi from '../../../hooks/useRequisi';
import useInventario from '../../../hooks/useInventario';
import RequisitionModal from "../components/RequisitionModal";
import { useNotifications } from '../../../context/NotificationContext';

const InventoryPanel = ({
  onCreatePurchaseOrder,
  onRequestMaterial,
  onCreateRequisition,
  requisitions: externalRequisitions,
  onRequisitionUpdated,
}) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const { showConfirm, showSuccess, showHttpError, showInfo, showOperationSuccess } = useNotifications();
  const { requisitions, loading: loadingRequis, getRequisitions, updateRequisition, deleteRequisition } = useRequisi();
  const { inventario, getInventario, loading: loadingInventario } = useInventario();
  const [localRequisitions, setLocalRequisitions] = useState([]);

  const displayedRequisitions = externalRequisitions?.length > 0 ? externalRequisitions : localRequisitions;

  useEffect(() => { getInventario(); }, []);
  useEffect(() => {
    const fetchRequisitions = async () => {
      const data = await getRequisitions();
      setLocalRequisitions(data);
    };
    fetchRequisitions();
  }, []);

  useEffect(() => {
    if (externalRequisitions?.length > 0) setLocalRequisitions(externalRequisitions);
  }, [externalRequisitions]);

  const getStockStatus = (currentStock, reorderPoint) => {
    if (currentStock <= 0) return 'Crítico';
    if (currentStock <= reorderPoint) return 'Bajo Stock';
    return 'En Stock';
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'Crítico': return 'bg-red-100 text-red-800';
      case 'Bajo Stock': return 'bg-orange-100 text-orange-800';
      case 'En Stock': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Aprobada': return 'bg-green-100 text-green-800';
      case 'Rechazada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (request) => {
    try {
      const updated = await updateRequisition(request.id, { estado: 'Aprobada' });
      if (!updated) return;

      const updatedList = localRequisitions.map((r) =>
        r.id === request.id ? { ...r, estado: 'Aprobada' } : r
      );

      setLocalRequisitions(updatedList);
      onRequisitionUpdated?.(updatedList);
      showOperationSuccess();
    } catch (error) {
      showHttpError(error, "Error al aprobar la requisición");
    }
  };

  const handleReject = async (request) => {
    try {
      const updated = await updateRequisition(request.id, { estado: 'Rechazada' });
      if (!updated) return;

      const updatedList = localRequisitions.map((r) =>
        r.id === request.id ? { ...r, estado: 'Rechazada' } : r
      );

      setLocalRequisitions(updatedList);
      onRequisitionUpdated?.(updatedList);
      showOperationSuccess();
    } catch (error) {
      showHttpError(error, "Error al rechazar la requisición");
    }
  };

  const handleDelete = (request) => {
    showConfirm(`¿Seguro que deseas eliminar la requisición "${request.numeroOrdenTrabajo}"?`, {
      onConfirm: async () => {
        try {
          const success = await deleteRequisition(request.id);
          if (!success) return;

          const updatedList = localRequisitions.filter((r) => r.id !== request.id);
          setLocalRequisitions(updatedList);
          onRequisitionUpdated?.(updatedList);
        } catch (error) {
          showHttpError(error, "Error al eliminar la requisición");
        }
      },
      onCancel: () => showInfo("Eliminación cancelada"),
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  // Mantiene la reactividad y carga materiales manuales e inventario correctamente
  const handleEditRequisition = (req) => {
    const mappedReq = {
      id: req.id,
      orderNumber: req.numeroOrdenTrabajo || "",
      projectName: req.nombreProyecto || "",
      requestedBy: req.solicitadoPor || "",
      requestDate: req.fechaSolicitud
        ? req.fechaSolicitud.split("/").reverse().join("-")
        : new Date().toISOString().split("T")[0],
      status: req.estado || "Pendiente",
      priority: req.prioridad || "Media",
      description: req.descripcionSolicitud || "",
      items:
        req.materiales?.map((m) => ({
          id: Date.now() + Math.random(),
          codigoArticulo: m.codigoArticulo || "",
          name: m.nombreMaterial || "",
          quantity: m.cantidad,
          unit: m.unidad?.toLowerCase() || "unidades",
          urgency: m.urgencia || "Normal",
          description: m.descripcionEspecificaciones || "",
          type: "inventario",
        })) || [],
      manualItems:
        req.materialesManuales?.map((m) => ({
          id: Date.now() + Math.random(),
          name: m.nombreMaterial || "",
          quantity: m.cantidad || 1,
          unit: m.unidad || "pieza",
          urgency: m.urgencia || "Normal",
          description: m.descripcionEspecificaciones || "",
          type: "manual",
        })) || [],
      justification: req.justificacionSolicitud || "",
      notes: req.notasAdicionales || "",
    };

    setSelectedRequisition(mappedReq);
    setIsModalOpen(true);
  };

  const handleSaveRequisition = (updatedReq) => {
    const updatedList = localRequisitions.map((r) =>
      r.id === updatedReq.id ? updatedReq : r
    );
    setLocalRequisitions(updatedList);
    onRequisitionUpdated?.(updatedList);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-[600px]">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="Package" size={16} />
              <span>Inventario</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon name="ClipboardList" size={16} />
              <span>Requisiciones</span>
            </div>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 h-[calc(100%-48px)]">

        {/* INVENTARIO */}
        {activeTab === 'inventory' && (
          <div className="space-y-4 h-full overflow-y-auto">
            {/* ... se mantiene igual ... */}
          </div>
        )}

        {/* REQUISICIONES */}
        {activeTab === 'requests' && (
          <div className="space-y-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Requisiciones de Material</h3>
              <Button variant="default" size="sm" iconName="Plus" iconSize={16} onClick={onCreateRequisition}>
                Nueva Requisición
              </Button>
            </div>

            {loadingRequis ? (
              <p>Cargando requisiciones...</p>
            ) : (
              <div className="space-y-3">
                {displayedRequisitions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay requisiciones disponibles.</p>
                ) : (
                  displayedRequisitions.map((request) => {
                    // Combinar materiales normales + manuales
                    const allMaterials = [
                      ...(request.materiales || []),
                      ...(request.materialesManuales || []),
                    ];

                    return (
                      <div key={request.id} className="border border-border rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground">{request.numeroOrdenTrabajo}</h4>
                            <p className="text-xs text-muted-foreground">{request.nombreProyecto}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequestStatusColor(request.estado)}`}>
                            {request.estado}
                          </span>
                        </div>

                        {/* ✅ Ahora muestra inventario + manuales */}
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">Materiales Solicitados:</p>
                          {allMaterials.length > 0 ? (
                            <ul className="space-y-1">
                              {allMaterials.map((item, index) => (
                                <li key={index} className="text-xs text-foreground flex items-center space-x-2">
                                  <Icon name="Package" size={12} />
                                  <span>
                                    {item.nombreMaterial} - {item.cantidad} {item.unidad}
                                    {request.materialesManuales?.includes(item) && (
                                      <span className="text-[10px] text-muted-foreground ml-1">(Manual)</span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground">No se han agregado materiales aún.</p>
                          )}
                        </div>

                        {/* Controles inferiores */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            <Icon name="User" size={12} className="inline mr-1" />
                            {request.solicitadoPor} • {request.fechaSolicitud}
                          </div>

                          <div className="flex flex-col items-center gap-2 mt-2">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="Edit"
                                iconSize={16}
                                onClick={() => handleEditRequisition(request)}
                                className="p-2 border-gray-300 hover:bg-gray-100"
                                title="Editar"
                              />

                              <Button
                                variant="outline"
                                size="sm"
                                iconName="Trash2"
                                iconSize={16}
                                onClick={() => handleDelete(request)}
                                className="p-2 text-red-600 border-gray-300 hover:bg-red-50"
                                title="Eliminar"
                              />
                            </div>

                            {request.estado === "Pendiente" && (
                              <div className="flex justify-center gap-2 mt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  iconName="X"
                                  iconSize={14}
                                  onClick={() => handleReject(request)}
                                  className="min-w-[100px] text-gray-700 border-gray-400 hover:bg-gray-100"
                                >
                                  Rechazar
                                </Button>

                                <Button
                                  variant="default"
                                  size="sm"
                                  iconName="Check"
                                  iconSize={14}
                                  onClick={() => handleApprove(request)}
                                  className="min-w-[100px]"
                                >
                                  Aprobar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <RequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requisition={selectedRequisition}
        onSave={handleSaveRequisition}
      />
    </div>
  );
};

export default InventoryPanel;
