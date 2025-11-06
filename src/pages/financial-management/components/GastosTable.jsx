// modules/finanzas/GastosTable.jsx
import React, { useEffect, useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import PaymentAuthorizationModal from "./PaymentAuthorizationModal";
import useProyect from "../../../hooks/useProyect";
import useGastos from "../../../hooks/useGastos";
import jsPDF from "jspdf";
import "jspdf-autotable";

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return isNaN(d)
    ? "—"
    : d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount || 0);

const getStatusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pendiente":
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "aprobado":
    case "approved":
      return "text-blue-600 bg-blue-100";
    case "autorizado":
    case "received":
      return "text-green-600 bg-green-100";
    case "rechazado":
    case "cancelled":
      return "text-red-600 bg-red-100";
    case "pagado":
    case "paid":
      return "text-emerald-700 bg-emerald-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const matchesEstado = (estado, tab) => {
  const e = (estado || "").toLowerCase();
  if (tab === "pendiente") return e === "pendiente" || e === "pending";
  if (tab === "aprobado") return e === "aprobado" || e === "approved";
  if (tab === "pagado") return e === "pagado" || e === "paid";
  return false;
};

const GastosTable = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pendiente");

  const { getProyectos } = useProyect();
  const { getGastos, updateGasto } = useGastos();


  useEffect(() => {
    getProyectos().catch(() => {});
  }, [getProyectos]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getGastos();
        console.log("Datos obtenidos:", data);
        if (!alive) return;
        setOrdenes(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error al cargar órdenes:", err);
        setErrorMsg("No se pudieron cargar las órdenes de compra.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getGastos]);

  const handleOpenView = (orden) => {
  const adaptedExpense = {
    id: orden.id,
    description: orden.notas || "Sin descripción",
    amount: new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(orden.totalOrden || 0),
    category: orden.proveedor?.nombre || "Proveedor no especificado",
    project: orden.numeroOrden,
    date: new Date(orden.fechaOrden).toLocaleDateString("es-MX"),
    requestedBy: orden.creadoPor || "Desconocido"
  };

  setSelectedOrden(adaptedExpense);
  setShowAuthModal(true);
};


  const tabs = [
    {
      id: "pendiente",
      label: "Pendientes",
      count: ordenes.filter((o) => matchesEstado(o.estado, "pendiente")).length,
    },
    {
      id: "aprobado",
      label: "Aprobadas",
      count: ordenes.filter((o) => matchesEstado(o.estado, "aprobado")).length,
    },
  ];

  const filteredOrders = ordenes.filter((o) => matchesEstado(o.estado, activeTab));

  
const getStatusLabel = (estado) => {
  switch ((estado || "").toLowerCase()) {
    case "pending":
      return "Pendiente";
    case "approved":
      return "Aprobado";
    case "received":
      return "Autorizado";
    case "paid":
      return "Pagado";
    case "cancelled":
      return "Rechazado";
    default:
      return estado || "Desconocido";
  }
};

const handleDownloadPDF = (order) => {
  if (!order) return;

  const doc = new jsPDF();
  const azulRey = [0, 70, 140];
  const azulClaro = [230, 240, 255];
  doc.setFillColor(...azulRey);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("ORDEN DE COMPRA", 105, 18, { align: "center" });

  //Datos Generales
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  let y = 40;

  doc.setFont("helvetica", "bold");
  doc.text("Datos Generales", 105, y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.text(`Folio: ${order.numeroOrden || "—"}`, 14, y);
  doc.text(`Proveedor: ${order.proveedor?.nombre || "—"}`, 105, y);
  y += 8;
  doc.text(`Fecha de Orden: ${formatDate(order.fechaOrden)}`, 14, y);
  doc.text(`Entrega Esperada: ${formatDate(order.fechaEntregaEsperada)}`, 105, y);
  y += 8;
  doc.text(`Estado: ${getStatusLabel(order.estado)}`, 14, y);
  doc.text(`Creado por: ${order.creadoPor || "—"}`, 105, y);
  y += 8;
  doc.text(`Total: ${formatCurrency(order.totalOrden)}`, 14, y);
  y += 10;

  //Detalle de Productos
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Productos", 105, y, { align: "center" });
  y += 8;

  const tableHead = [["Código", "Descripción", "Cantidad", "Costo Unitario", "Subtotal"]];
  const tableBody =
    order.articulos?.map((item) => [
      item.codigoArticulo || "—",
      item.descripcion || "—",
      `${item.cantidadOrdenada || 0} ${item.unidad || ""}`,
      formatCurrency(item.costoUnitario || 0),
      formatCurrency(item.subtotal || 0),
    ]) || [["—", "—", "—", "—", "—"]];

  doc.autoTable({
    startY: y,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: azulRey,
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      cellPadding: 3,
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: azulClaro },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { cellWidth: 70 },
      2: { halign: "center", cellWidth: 25 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "right", cellWidth: 35 },
    },
  });

  // Firmas en la parte inferior
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const baseY = pageHeight - 25; 

  doc.setFont("helvetica", "bold");
  doc.text("Aprobaciones", pageWidth / 2, baseY - 15, { align: "center" });

  doc.setFont("helvetica", "normal");
  const lineSpacing = 70;
  const centerX = pageWidth / 2;
  const leftLineX = centerX - lineSpacing;
  const rightLineX = centerX + 10;
  doc.text("__________________________", leftLineX, baseY);
  doc.text("__________________________", rightLineX, baseY);
  doc.setFontSize(11);
  doc.text("Responsable de Aprobación", leftLineX + 7, baseY + 10);
  doc.text("Departamento de Compras", rightLineX + 9, baseY + 10);

  const fileName = `Orden_${order.numeroOrden || "sin_folio"}.pdf`;
  doc.save(fileName);
};



  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="ShoppingCart" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Órdenes de Compra</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-smooth ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            Cargando órdenes de compra…
          </div>
        )}
        {!!errorMsg && <div className="text-center py-8 text-error">{errorMsg}</div>}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <Icon
              name="ShoppingCart"
              size={48}
              className="text-muted-foreground mx-auto mb-4"
            />
            <p className="text-muted-foreground">
              No hay órdenes {activeTab.toLowerCase()}.
            </p>
          </div>
        )}

        {filteredOrders.map((order) => (
  <div key={order.id} className="p-4 hover:bg-muted/50 transition-smooth">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h4 className="font-medium text-foreground">{order.numeroOrden}</h4>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}
          >
            {getStatusLabel(order.estado)}
          </span>
        </div>

        {/* Datos generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
          <div>
            <span className="font-medium">Proveedor:</span>
            <div className="text-foreground">{order.proveedor?.nombre || "—"}</div>
          </div>
          <div>
            <span className="font-medium">Fecha:</span>
            <div className="text-foreground">{formatDate(order.fechaOrden)}</div>
          </div>
          <div>
            <span className="font-medium">Entrega Esperada:</span>
            <div className="text-foreground">
              {formatDate(order.fechaEntregaEsperada)}
            </div>
          </div>
          <div>
            <span className="font-medium">Total:</span>
            <div className="text-foreground font-medium">
              {formatCurrency(order.totalOrden)}
            </div>
          </div>
        </div>
        {order.estado?.toLowerCase() === "approved" && order.autorizacion && (
          <div className="bg-muted/50 rounded-lg p-3 mb-3 text-sm">
            <h5 className="font-medium text-foreground mb-1">Detalles de Autorización</h5>
            <p><strong>Nivel:</strong> {order.autorizacion.authorizationLevel || "—"}</p>
            <p><strong>Método de Pago:</strong> {order.autorizacion.paymentMethod || "—"}</p>
            <p><strong>Fecha Programada:</strong> {order.autorizacion.scheduledDate || "—"}</p>
            <p><strong>Prioridad:</strong> {order.autorizacion.priority || "—"}</p>
            <p><strong>Comentarios:</strong> {order.autorizacion.approverComments || "Sin comentarios"}</p>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenView(order)}
            iconName="Eye"
            iconSize={16}
          >
            Ver
          </Button>
          {order.estado?.toLowerCase() === "approved" && (
            <Button
              variant="ghost"
              size="sm"
              iconName="Download"
              iconSize={16}
              onClick={() => handleDownloadPDF(order)}
            >
              Descargar
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            iconSize={16}
            className="text-error hover:text-error"
            onClick={() => alert("Eliminar orden")}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  </div>
))}

      </div>

      <PaymentAuthorizationModal
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  expense={selectedOrden}
  onAuthorize={async (updated) => {
    try {
      await updateGasto(updated.id, {
        status: "approved",
        operationType: "status_change",
        notes: updated.approverComments || "Orden aprobada automáticamente",
      });
      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === updated.id
            ? { ...o, estado: "approved", autorizacion: updated }
            : o
        )
      );

      setActiveTab("aprobado");
      setShowAuthModal(false);
    } catch (error) {
      console.error("Error al aprobar la orden:", error);
      alert("Ocurrió un error al aprobar la orden. Intenta de nuevo.");
    }
  }}
/>
    </div>
  );
};

export default GastosTable;
