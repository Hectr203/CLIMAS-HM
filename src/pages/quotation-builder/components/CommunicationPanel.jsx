import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CommunicationPanel = ({ quotation, onSend, isSending }) => {
  const [communicationMethod, setCommunicationMethod] = useState('email');
  const [message, setMessage] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [showAdjustments, setShowAdjustments] = useState(false);

  const handleSend = () => {
    onSend?.(communicationMethod, message);
  };

  const generateDefaultMessage = () => {
    const defaultMessages = {
      email: `Estimado ${quotation?.client?.name},

Adjunto encontrará la cotización ${quotation?.id} para el proyecto "${quotation?.projectName}".

Resumen:
- Total del proyecto: $${quotation?.calculations?.total?.toLocaleString('es-MX')} MXN
- Anticipo requerido (30%): $${quotation?.calculations?.advance?.toLocaleString('es-MX')} MXN
- Garantía: ${quotation?.calculations?.warranty}

Esta cotización tiene vigencia de 30 días. Quedamos a sus órdenes para cualquier aclaración.

Saludos cordiales,
Equipo AireFlow Pro`,
      
      whatsapp: `Hola ${quotation?.client?.name} 👋

Le enviamos la cotización ${quotation?.id} para "${quotation?.projectName}":

💰 Total: $${quotation?.calculations?.total?.toLocaleString('es-MX')} MXN
📋 Anticipo: $${quotation?.calculations?.advance?.toLocaleString('es-MX')} (30%)
🛡️ Garantía: ${quotation?.calculations?.warranty}

Vigencia: 30 días
¿Tiene alguna pregunta? 🤔`
    };

    setMessage(defaultMessages?.[communicationMethod] || '');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comunicación con Cliente</h3>
        {quotation?.communication?.sentAt && (
          <div className="text-sm text-green-600 flex items-center space-x-1">
            <Icon name="CheckCircle" size={16} />
            <span>Enviado {new Date(quotation?.communication?.sentAt)?.toLocaleDateString('es-MX')}</span>
          </div>
        )}
      </div>
      {/* Previous Communications */}
      {quotation?.communication?.adjustments > 0 && (
        <div className="p-4 bg-amber-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="RotateCcw" size={16} className="text-amber-600" />
            <h4 className="font-medium text-amber-800">Historial de Ajustes</h4>
          </div>
          <p className="text-sm text-amber-700">
            Esta cotización ha tenido {quotation?.communication?.adjustments} ajuste(s) basados en comentarios del cliente.
          </p>
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconPosition="left"
            className="mt-2"
            onClick={() => setShowAdjustments(!showAdjustments)}
          >
            {showAdjustments ? 'Ocultar' : 'Ver'} Historial
          </Button>
        </div>
      )}
      {/* Communication Method Selection */}
      <div className="space-y-4">
        <h4 className="font-medium">Método de Envío</h4>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setCommunicationMethod('email')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              communicationMethod === 'email' ?'border-primary bg-primary/10' :'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={20} className={communicationMethod === 'email' ? 'text-primary' : 'text-gray-600'} />
              <div>
                <h5 className="font-medium">Correo Electrónico</h5>
                <p className="text-sm text-gray-600">Envío formal con PDF adjunto</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setCommunicationMethod('whatsapp')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              communicationMethod === 'whatsapp' ?'border-primary bg-primary/10' :'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon name="MessageCircle" size={20} className={communicationMethod === 'whatsapp' ? 'text-primary' : 'text-gray-600'} />
              <div>
                <h5 className="font-medium">WhatsApp</h5>
                <p className="text-sm text-gray-600">Comunicación rápida e informal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Message Composition */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Mensaje de Acompañamiento</h4>
          <Button
            variant="outline"
            size="sm"
            iconName="FileText"
            iconPosition="left"
            onClick={generateDefaultMessage}
          >
            Generar Mensaje
          </Button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e?.target?.value)}
          placeholder={`Escriba su mensaje ${communicationMethod === 'email' ? 'de correo' : 'de WhatsApp'}...`}
          className="w-full p-3 border rounded-lg resize-none"
          rows={communicationMethod === 'email' ? 8 : 6}
        />

        <div className="text-xs text-gray-500">
          {communicationMethod === 'email' 
            ? "Se adjuntará automáticamente el PDF de la cotización" :"Se incluirá un enlace para descargar la cotización"
          }
        </div>
      </div>
      {/* Client Contact Information */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Información de Contacto</h4>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Cliente:</span> {quotation?.client?.name}</p>
          <p><span className="font-medium">Contacto:</span> {quotation?.client?.contact}</p>
          <p><span className="font-medium">Proyecto:</span> {quotation?.projectName}</p>
        </div>
      </div>
      {/* Quotation Summary */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2 text-blue-900">Resumen de Cotización</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Total del Proyecto</p>
            <p className="font-bold text-lg text-blue-900">${quotation?.calculations?.total?.toLocaleString('es-MX')}</p>
          </div>
          <div>
            <p className="text-blue-700">Anticipo Requerido</p>
            <p className="font-bold text-lg text-blue-900">${quotation?.calculations?.advance?.toLocaleString('es-MX')}</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          Garantía: {quotation?.calculations?.warranty} | Vigencia: 30 días
        </div>
      </div>
      {/* Adjustment Notes (if needed) */}
      {quotation?.communication?.adjustments > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Notas sobre Ajustes Realizados</label>
          <textarea
            value={adjustmentNotes}
            onChange={(e) => setAdjustmentNotes(e?.target?.value)}
            placeholder="Describa los cambios realizados basados en comentarios del cliente..."
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
          />
        </div>
      )}
      {/* Send Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          iconName="Save"
          iconPosition="left"
        >
          Guardar Borrador
        </Button>
        <Button
          onClick={handleSend}
          disabled={isSending || !message?.trim()}
          iconName={isSending ? "Loader2" : communicationMethod === 'email' ? "Mail" : "MessageCircle"}
          iconPosition="left"
        >
          {isSending 
            ? 'Enviando...' 
            : `Enviar por ${communicationMethod === 'email' ? 'Correo' : 'WhatsApp'}`
          }
        </Button>
      </div>
      {/* Process Information */}
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Siguiente Paso del Proceso</p>
            <p>Una vez enviada la propuesta, se activará el seguimiento automático. Si el cliente requiere ajustes, estos se pueden gestionar desde el panel de comunicación.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPanel;