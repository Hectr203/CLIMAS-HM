import React, { useRef, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import useClient from '../../../hooks/useClient';
import useProyecto from '../../../hooks/useProyect';
import { useNotifications } from '../../../context/NotificationContext';

// Utilidades de formateo
const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const QuotationPreview = ({ quotation }) => {
  const quotationRef = useRef(null);
  const [clientData, setClientData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getClients } = useClient();
  const { getProyectos } = useProyecto();
  const { showError, showWarning } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      if (!quotation?.informacion_basica) {
        return;
      }

      // Extraer IDs de la estructura correcta de la cotización
      const clientId = quotation.informacion_basica.cliente?.[0]?.id_cliente;
      const clientName = quotation.informacion_basica.cliente?.[1]?.nombre_cliente;
      const projectId = quotation.informacion_basica.proyecto?.[0]?.id_proyecto;
      const projectName = quotation.informacion_basica.proyecto?.[1]?.nombre_proyecto;

      if (!clientId || !projectId) {
        console.log('IDs extraídos:', { clientId, projectId, clientName, projectName });
        console.log('Estructura de cotización:', quotation);
        showWarning('Faltan datos del cliente o proyecto');
        return;
      }

      try {
        setLoading(true);
        
        const [clientsResponse, proyectosResponse] = await Promise.all([
          getClients(),
          getProyectos()
        ]);

        // Procesar respuesta de clientes
        const clientList = Array.isArray(clientsResponse) ? clientsResponse : 
                         clientsResponse?.data?.data || 
                         clientsResponse?.data || [];
        
        console.log('Lista de clientes:', clientList);
        
        const foundClient = clientList.find(c => c.id === clientId);

        if (!foundClient) {
          console.log('Cliente no encontrado:', { clientId, clientName, clientes: clientList });
          // Si no se encuentra el cliente, usamos los datos de la cotización
          setClientData({
            id: clientId,
            nombre: clientName,
            razon_social: clientName
          });
        } else {
          setClientData(foundClient);
        }

        // Procesar respuesta de proyectos
        const projectList = Array.isArray(proyectosResponse) ? proyectosResponse :
                          proyectosResponse?.data?.data || 
                          proyectosResponse?.data || [];
        
        console.log('Lista de proyectos:', projectList);
        
        const foundProject = projectList.find(p => p.id === projectId);

        if (!foundProject) {
          console.log('Proyecto no encontrado:', { projectId, projectName, proyectos: projectList });
          // Si no se encuentra el proyecto, usamos los datos de la cotización
          setProjectData({
            id: projectId,
            nombre: projectName
          });
        } else {
          setProjectData(foundProject);
        }

      } catch (error) {
        console.error('Error al cargar datos:', error);
        showError('Hubo un problema al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quotation?.informacion_basica, showError, showWarning]);

  const handleExportPDF = async () => {
    if (!quotationRef.current) return;
    
    try {

      const content = quotationRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData, 
        'JPEG', 
        imgX, 
        imgY, 
        imgWidth * ratio, 
        imgHeight * ratio
      );

      pdf.save(`Cotizacion-${quotation?.id || 'nueva'}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

          const handlePrint = () => {
            try {
              const printStyles = `
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #root * {
                    visibility: hidden;
                  }
                  .print-section, .print-section * {
                    visibility: visible;
                  }
                  .print-section {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                  @page {
                    size: A4;
                    margin: 20mm;
                  }
                }
              `;
              
              const style = document.createElement('style');
              style.textContent = printStyles;
              document.head.appendChild(style);
              
              quotationRef.current.classList.add('print-section');
              window.print();
              quotationRef.current.classList.remove('print-section');
              document.head.removeChild(style);
            } catch (error) {
              console.error('Error al imprimir:', error);
              showError('Hubo un problema al imprimir el documento');
            }
          };



          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Vista Previa de Cotización</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    iconName="Printer"
                    iconPosition="left"
                  >
                    Imprimir
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    iconName="Download"
                    iconPosition="left"
                  >
                    Exportar PDF
                  </Button>
                </div>
              </div>

              {/* Professional Quotation Format */}
              <div ref={quotationRef} className="bg-white border rounded-lg p-8 shadow-sm print:shadow-none print:border-none">
                {loading && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Icon name="Loader2" className="animate-spin" size={32} />
                        <Icon name="Wind" className="absolute inset-0 m-auto opacity-30" size={16} />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        Cargando información de la cotización...
                      </span>
                    </div>
                  </div>
                )}
                {/* Company Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Icon name="Wind" size={24} color="white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">AireFlow Pro</h1>
                      <p className="text-muted-foreground">Sistemas HVAC Profesionales</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>RFC: AFP123456789</p>
                    <p>Tel: +52 55 1234 5678</p>
                    <p>info@aireflowpro.com</p>
                  </div>
                </div>

                {/* Quotation Header */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">COTIZACIÓN</h2>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">No. Cotización:</span> {quotation?.folio}</p>
                        <p><span className="font-medium">Fecha:</span> {formatDate(quotation?.fechaCreacion)}</p>
                        <p><span className="font-medium">Validez:</span> 30 días</p>
                        <p><span className="font-medium">Vendedor:</span> {quotation?.asignacion?.responsables?.[0]?.nombre_responsable}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">CLIENTE</h3>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{clientData?.razon_social || quotation?.informacion_basica?.cliente?.[1]?.nombre_cliente}</p>
                        <p><span className="font-medium">RFC:</span> {clientData?.rfc}</p>
                        <p><span className="font-medium">Dirección:</span> {clientData?.direccion?.calle} {clientData?.direccion?.numero}, {clientData?.direccion?.colonia}, {clientData?.direccion?.municipio}, {clientData?.direccion?.estado}</p>
                        <p>Contacto: {quotation?.informacion_contacto?.[0]?.persona_contacto1?.[0]?.Persona_de_contacto_nombre}</p>
                        <p>Email: {quotation?.informacion_contacto?.[0]?.persona_contacto1?.[0]?.email}</p>
                        <p>Teléfono: {quotation?.informacion_contacto?.[0]?.persona_contacto1?.[0]?.telefono}</p>
                      </div>
                    </div>
                  </div>                {/* Project Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-primary">INFORMACIÓN DEL PROYECTO</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{projectData?.nombre || quotation?.informacion_basica?.proyecto?.[1]?.nombre_proyecto}</h4>
                    <p className="text-sm text-muted-foreground">
                      {projectData?.descripcion || quotation?.detalles_proyecto?.descripcion_proyecto}
                    </p>
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>
                        <span className="font-medium">Ubicación:</span>{' '}
                        {quotation?.detalles_proyecto?.ubicacion_proyecto?.[0]?.direccion},{' '}
                        {quotation?.detalles_proyecto?.ubicacion_proyecto?.[0]?.municipio},{' '}
                        {quotation?.detalles_proyecto?.ubicacion_proyecto?.[0]?.estado}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Tipo de proyecto:</span>{' '}
                        {quotation?.informacion_basica?.tipo_proyecto?.toUpperCase()}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Prioridad:</span>{' '}
                        {quotation?.informacion_basica?.prioridad?.toUpperCase()}
                      </p>
                      {projectData && (
                        <>
                          <p className="mt-1">
                            <span className="font-medium">Estado del proyecto:</span>{' '}
                            {projectData?.estado}
                          </p>
                          <p className="mt-1">
                            <span className="font-medium">Fecha de inicio:</span>{' '}
                            {formatDate(projectData?.fecha_inicio)}
                          </p>
                          <p className="mt-1">
                            <span className="font-medium">Fecha estimada de finalización:</span>{' '}
                            {formatDate(projectData?.fecha_fin_estimada)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-primary">ALCANCE DE TRABAJO</h3>
                  <div className="text-sm leading-relaxed">
                    <p>{quotation?.quotationData?.scope}</p>
                  </div>
                </div>

                {/* Materials and Equipment */}
                {quotation?.materials && quotation?.materials?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-primary">MATERIALES Y EQUIPOS</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-border">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-2 text-left border border-border">Descripción</th>
                            <th className="px-4 py-2 text-left border border-border">Cantidad</th>
                            <th className="px-4 py-2 text-right border border-border">Precio Unit.</th>
                            <th className="px-4 py-2 text-right border border-border">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotation?.materials?.map((material, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 border border-border">{material?.item}</td>
                              <td className="px-4 py-2 border border-border">{material?.quantity}</td>
                              <td className="px-4 py-2 text-right border border-border">
                                {formatCurrency(material?.cost / parseInt(material?.quantity) || material?.cost)}
                              </td>
                              <td className="px-4 py-2 text-right border border-border">
                                {formatCurrency(material?.cost)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-muted/30 font-semibold">
                            <td colSpan="3" className="px-4 py-2 text-right border border-border">
                              SUBTOTAL:
                            </td>
                            <td className="px-4 py-2 text-right border border-border">
                              {formatCurrency(quotation?.materials?.reduce((sum, m) => sum + (m?.cost || 0), 0))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Project Assumptions */}
                {quotation?.quotationData?.assumptions && quotation?.quotationData?.assumptions?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-primary">SUPUESTOS DEL PROYECTO</h3>
                    <ul className="text-sm space-y-1">
                      {quotation?.quotationData?.assumptions?.map((assumption, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Icon name="Check" size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline and Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">CRONOGRAMA</h3>
                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <p><span className="font-medium">Tiempo de ejecución:</span> {quotation?.detalles_proyecto?.tiempo_ejecucion}</p>
                      <p><span className="font-medium">Notas:</span> {quotation?.asignacion?.notas_adicionales}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">CONDICIONES COMERCIALES</h3>
                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <p>• Precio sujeto a cambios sin previo aviso</p>
                      <p>• Forma de pago: 50% anticipo, 50% contra entrega</p>
                      <p>• Tiempo de entrega: según cronograma</p>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-primary/10 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">INVERSIÓN TOTAL</h3>
                      <p className="text-sm text-muted-foreground">
                        Válida por 30 días
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(quotation?.detalles_proyecto?.presupuesto_estimado_mxn)}
                      </div>
                      <p className="text-sm text-muted-foreground">IVA incluido</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-4 text-center text-sm text-muted-foreground">
                  <p>Gracias por la confianza en AireFlow Pro</p>
                  <p>Para cualquier consulta, contacte a: {quotation?.assignedTo}</p>
                  <p className="mt-2 font-medium">
                    Esta cotización cumple con la normativa mexicana vigente
                  </p>
                </div>
              </div>

              {/* Quotation Status */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">Estado de la Cotización</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    <span>Creada: {formatDate(quotation?.createdDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={16} className="text-muted-foreground" />
                    <span>Modificada: {formatDate(quotation?.lastModified)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="User" size={16} className="text-muted-foreground" />
                    <span>Versión: {quotation?.revisions?.[quotation?.revisions?.length - 1]?.version || '1.0'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default QuotationPreview;