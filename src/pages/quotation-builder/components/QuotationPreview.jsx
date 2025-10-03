import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuotationPreview = ({ quotation, onVersionCreate }) => {
  const currentDate = new Date()?.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vista Previa de Cotización</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Copy"
            iconPosition="left"
            onClick={onVersionCreate}
          >
            Crear Versión
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Exportar PDF
          </Button>
        </div>
      </div>
      {/* Professional Quotation Preview */}
      <div className="bg-white border rounded-lg p-8 shadow-sm">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AireFlow Pro</h1>
              <p className="text-sm text-gray-600 mt-1">Soluciones HVAC Profesionales</p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>RFC: AFP123456ABC</p>
                <p>Av. Tecnológico 123, Ciudad de México</p>
                <p>Tel: (55) 1234-5678 | contacto@aireflowpro.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-900">COTIZACIÓN</h2>
              <p className="text-sm font-medium mt-1">{quotation?.id}</p>
              <p className="text-xs text-gray-500">Versión {quotation?.version}</p>
              <p className="text-xs text-gray-500 mt-2">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">CLIENTE</h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{quotation?.client?.name}</p>
              <p className="text-gray-600">{quotation?.client?.contact}</p>
              <p className="text-gray-600">{quotation?.client?.address}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">PROYECTO</h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{quotation?.projectName}</p>
              <p className="text-gray-600">ID: {quotation?.projectId}</p>
              <p className="text-gray-600">Garantía: {quotation?.calculations?.warranty}</p>
            </div>
          </div>
        </div>

        {/* Source Indicator */}
        <div className={`p-3 rounded-lg mb-6 ${
          quotation?.hasCatalog ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Icon 
              name={quotation?.hasCatalog ? "CheckCircle" : "Search"} 
              size={16} 
              className={quotation?.hasCatalog ? "text-green-600" : "text-yellow-600"} 
            />
            <p className={`text-sm font-medium ${
              quotation?.hasCatalog ? "text-green-800" : "text-yellow-800"
            }`}>
              {quotation?.hasCatalog 
                ? "Cotización elaborada desde catálogo proporcionado por cliente" 
                : "Materiales identificados a partir de planos de obra"
              }
            </p>
          </div>
        </div>

        {/* Materials Table */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">MATERIALES Y EQUIPOS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-900">Descripción</th>
                  <th className="text-center p-3 font-medium text-gray-900">Cantidad</th>
                  <th className="text-right p-3 font-medium text-gray-900">Precio Unitario</th>
                  <th className="text-right p-3 font-medium text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotation?.materials?.map((material, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span>{material?.name}</span>
                        {material?.source === 'catalog' && (
                          <Icon name="Book" size={12} className="text-green-600" title="Desde catálogo" />
                        )}
                        {material?.source === 'plan_analysis' && (
                          <Icon name="FileText" size={12} className="text-blue-600" title="Desde planos" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">{material?.quantity}</td>
                    <td className="p-3 text-right">${material?.unitPrice?.toLocaleString('es-MX')}</td>
                    <td className="p-3 text-right font-medium">${material?.total?.toLocaleString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="p-3 text-right font-medium text-gray-900">Subtotal Materiales:</td>
                  <td className="p-3 text-right font-bold">${quotation?.calculations?.subtotal?.toLocaleString('es-MX')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">DESGLOSE DE COSTOS</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Instalación ({quotation?.calculations?.installationPercentage}%)</span>
                  <span>${quotation?.calculations?.installationCost?.toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Piezas ({quotation?.calculations?.parts}%)</span>
                  <span>${quotation?.calculations?.partsCost?.toLocaleString('es-MX')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Viáticos ({quotation?.calculations?.travel}%)</span>
                  <span>${quotation?.calculations?.travelCost?.toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Personal ({quotation?.calculations?.personnel}%)</span>
                  <span>${quotation?.calculations?.personnelCost?.toLocaleString('es-MX')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">CONDICIONES DE PAGO</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-900">Anticipo (30%)</p>
                <p className="text-2xl font-bold text-blue-700">${quotation?.calculations?.advance?.toLocaleString('es-MX')}</p>
                <p className="text-xs text-blue-600 mt-1">Requerido para inicio de obra</p>
              </div>
              <div>
                <p className="font-medium text-blue-900">Contra Avance (70%)</p>
                <p className="text-2xl font-bold text-blue-700">${quotation?.calculations?.progress?.toLocaleString('es-MX')}</p>
                <p className="text-xs text-blue-600 mt-1">Pagos contra avance de obra</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total del Proyecto</p>
              <p className="text-xs text-gray-500">Incluye materiales, instalación y garantía</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">${quotation?.calculations?.total?.toLocaleString('es-MX')}</p>
              <p className="text-xs text-gray-500">MXN (Pesos Mexicanos)</p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">TÉRMINOS Y CONDICIONES</h3>
          <div className="text-xs text-gray-600 space-y-2">
            <p>• Garantía de {quotation?.calculations?.warranty} sobre equipos y mano de obra</p>
            <p>• Los precios incluyen IVA y están sujetos a variación sin previo aviso</p>
            <p>• Tiempo de entrega: Sujeto a disponibilidad de materiales</p>
            <p>• Cumplimiento con normativas mexicanas NOM-001-SEDE y NOM-008-ENER</p>
            <p>• Póliza de responsabilidad civil incluida durante la instalación</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-gray-500">
            Esta cotización tiene vigencia de 30 días a partir de la fecha de emisión
          </p>
          <p className="text-xs text-gray-500 mt-2">
            AireFlow Pro - Registro ante SEMARNAT: {quotation?.id?.split('-')?.[2]}
          </p>
        </div>
      </div>
      {/* Notes */}
      {quotation?.notes && (
        <div className="p-4 bg-amber-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <Icon name="StickyNote" size={16} className="text-amber-600" />
            <span>Notas Internas</span>
          </h4>
          <p className="text-sm text-amber-800">{quotation?.notes}</p>
        </div>
      )}
    </div>
  );
};

export default QuotationPreview;