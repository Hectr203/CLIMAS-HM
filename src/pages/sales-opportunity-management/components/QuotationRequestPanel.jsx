import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const QuotationRequestPanel = ({ opportunity, onUpdate }) => {
          const [quotationData, setQuotationData] = useState(
            opportunity?.quotationData || {
              scope: '',
              assumptions: [],
              timeline: '',
              conditions: '',
              materials: [],
              riskAssessment: 'low',
              extraCosts: [],
              totalAmount: 0,
              validity: '30 días'
            }
          );

          const [newAssumption, setNewAssumption] = useState('');
          const [newMaterial, setNewMaterial] = useState('');

          const handleInputChange = (field, value) => {
            setQuotationData(prev => ({ ...prev, [field]: value }));
          };

          const addAssumption = () => {
            if (!newAssumption?.trim()) return;
            setQuotationData(prev => ({
              ...prev,
              assumptions: [...(prev?.assumptions || []), newAssumption]
            }));
            setNewAssumption('');
          };

          const removeAssumption = (index) => {
            setQuotationData(prev => ({
              ...prev,
              assumptions: prev?.assumptions?.filter((_, i) => i !== index)
            }));
          };

          const addMaterial = () => {
            if (!newMaterial?.trim()) return;
            setQuotationData(prev => ({
              ...prev,
              materials: [...(prev?.materials || []), newMaterial]
            }));
            setNewMaterial('');
          };

          const removeMaterial = (index) => {
            setQuotationData(prev => ({
              ...prev,
              materials: prev?.materials?.filter((_, i) => i !== index)
            }));
          };

          const handleSave = () => {
            onUpdate?.(quotationData);
          };

          const getRiskColor = (risk) => {
            switch (risk) {
              case 'high': return 'text-red-600 bg-red-50';
              case 'medium': return 'text-yellow-600 bg-yellow-50';
              case 'low': return 'text-green-600 bg-green-50';
              default: return 'text-gray-600 bg-gray-50';
            }
          };

          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={16} className="text-primary" />
                <h4 className="font-medium">Desarrollo de Cotización</h4>
              </div>

              <div className="space-y-3">
                {/* Scope */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Alcance del Proyecto</label>
                  <textarea
                    value={quotationData?.scope}
                    onChange={(e) => handleInputChange('scope', e?.target?.value)}
                    placeholder="Descripción detallada del alcance..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                  />
                </div>

                {/* Timeline & Conditions */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tiempo de Ejecución</label>
                    <Input
                      value={quotationData?.timeline}
                      onChange={(e) => handleInputChange('timeline', e?.target?.value)}
                      placeholder="ej: 12 semanas"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Vigencia</label>
                    <Input
                      value={quotationData?.validity}
                      onChange={(e) => handleInputChange('validity', e?.target?.value)}
                      placeholder="30 días"
                    />
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Condiciones de Pago</label>
                  <Input
                    value={quotationData?.conditions}
                    onChange={(e) => handleInputChange('conditions', e?.target?.value)}
                    placeholder="ej: 50% anticipo, 50% contra entrega"
                  />
                </div>

                {/* Risk Assessment */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Evaluación de Riesgo</label>
                  <select
                    value={quotationData?.riskAssessment}
                    onChange={(e) => handleInputChange('riskAssessment', e?.target?.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                  >
                    <option value="low">Bajo - Proyecto estándar</option>
                    <option value="medium">Medio - Complejidad moderada</option>
                    <option value="high">Alto - Proyecto complejo</option>
                  </select>
                  <div className={`mt-1 px-2 py-1 text-xs rounded inline-block ${getRiskColor(quotationData?.riskAssessment)}`}>
                    Riesgo {quotationData?.riskAssessment === 'low' ? 'Bajo' : quotationData?.riskAssessment === 'medium' ? 'Medio' : 'Alto'}
                  </div>
                </div>

                {/* Assumptions */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Supuestos</label>
                  <div className="space-y-2">
                    {quotationData?.assumptions?.map((assumption, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm bg-muted/30 rounded px-2 py-1">
                        <Icon name="Check" size={12} className="text-green-600" />
                        <span className="flex-1">{assumption}</span>
                        <button
                          onClick={() => removeAssumption(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        value={newAssumption}
                        onChange={(e) => setNewAssumption(e?.target?.value)}
                        placeholder="Agregar supuesto..."
                        className="flex-1"
                        onKeyPress={(e) => e?.key === 'Enter' && addAssumption()}
                      />
                      <Button
                        size="sm"
                        onClick={addAssumption}
                        iconName="Plus"
                        disabled={!newAssumption?.trim()}
                      />
                    </div>
                  </div>
                </div>

                {/* Materials Checklist */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Checklist de Materiales</label>
                  <div className="space-y-2">
                    {quotationData?.materials?.map((material, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm bg-muted/30 rounded px-2 py-1">
                        <Icon name="Package" size={12} className="text-blue-600" />
                        <span className="flex-1">{material}</span>
                        <button
                          onClick={() => removeMaterial(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e?.target?.value)}
                        placeholder="Agregar material..."
                        className="flex-1"
                        onKeyPress={(e) => e?.key === 'Enter' && addMaterial()}
                      />
                      <Button
                        size="sm"
                        onClick={addMaterial}
                        iconName="Plus"
                        disabled={!newMaterial?.trim()}
                      />
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Monto Total (MXN)</label>
                  <Input
                    type="number"
                    value={quotationData?.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', parseFloat(e?.target?.value) || 0)}
                    placeholder="0.00"
                  />
                  {quotationData?.totalAmount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ${quotationData?.totalAmount?.toLocaleString('es-MX')} MXN
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  iconName="Save"
                  iconPosition="left"
                >
                  Guardar
                </Button>
                <Button
                  onClick={() => console.log('Internal review requested')}
                  iconName="Users"
                  iconPosition="left"
                >
                  Revisión Interna
                </Button>
              </div>
            </div>
          );
        };

        export default QuotationRequestPanel;