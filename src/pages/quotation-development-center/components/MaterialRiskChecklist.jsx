import React, { useState, useEffect, useMemo } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';
        import useInventory from '../../../hooks/useInventory';
        import useQuotation from '../../../hooks/useQuotation';
        import { useNotifications } from '../../../context/NotificationContext';

        const MaterialRiskChecklist = ({ quotation, onUpdate }) => {
          const { articulos, getArticulos, loading: inventoryLoading } = useInventory();
          const { updateMaterialesYRiesgos, getCotizacionById, loading: quotationLoading } = useQuotation();
          const { showSuccess, showError } = useNotifications();
          const [materials, setMaterials] = useState([]);
          const [riskAssessment, setRiskAssessment] = useState({
            overall: 'low',
            factors: [],
            extraCostsPrevention: true
          });
          const [newMaterial, setNewMaterial] = useState({ 
            item: '', 
            quantity: '', 
            cost: 0, 
            risk: 'low',
            itemCode: '',
            unit: '',
            fromInventory: false,
            inventoryItemId: null
          });
          const [newRiskFactor, setNewRiskFactor] = useState({ factor: '', risk: 'low', mitigation: '' });
          const [showInventorySelector, setShowInventorySelector] = useState(false);
          const [inventorySearch, setInventorySearch] = useState('');
          const [loadingMaterials, setLoadingMaterials] = useState(false);

          // Cargar artículos del inventario
          useEffect(() => {
            getArticulos();
          }, []);

          // Cargar materiales guardados cuando cambia la cotización
          useEffect(() => {
            async function fetchMateriales() {
              // Limpiar materiales al cambiar de cotización
              setMaterials([]);
              setRiskAssessment({
                overall: 'low',
                factors: [],
                extraCostsPrevention: true
              });

              if (!quotation?.id) return;

              setLoadingMaterials(true);
              try {
                const cotizacionCompleta = await getCotizacionById(quotation.id);
                
                // Cargar materiales si existen
                if (cotizacionCompleta?.materiales && Array.isArray(cotizacionCompleta.materiales)) {
                  setMaterials(cotizacionCompleta.materiales);
                }

                // Cargar evaluación de riesgos si existe
                if (cotizacionCompleta?.riskAssessment) {
                  setRiskAssessment(cotizacionCompleta.riskAssessment);
                }
              } catch (error) {
                console.error('Error al cargar materiales:', error);
                // Si hay error, intentar usar los datos locales del quotation prop
                if (quotation?.materials) {
                  setMaterials(quotation.materials);
                }
                if (quotation?.riskAssessment) {
                  setRiskAssessment(quotation.riskAssessment);
                }
              } finally {
                setLoadingMaterials(false);
              }
            }

            fetchMateriales();
          }, [quotation?.id]);

          // Filtrar artículos del inventario según búsqueda
          const filteredInventoryItems = useMemo(() => {
            if (!inventorySearch.trim()) return articulos;
            
            const searchLower = inventorySearch.toLowerCase();
            return articulos.filter(item => 
              item?.nombre?.toLowerCase().includes(searchLower) ||
              item?.codigo?.toLowerCase().includes(searchLower) ||
              item?.descripcion?.toLowerCase().includes(searchLower) ||
              item?.categoria?.toLowerCase().includes(searchLower)
            );
          }, [articulos, inventorySearch]);

          const handleMaterialChange = (index, field, value) => {
            const updatedMaterials = materials?.map((material, i) => 
              i === index ? { ...material, [field]: value } : material
            );
            setMaterials(updatedMaterials);
          };

          // Seleccionar un artículo del inventario
          const handleSelectInventoryItem = (item) => {
            setNewMaterial({
              item: item.nombre || '',
              itemCode: item.codigo || '',
              quantity: '1',
              cost: item.costoUnitario || 0,
              unit: item.unidad || '',
              risk: 'low',
              fromInventory: true,
              inventoryItemId: item.id
            });
            setShowInventorySelector(false);
            setInventorySearch('');
          };

          const addMaterial = () => {
            if (!newMaterial?.item?.trim() || !newMaterial?.quantity?.trim()) return;
            
            setMaterials(prev => [...prev, { 
              ...newMaterial, 
              id: Date.now(),
              addedAt: new Date().toISOString()
            }]);
            setNewMaterial({ 
              item: '', 
              quantity: '', 
              cost: 0, 
              risk: 'low',
              itemCode: '',
              unit: '',
              fromInventory: false,
              inventoryItemId: null
            });
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

          const handleSave = async () => {
            try {
              // Guardar en el backend si existe el ID de cotización
              if (quotation?.id) {
                const dataToSave = {
                  materiales: materials,
                  riskAssessment: {
                    ...riskAssessment,
                    overall: calculateOverallRisk()
                  }
                };
                
                await updateMaterialesYRiesgos(quotation.id, dataToSave);
                showSuccess('Materiales y evaluación de riesgos guardados exitosamente');
              }
              
              // También llamar al onUpdate para actualizar el estado local
              onUpdate?.({ 
                materials, 
                riskAssessment: {
                  ...riskAssessment,
                  overall: calculateOverallRisk()
                }
              });
            } catch (error) {
              console.error('Error guardando materiales:', error);
              showError('Error al guardar los materiales');
            }
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

          // Mostrar loading mientras se cargan los materiales
          if (loadingMaterials) {
            return (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando materiales...</p>
                </div>
              </div>
            );
          }

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
                    disabled={quotationLoading}
                  >
                    {quotationLoading ? 'Guardando...' : 'Guardar Checklist'}
                  </Button>
                </div>
              </div>

              {/* Materials Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Package" size={20} className="text-primary" />
                    <h4 className="text-lg font-medium">Lista de Materiales</h4>
                    <div className="text-sm text-muted-foreground">
                      Total: ${totalCost?.toLocaleString('es-MX')} MXN
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInventorySelector(!showInventorySelector)}
                    iconName="Search"
                    iconPosition="left"
                  >
                    Buscar en Inventario
                  </Button>
                </div>

                {/* Inventory Selector Modal */}
                {showInventorySelector && (
                  <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Seleccionar del Inventario</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowInventorySelector(false);
                          setInventorySearch('');
                        }}
                        iconName="X"
                      />
                    </div>
                    
                    <Input
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Buscar por nombre, código, categoría..."
                      className="mb-3"
                    />

                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {inventoryLoading ? (
                        <p className="text-center text-muted-foreground py-4">Cargando inventario...</p>
                      ) : filteredInventoryItems.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No se encontraron artículos</p>
                      ) : (
                        filteredInventoryItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectInventoryItem(item)}
                            className="p-3 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{item.nombre}</span>
                                  <span className="text-xs px-2 py-0.5 bg-muted rounded">
                                    {item.codigo}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {item.descripcion}
                                </p>
                                <div className="flex items-center space-x-3 mt-2 text-xs">
                                  <span className="text-muted-foreground">
                                    <span className="font-medium">Stock:</span> {item.stockActual} {item.unidad}
                                  </span>
                                  <span className="text-muted-foreground">
                                    <span className="font-medium">Costo:</span> ${item.costoUnitario?.toLocaleString('es-MX')} MXN
                                  </span>
                                  <span className="text-muted-foreground">
                                    <span className="font-medium">Categoría:</span> {item.categoria}
                                  </span>
                                </div>
                              </div>
                              <Icon name="Plus" size={16} className="text-primary ml-2" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Código</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Material/Equipo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Cantidad</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Unidad</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Costo (MXN)</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Subtotal</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Riesgo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Origen</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials?.map((material, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="px-4 py-3">
                              <span className="text-xs text-muted-foreground">
                                {material?.itemCode || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={material?.item}
                                  onChange={(e) => handleMaterialChange(index, 'item', e?.target?.value)}
                                  placeholder="Descripción del material"
                                  size="sm"
                                />
                                {material?.fromInventory && (
                                  <Icon name="Package" size={14} className="text-green-600" title="Del inventario" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={material?.quantity}
                                onChange={(e) => handleMaterialChange(index, 'quantity', e?.target?.value)}
                                placeholder="0"
                                size="sm"
                                className="w-20"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={material?.unit || ''}
                                onChange={(e) => handleMaterialChange(index, 'unit', e?.target?.value)}
                                placeholder="pcs"
                                size="sm"
                                className="w-20"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={material?.cost}
                                onChange={(e) => handleMaterialChange(index, 'cost', parseFloat(e?.target?.value) || 0)}
                                placeholder="0.00"
                                size="sm"
                                className="w-28"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium">
                                ${((parseFloat(material?.quantity) || 0) * (material?.cost || 0)).toLocaleString('es-MX')}
                              </span>
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
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                material?.fromInventory 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {material?.fromInventory ? 'Inventario' : 'Manual'}
                              </span>
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
                              value={newMaterial?.itemCode}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, itemCode: e?.target?.value }))}
                              placeholder="Código"
                              size="sm"
                              disabled={newMaterial?.fromInventory}
                            />
                          </td>
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
                              type="number"
                              value={newMaterial?.quantity}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e?.target?.value }))}
                              placeholder="0"
                              size="sm"
                              className="w-20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={newMaterial?.unit}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e?.target?.value }))}
                              placeholder="pcs"
                              size="sm"
                              className="w-20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={newMaterial?.cost}
                              onChange={(e) => setNewMaterial(prev => ({ ...prev, cost: parseFloat(e?.target?.value) || 0 }))}
                              placeholder="0.00"
                              size="sm"
                              className="w-28"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium">
                              ${((parseFloat(newMaterial?.quantity) || 0) * (newMaterial?.cost || 0)).toLocaleString('es-MX')}
                            </span>
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
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              newMaterial?.fromInventory 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {newMaterial?.fromInventory ? 'Inventario' : 'Manual'}
                            </span>
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