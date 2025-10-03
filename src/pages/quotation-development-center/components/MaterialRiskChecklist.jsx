import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const MaterialRiskChecklist = ({ quotation, onUpdate }) => {
          const [materials, setMaterials] = useState(quotation?.materials || []);
          const [riskAssessment, setRiskAssessment] = useState(quotation?.riskAssessment || {
            overall: 'low',
            factors: [],
            extraCostsPrevention: true
          });
          const [newMaterial, setNewMaterial] = useState({ item: '', quantity: '', cost: 0, risk: 'low' });
          const [newRiskFactor, setNewRiskFactor] = useState({ factor: '', risk: 'low', mitigation: '' });

          const handleMaterialChange = (index, field, value) => {
            const updatedMaterials = materials?.map((material, i) => 
              i === index ? { ...material, [field]: value } : material
            );
            setMaterials(updatedMaterials);
          };

          const addMaterial = () => {
            if (!newMaterial?.item?.trim() || !newMaterial?.quantity?.trim()) return;
            
            setMaterials(prev => [...prev, { ...newMaterial, id: Date.now() }]);
            setNewMaterial({ item: '', quantity: '', cost: 0, risk: 'low' });
          };

          const removeMaterial = (index) => {
            setMaterials(prev => prev?.filter((_, i) => i !== index));
          };

          const addRiskFactor = () => {
            if (!newRiskFactor?.factor?.trim()) return;
            
            setRiskAssessment(prev => ({
              ...prev,
              factors: [...(prev?.factors || []), { ...newRiskFactor, id: Date.now() }]
            }));
            setNewRiskFactor({ factor: '', risk: 'low', mitigation: '' });
          };

          const removeRiskFactor = (index) => {
            setRiskAssessment(prev => ({
              ...prev,
              factors: prev?.factors?.filter((_, i) => i !== index)
            }));
          };

          const handleSave = () => {
            onUpdate?.({ 
              materials, 
              riskAssessment: {
                ...riskAssessment,
                overall: calculateOverallRisk()
              }
            });
          };

          const calculateOverallRisk = () => {
            const highRiskMaterials = materials?.filter(m => m?.risk === 'high')?.length || 0;
            const highRiskFactors = riskAssessment?.factors?.filter(f => f?.risk === 'high')?.length || 0;
            
            if (highRiskMaterials > 0 || highRiskFactors > 0) return 'high';
            
            const mediumRiskMaterials = materials?.filter(m => m?.risk === 'medium')?.length || 0;
            const mediumRiskFactors = riskAssessment?.factors?.filter(f => f?.risk === 'medium')?.length || 0;
            
            if (mediumRiskMaterials > 0 || mediumRiskFactors > 0) return 'medium';
            
            return 'low';
          };

          const getRiskColor = (risk) => {
            switch (risk) {
              case 'high': return 'text-red-600 bg-red-50 border-red-200';
              case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
              case 'low': return 'text-green-600 bg-green-50 border-green-200';
              default: return 'text-gray-600 bg-gray-50 border-gray-200';
            }
          };

          const totalCost = materials?.reduce((sum, material) => sum + (material?.cost || 0), 0);

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Checklist de Materiales y Riesgos</h3>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 text-sm rounded-full border ${getRiskColor(calculateOverallRisk())}`}>
                    Riesgo General: {calculateOverallRisk() === 'high' ? 'Alto' : calculateOverallRisk() === 'medium' ? 'Medio' : 'Bajo'}
                  </div>
                  <Button
                    onClick={handleSave}
                    iconName="Save"
                    iconPosition="left"
                  >
                    Guardar Checklist
                  </Button>
                </div>
              </div>

              {/* Materials Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Package" size={20} className="text-primary" />
                  <h4 className="text-lg font-medium">Lista de Materiales</h4>
                  <div className="text-sm text-muted-foreground">
                    Total: ${totalCost?.toLocaleString('es-MX')} MXN
                  </div>
                </div>

                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Material/Equipo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Cantidad</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Costo (MXN)</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Riesgo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials?.map((material, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="px-4 py-3">
                              <Input
                                value={material?.item}
                                onChange={(e) => handleMaterialChange(index, 'item', e?.target?.value)}
                                placeholder="Descripción del material"
                                size="sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={material?.quantity}
                                onChange={(e) => handleMaterialChange(index, 'quantity', e?.target?.value)}
                                placeholder="ej: 10 piezas"
                                size="sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={material?.cost}
                                onChange={(e) => handleMaterialChange(index, 'cost', parseFloat(e?.target?.value) || 0)}
                                placeholder="0.00"
                                size="sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={material?.risk}
                                onChange={(e) => handleMaterialChange(index, 'risk', e?.target?.value)}
                                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                              >
                                <option value="low">Bajo</option>
                                <option value="medium">Medio</option>
                                <option value="high">Alto</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMaterial(index)}
                                iconName="Trash2"
                                className="text-red-600"
                              />
                            </td>
                          </tr>
                        ))}
                        
                        {/* Add New Material Row */}
                        <tr className="border-t border-border bg-muted/20">
                          <td className="px-4 py-3">
                            <Input
                              value={newMaterial?.item}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, item: e?.target?.value }))}
                              placeholder="Nuevo material..."
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={newMaterial?.quantity}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e?.target?.value }))}
                              placeholder="Cantidad"
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={newMaterial?.cost}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, cost: parseFloat(e?.target?.value) || 0 }))}
                              placeholder="0.00"
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={newMaterial?.risk}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, risk: e?.target?.value }))}
                              className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                            >
                              <option value="low">Bajo</option>
                              <option value="medium">Medio</option>
                              <option value="high">Alto</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              onClick={addMaterial}
                              iconName="Plus"
                              disabled={!newMaterial?.item?.trim()}
                            >
                              Agregar
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Risk Factors Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertTriangle" size={20} className="text-primary" />
                  <h4 className="text-lg font-medium">Factores de Riesgo</h4>
                </div>

                <div className="space-y-3">
                  {riskAssessment?.factors?.map((factor, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getRiskColor(factor?.risk)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon name="AlertCircle" size={16} />
                            <h5 className="font-medium">{factor?.factor}</h5>
                            <span className="text-xs px-2 py-1 rounded-full bg-current/20">
                              Riesgo {factor?.risk === 'high' ? 'Alto' : factor?.risk === 'medium' ? 'Medio' : 'Bajo'}
                            </span>
                          </div>
                          <p className="text-sm">{factor?.mitigation}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRiskFactor(index)}
                          iconName="X"
                          className="text-red-600"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add New Risk Factor */}
                  <div className="p-4 border border-dashed border-border rounded-lg">
                    <div className="space-y-3">
                      <Input
                        value={newRiskFactor?.factor}
                        onChange={(e) => setNewRiskFactor(prev => ({ ...prev, factor: e?.target?.value }))}
                        placeholder="Factor de riesgo (ej: Disponibilidad de materiales)"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={newRiskFactor?.risk}
                          onChange={(e) => setNewRiskFactor(prev => ({ ...prev, risk: e?.target?.value }))}
                          className="px-3 py-2 text-sm border border-border rounded-md bg-background"
                        >
                          <option value="low">Riesgo Bajo</option>
                          <option value="medium">Riesgo Medio</option>
                          <option value="high">Riesgo Alto</option>
                        </select>
                        <Button
                          onClick={addRiskFactor}
                          disabled={!newRiskFactor?.factor?.trim()}
                          iconName="Plus"
                          iconPosition="left"
                          size="sm"
                        >
                          Agregar Factor
                        </Button>
                      </div>
                      <Input
                        value={newRiskFactor?.mitigation}
                        onChange={(e) => setNewRiskFactor(prev => ({ ...prev, mitigation: e?.target?.value }))}
                        placeholder="Plan de mitigación"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Prevention Tools */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="Shield" size={20} className="text-green-600" />
                  <h4 className="font-medium text-green-800">Prevención de Costos Extra</h4>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="prevention-enabled"
                    checked={riskAssessment?.extraCostsPrevention}
                    onChange={(e) => setRiskAssessment(prev => ({ ...prev, extraCostsPrevention: e?.target?.checked }))}
                    className="rounded border-border"
                  />
                  <label htmlFor="prevention-enabled" className="text-sm text-green-800">
                    Sistema de prevención de costos extra activado
                  </label>
                </div>
                <p className="text-sm text-green-700">
                  El checklist de materiales y evaluación de riesgos ayuda a identificar posibles costos adicionales antes de la finalización de la cotización.
                </p>
              </div>
            </div>
          );
        };

        export default MaterialRiskChecklist;