import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ValidationPanel = ({ project, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');

  const handleSubmitForValidation = async () => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const validation = {
      status: 'submitted',
      reviewer: 'Ventas/Martín',
      submittedAt: new Date()?.toISOString(),
      notes: validationNotes
    };
    
    onSubmit?.(validation);
    setIsSubmitting(false);
    setValidationNotes('');
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validation = {
      status: 'approved',
      reviewer: 'Ventas/Martín',
      approvedAt: new Date()?.toISOString(),
      notes: validationNotes
    };
    
    onSubmit?.(validation);
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validation = {
      status: 'rejected',
      reviewer: 'Ventas/Martín',
      rejectedAt: new Date()?.toISOString(),
      notes: validationNotes
    };
    
    onSubmit?.(validation);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="CheckCircle" size={16} className="text-primary" />
        <h4 className="font-medium">Validación de Cotización</h4>
      </div>
      {/* Current Status */}
      {project?.validation ? (
        <div className={`p-3 rounded-lg ${
          project?.validation?.status === 'approved' ? 'bg-green-50' :
          project?.validation?.status === 'rejected'? 'bg-red-50' : 'bg-yellow-50'
        }`}>
          <div className="flex items-center space-x-2">
            <Icon 
              name={
                project?.validation?.status === 'approved' ? 'CheckCircle' :
                project?.validation?.status === 'rejected'? 'XCircle' : 'Clock'
              } 
              size={14} 
              className={
                project?.validation?.status === 'approved' ? 'text-green-600' :
                project?.validation?.status === 'rejected'? 'text-red-600' : 'text-yellow-600'
              } 
            />
            <p className={`text-sm font-medium ${
              project?.validation?.status === 'approved' ? 'text-green-800' :
              project?.validation?.status === 'rejected'? 'text-red-800' : 'text-yellow-800'
            }`}>
              {project?.validation?.status === 'approved' ? 'Cotización Aprobada' :
               project?.validation?.status === 'rejected'? 'Cotización Rechazada' : 'Validación Pendiente'}
            </p>
          </div>
          <p className={`text-xs mt-1 ${
            project?.validation?.status === 'approved' ? 'text-green-700' :
            project?.validation?.status === 'rejected'? 'text-red-700' : 'text-yellow-700'
          }`}>
            Revisor: {project?.validation?.reviewer}
          </p>
          {project?.validation?.notes && (
            <p className={`text-xs mt-2 ${
              project?.validation?.status === 'approved' ? 'text-green-700' :
              project?.validation?.status === 'rejected'? 'text-red-700' : 'text-yellow-700'
            }`}>
              Notas: {project?.validation?.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={14} className="text-blue-600" />
            <p className="text-sm text-blue-800 font-medium">Cotización lista para validación</p>
          </div>
          <p className="text-xs text-blue-700 mt-1">La cotización debe ser validada por Ventas/Martín antes de enviar al cliente</p>
        </div>
      )}
      {/* Quotation Summary */}
      {project?.quotation && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium mb-2">Resumen de Cotización</h5>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Instalación:</span>
              <span>{project?.quotation?.installationPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Piezas:</span>
              <span>{project?.quotation?.parts}%</span>
            </div>
            <div className="flex justify-between">
              <span>Viáticos:</span>
              <span>{project?.quotation?.travel}%</span>
            </div>
            <div className="flex justify-between">
              <span>Personal:</span>
              <span>{project?.quotation?.personnel}%</span>
            </div>
            <div className="flex justify-between">
              <span>Condiciones:</span>
              <span>{project?.quotation?.advance}% anticipo, {project?.quotation?.progress}% avance</span>
            </div>
            <div className="flex justify-between">
              <span>Garantía:</span>
              <span>{project?.quotation?.warranty}</span>
            </div>
          </div>
        </div>
      )}
      {/* Validation Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notas de Validación</label>
        <textarea
          value={validationNotes}
          onChange={(e) => setValidationNotes(e?.target?.value)}
          placeholder="Agregar comentarios sobre la validación..."
          className="w-full p-2 border rounded-md text-sm resize-none"
          rows={3}
        />
      </div>
      {/* Action Buttons */}
      {!project?.validation || project?.validation?.status === 'rejected' ? (
        <Button
          onClick={handleSubmitForValidation}
          disabled={isSubmitting}
          iconName={isSubmitting ? "Loader2" : "Send"}
          iconPosition="left"
          size="sm"
          className="w-full"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar para Validación'}
        </Button>
      ) : project?.validation?.status === 'pending' ? (
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            iconName="CheckCircle"
            iconPosition="left"
            size="sm"
            variant="default"
          >
            Aprobar
          </Button>
          <Button
            onClick={handleReject}
            disabled={isSubmitting}
            iconName="XCircle"
            iconPosition="left"
            size="sm"
            variant="destructive"
          >
            Rechazar
          </Button>
        </div>
      ) : null}
      {/* Validation Process Info */}
      <div className="p-3 bg-amber-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Diamond" size={14} className="text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Punto de Decisión</p>
            <p>La validación por Ventas/Martín es un punto clave del proceso. Una vez aprobada, se puede proceder al envío de propuesta al cliente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;