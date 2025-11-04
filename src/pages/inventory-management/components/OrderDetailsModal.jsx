import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Configuración inicial
    doc.setFontSize(20);
    doc.text('Orden de Compra', 105, 15, { align: 'center' });
    doc.setFontSize(12);

    // Información del encabezado
    doc.text(`Número: ${order.numeroOrden}`, 15, 30);
    doc.text(`Fecha: ${formatDate(order.fechaCreacion)}`, 15, 40);
    doc.text(`Estado: ${getStatusLabel(order.estado)}`, 15, 50);
    doc.text(`Proveedor: ${order.proveedor?.nombre}`, 15, 60);
    doc.text(`Términos de Pago: ${getPaymentTermLabel(order.terminosPago)}`, 15, 70);
    
    if (order.fechaEntregaEsperada) {
      doc.text(`Entrega Esperada: ${formatDate(order.fechaEntregaEsperada)}`, 15, 80);
    }

    // Tabla de artículos
    const tableColumns = [
      { header: 'Código', dataKey: 'codigo' },
      { header: 'Nombre', dataKey: 'nombre' },
      { header: 'Descripción', dataKey: 'descripcion' },
      { header: 'Cantidad', dataKey: 'cantidad' },
      { header: 'Costo Unit.', dataKey: 'costoUnitario' },
      { header: 'Subtotal', dataKey: 'subtotal' }
    ];

    const tableRows = order.articulos?.map(item => ({
      codigo: item.codigoArticulo,
      nombre: item.nombre || item.descripcion || item.codigoArticulo,
      descripcion: item.descripcion,
      cantidad: `${item.cantidadOrdenada} ${item.unidad}`,
      costoUnitario: formatCurrency(item.costoUnitario),
      subtotal: formatCurrency(item.subtotal)
    }));

    autoTable(doc, {
      head: [tableColumns.map(col => col.header)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
      startY: 90,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Total
    const finalY = doc.previousAutoTable ? doc.previousAutoTable.finalY : 90;
    doc.text(`Total: ${formatCurrency(order.totalOrden)}`, 195, finalY + 10, { align: 'right' });

    // Notas si existen
    if (order.notas) {
      doc.text('Notas:', 15, finalY + 20);
      doc.setFontSize(10);
      doc.text(order.notas, 15, finalY + 30);
    }

    // Descargar el PDF
    doc.save(`orden-compra-${order.numeroOrden}.pdf`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10';
      case 'approved': return 'text-primary bg-primary/10';
      case 'received': return 'text-success bg-success/10';
      case 'cancelled': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'received': return 'Recibida';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPaymentTermLabel = (term) => {
    if (!term) return 'No especificado';
    
    // Convertir a minúsculas para hacer la comparación insensible a mayúsculas
    const termLower = term.toLowerCase();
    const terms = {
      'immediate': 'Pago Inmediato',
      'net15': '15 días',
      'net30': '30 días',
      'net60': '60 días',
      'contado': 'Pago de Contado',
      'credito': 'Crédito',
      'custom': 'Personalizado',
      'prepaid': 'Pago por Adelantado',
      'cod': 'Pago Contra Entrega',
      'credit_card': 'Tarjeta de Crédito',
      'wire_transfer': 'Transferencia Bancaria',
      'cash': 'Efectivo'
    };
    return terms[termLower] || 'Otros Términos';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
        
        <div className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-card text-left align-middle shadow-xl transition-all">
          {/* Header */}
          <div className="bg-muted px-6 py-4 flex items-center justify-between border-b border-border">
            <h3 className="text-lg font-medium text-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={18} className="text-primary" />
                <span>Detalles de Orden de Compra</span>
              </div>
            </h3>
            <button onClick={onClose} className="rounded-md bg-transparent text-muted-foreground hover:text-foreground">
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Order Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-medium mb-1">{order.numeroOrden}</h4>
                  <p className="text-sm text-muted-foreground">
                    Creada el {formatDate(order.fechaCreacion)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.estado)}`}>
                    {getStatusLabel(order.estado)}
                  </span>
                  {order.esUrgente && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error/10 text-error">
                      <Icon name="AlertCircle" size={14} className="mr-1" />
                      Urgente
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Proveedor</h5>
                  <p className="text-foreground">{order.proveedor?.nombre}</p>
                </div>
                {order.fechaEntregaEsperada && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-1">Entrega Esperada</h5>
                    <p className="text-foreground">{formatDate(order.fechaEntregaEsperada)}</p>
                  </div>
                )}
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-1">Términos de Pago</h5>
                  <p className="text-foreground">{getPaymentTermLabel(order.terminosPago)}</p>
                </div>
              </div>

              {order.notas && (
                <div className="bg-muted p-4 rounded-md">
                  <h5 className="text-sm font-medium mb-2">Notas</h5>
                  <p className="text-sm text-muted-foreground">{order.notas}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border border-border rounded-md mb-6">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Descripción</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Cantidad</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Costo Unit.</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.articulos?.map((item) => (
                    <tr key={item.articuloId} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">{item.codigoArticulo}</td>
                      <td className="px-4 py-3 text-sm">{item.nombre}</td>
                      <td className="px-4 py-3 text-sm">{item.descripcion}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.cantidadOrdenada} {item.unidad}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.costoUnitario)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-right font-medium">Total:</td>
                    <td className="px-4 py-3 text-right text-lg font-bold">{formatCurrency(order.totalOrden)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* History */}
            {order.historial && order.historial.length > 0 && (
              <div>
                <h5 className="font-medium mb-3">Historial</h5>
                <div className="space-y-2">
                  {order.historial.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm">
                      <div className="w-32 flex-shrink-0 text-muted-foreground">
                        {formatDate(entry.fecha)}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{entry.usuario}</span>
                        <span className="mx-1">•</span>
                        <span>{entry.accion}</span>
                        {entry.comentarios && (
                          <p className="text-muted-foreground mt-1">{entry.comentarios}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-muted px-6 py-4 flex justify-end space-x-2 border-t border-border">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={handleDownloadPDF}
            >
              <Icon name="Download" size={18} />
              <span>Descargar PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;