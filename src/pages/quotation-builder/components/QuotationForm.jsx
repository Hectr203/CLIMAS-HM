import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const QuotationForm = ({ quotation, onUpdate, onCalculationUpdate, onValidationSubmit, isSaving }) => {
  const [calculations, setCalculations] = useState(quotation?.calculations || {});
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculationChange = (field, value) => {
    const updatedCalculations = {
      ...calculations,
      [field]: parseFloat(value) || 0
    };

    setCalculations(updatedCalculations);
    onCalculationUpdate?.(updatedCalculations);
  };

  const handleAutoCalculate = async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Auto-calculate based on standard percentages
    const autoCalculations = {
      ...calculations,
      installationPercentage: 25,
      parts: 15,
      travel: 8,
      personnel: 12
    };

    setCalculations(autoCalculations);
    onCalculationUpdate?.(autoCalculations);
    setIsCalculating(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Formulario de Cotización</h3>
        <Button
          variant="outline"
          size="sm"
          iconName="Calculator"
          iconPosition="left"
          onClick={handleAutoCalculate}
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculando...' : 'Auto-Calcular'}
        </Button>
      </div>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Proyecto</label>
          <Input
            value={quotation?.projectName || ''}
            readOnly
            className="bg-muted"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Cliente</label>
          <Input
            value={quotation?.client?.name || ''}
            readOnly
            className="bg-muted"
          />
        </div>
      </div>
      {/* Calculation Engine */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center space-x-2">
          <Icon name="Calculator" size={16} />
          <span>Motor de Cálculos Automatizado</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">% Instalación</label>
            <Input
              type="number"
              value={calculations?.installationPercentage || 0}
              onChange={(e) => handleCalculationChange('installationPercentage', e?.target?.value)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">% Piezas</label>
            <Input
              type="number"
              value={calculations?.parts || 0}
              onChange={(e) => handleCalculationChange('parts', e?.target?.value)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">% Viáticos</label>
            <Input
              type="number"
              value={calculations?.travel || 0}
              onChange={(e) => handleCalculationChange('travel', e?.target?.value)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">% Personal</label>
            <Input
              type="number"
              value={calculations?.personnel || 0}
              onChange={(e) => handleCalculationChange('personnel', e?.target?.value)}
              min="0"
              max="100"
              step="1"
              className="text-sm"
            />
          </div>
        </div>

        {/* Payment Terms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Garantía</label>
            <select
              value={calculations?.warranty || '12 meses'}
              onChange={(e) => handleCalculationChange('warranty', e?.target?.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="6 meses">6 meses</option>
              <option value="12 meses">12 meses</option>
              <option value="18 meses">18 meses</option>
              <option value="24 meses">24 meses</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">% Anticipo</label>
            <Input
              type="number"
              value="30"
              readOnly
              className="bg-muted text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">% Avance</label>
            <Input
              type="number"
              value="70"
              readOnly
              className="bg-muted text-sm"
            />
          </div>
        </div>
      </div>
      {/* Calculation Results */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium mb-3 flex items-center space-x-2">
          <Icon name="TrendingUp" size={16} />
          <span>Resumen de Cálculos</span>
        </h5>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Subtotal Materiales</p>
            <p className="font-medium">${calculations?.subtotal?.toLocaleString('es-MX') || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Costo Instalación</p>
            <p className="font-medium">${calculations?.installationCost?.toLocaleString('es-MX') || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Costo Piezas</p>
            <p className="font-medium">${calculations?.partsCost?.toLocaleString('es-MX') || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Viáticos</p>
            <p className="font-medium">${calculations?.travelCost?.toLocaleString('es-MX') || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Personal</p>
            <p className="font-medium">${calculations?.personnelCost?.toLocaleString('es-MX') || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-semibold">Total General</p>
            <p className="font-bold text-lg text-primary">${calculations?.total?.toLocaleString('es-MX') || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Anticipo (30%)</p>
            <p className="font-medium text-green-600">${calculations?.advance?.toLocaleString('es-MX') || '0'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avance (70%)</p>
            <p className="font-medium text-blue-600">${calculations?.progress?.toLocaleString('es-MX') || '0'}</p>
          </div>
        </div>
      </div>
      {/* Payment Terms Information */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Estructura de Pagos Mexicana</p>
            <p>30% anticipo, 70% contra avance de obra. Garantía incluye notas sobre fianzas. El documento engloba instalación, piezas, viáticos y personal estimado con cumplimiento normativo mexicano.</p>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          iconName="Save"
          iconPosition="left"
          disabled={isSaving}
        >
          Guardar Borrador
        </Button>
        <Button
          onClick={onValidationSubmit}
          disabled={isSaving}
          iconName={isSaving ? "Loader2" : "Send"}
          iconPosition="left"
        >
          {isSaving ? 'Enviando...' : 'Enviar para Validación'}
        </Button>
      </div>
    </div>
  );
};

export default QuotationForm;