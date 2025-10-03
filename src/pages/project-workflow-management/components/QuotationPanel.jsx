import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const QuotationPanel = ({ project, onUpdate }) => {
  const [quotation, setQuotation] = useState({
    installationPercentage: 25,
    parts: 15,
    travel: 8,
    personnel: 12,
    advance: 30,
    progress: 70,
    warranty: '12 meses',
    ...project?.quotation
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setQuotation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onUpdate?.(quotation);
    setIsSaving(false);
  };

  const calculateTotal = () => {
    const base = 100000; // Base amount for calculation
    const installation = (quotation?.installationPercentage / 100) * base;
    const parts = (quotation?.parts / 100) * base;
    const travel = (quotation?.travel / 100) * base;
    const personnel = (quotation?.personnel / 100) * base;
    
    return installation + parts + travel + personnel;
  };

  const getAdvanceAmount = () => {
    return (quotation?.advance / 100) * calculateTotal();
  };

  const getProgressAmount = () => {
    return (quotation?.progress / 100) * calculateTotal();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="Calculator" size={16} className="text-primary" />
        <h4 className="font-medium">Constructor de Cotización</h4>
      </div>
      {/* Decision Point Indicator */}
      {project?.hasClientCatalog ? (
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={14} className="text-green-600" />
            <p className="text-sm text-green-800 font-medium">Cliente proporcionó catálogo</p>
          </div>
          <p className="text-xs text-green-700 mt-1">Elaborar cotización inicial desde catálogo</p>
        </div>
      ) : (
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={14} className="text-yellow-600" />
            <p className="text-sm text-yellow-800 font-medium">Sin catálogo del cliente</p>
          </div>
          <p className="text-xs text-yellow-700 mt-1">Identificar materiales a partir de planos de obra</p>
        </div>
      )}
      {/* Quotation Form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">% Instalación</label>
            <Input
              type="number"
              value={quotation?.installationPercentage}
              onChange={(e) => handleInputChange('installationPercentage', parseFloat(e?.target?.value) || 0)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">% Piezas</label>
            <Input
              type="number"
              value={quotation?.parts}
              onChange={(e) => handleInputChange('parts', parseFloat(e?.target?.value) || 0)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">% Viáticos</label>
            <Input
              type="number"
              value={quotation?.travel}
              onChange={(e) => handleInputChange('travel', parseFloat(e?.target?.value) || 0)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">% Personal</label>
            <Input
              type="number"
              value={quotation?.personnel}
              onChange={(e) => handleInputChange('personnel', parseFloat(e?.target?.value) || 0)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">% Anticipo</label>
            <Input
              type="number"
              value={quotation?.advance}
              onChange={(e) => handleInputChange('advance', parseFloat(e?.target?.value) || 0)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">% Avance</label>
            <Input
              type="number"
              value={quotation?.progress}
              onChange={(e) => handleInputChange('progress', parseFloat(e?.target?.value) || 0)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Garantía</label>
          <select
            value={quotation?.warranty}
            onChange={(e) => handleInputChange('warranty', e?.target?.value)}
            className="w-full p-2 border rounded-md text-sm"
          >
            <option value="6 meses">6 meses</option>
            <option value="12 meses">12 meses</option>
            <option value="18 meses">18 meses</option>
            <option value="24 meses">24 meses</option>
          </select>
        </div>
      </div>
      {/* Calculation Summary */}
      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
        <h5 className="text-sm font-medium">Resumen de Cálculos</h5>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Total Estimado:</span>
            <span className="font-medium">${calculateTotal()?.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between">
            <span>Anticipo ({quotation?.advance}%):</span>
            <span>${getAdvanceAmount()?.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between">
            <span>Avance ({quotation?.progress}%):</span>
            <span>${getProgressAmount()?.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between">
            <span>Garantía:</span>
            <span>{quotation?.warranty}</span>
          </div>
        </div>
      </div>
      {/* Conditions Note */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={14} className="text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Condiciones Estándar</p>
            <p>30% anticipo, 70% avance. El documento de cotización engloba instalación, piezas, viáticos, personal estimado y notas sobre garantías.</p>
          </div>
        </div>
      </div>
      <Button
        onClick={handleSave}
        disabled={isSaving}
        iconName={isSaving ? "Loader2" : "Save"}
        iconPosition="left"
        size="sm"
        className="w-full"
      >
        {isSaving ? 'Guardando...' : 'Guardar Cotización'}
      </Button>
    </div>
  );
};

export default QuotationPanel;