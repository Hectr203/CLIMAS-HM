import React from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';

        const QuotationPreview = ({ quotation }) => {
          const handleExportPDF = () => {
            console.log('Export PDF functionality would be implemented here');
          };

          const handlePrint = () => {
            window.print();
          };

          const formatCurrency = (amount) => {
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            })?.format(amount);
          };

          const formatDate = (dateString) => {
            return new Date(dateString)?.toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
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
              <div className="bg-white border rounded-lg p-8 shadow-sm print:shadow-none print:border-none">
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
                      <p><span className="font-medium">No. Cotización:</span> {quotation?.id}</p>
                      <p><span className="font-medium">Fecha:</span> {formatDate(quotation?.createdDate)}</p>
                      <p><span className="font-medium">Validez:</span> {quotation?.quotationData?.validity}</p>
                      <p><span className="font-medium">Vendedor:</span> {quotation?.assignedTo}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">CLIENTE</h3>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{quotation?.clientName}</p>
                      <p>Contacto: {quotation?.contactInfo?.contactPerson}</p>
                      <p>Email: {quotation?.contactInfo?.email}</p>
                      <p>Teléfono: {quotation?.contactInfo?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-primary">INFORMACIÓN DEL PROYECTO</h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{quotation?.projectName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {quotation?.projectDetails?.description}
                    </p>
                    {quotation?.projectDetails?.location && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium">Ubicación:</span> {quotation?.projectDetails?.location}
                      </p>
                    )}
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
                      <p><span className="font-medium">Tiempo de ejecución:</span> {quotation?.quotationData?.timeline}</p>
                      {quotation?.quotationData?.warranty && (
                        <p><span className="font-medium">Garantía:</span> {quotation?.quotationData?.warranty}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">CONDICIONES COMERCIALES</h3>
                    <div className="bg-muted/30 rounded-lg p-4 text-sm">
                      <p>{quotation?.quotationData?.conditions}</p>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-primary/10 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">INVERSIÓN TOTAL</h3>
                      <p className="text-sm text-muted-foreground">
                        Válida por {quotation?.quotationData?.validity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(quotation?.quotationData?.totalAmount)}
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