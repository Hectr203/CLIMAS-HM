import React, { useState } from 'react';
import useQuotation from '../../../hooks/useQuotation';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const QuotationBuilder = ({ quotation, onUpdate, onAddRevision }) => {
          const { crearConstructor } = useQuotation();
          const [formData, setFormData] = useState({
            scope: quotation?.quotationData?.scope || '',
            assumptions: quotation?.quotationData?.assumptions || [],
            timeline: quotation?.quotationData?.timeline || '',
            conditions: quotation?.quotationData?.conditions || '',
            warranty: quotation?.quotationData?.warranty || '',
            totalAmount: quotation?.quotationData?.totalAmount || 0,
            validity: quotation?.quotationData?.validity || '30 días'
          });

          const [newAssumption, setNewAssumption] = useState('');
          const [hasChanges, setHasChanges] = useState(false);

          const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            setHasChanges(true);
          };

          const addAssumption = () => {
            if (!newAssumption?.trim()) return;
            const newAssumptions = [...(formData?.assumptions || []), newAssumption];
            setFormData(prev => ({ ...prev, assumptions: newAssumptions }));
            setNewAssumption('');
            setHasChanges(true);
          };

          const removeAssumption = (index) => {
            const newAssumptions = formData?.assumptions?.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, assumptions: newAssumptions }));
            setHasChanges(true);
          };

          const handleSave = async () => {
            onUpdate?.({ quotationData: formData });
            // Guardar en el backend usando el endpoint constructor/crear
            const payload = {
              Constructor: {
                cotizacionId: quotation?.id, // id de Cosmos
                Folio: quotation?.folio || quotation?.id, // folio
                alcance: formData?.scope,
                condiciones_pago: formData?.conditions,
                supuestos: formData?.assumptions,
                garantia: formData?.warranty,
                monto_total: formData?.totalAmount,
                tiempo_ejecucion: formData?.timeline,
                vigencia: formData?.validity
              }
            };
            try {
              await crearConstructor(payload);
              alert('Constructor guardado exitosamente');
            } catch (err) {
              alert('Error al guardar el constructor');
            }
            setHasChanges(false);
          };

          const handleCreateRevision = () => {
            const revision = {
              changes: "Actualización de alcance y condiciones",
              author: quotation?.assignedTo || "Usuario Actual"
            };
            onAddRevision?.(revision);
            setHasChanges(false);
          };

          const handleSaveConstructor = async () => {
            const payload = {
              Constructor: {
                cotizacionId: quotation?.id,
                Folio: quotation?.id,
                alcance: formData?.scope,
                condiciones_pago: formData?.conditions,
                supuestos: formData?.assumptions,
                garantia: formData?.warranty,
                monto_total: formData?.totalAmount,
                tiempo_ejecucion: formData?.timeline,
                vigencia: formData?.validity
              }
            };
            try {
              const res = await crearConstructor(payload);
              console.log('Constructor guardado:', res);
              alert('Constructor guardado exitosamente');
            } catch (err) {
              alert('Error al guardar el constructor');
            }
          };

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{quotation?.projectName}</h3>
                  <p className="text-muted-foreground">{quotation?.clientName} - {quotation?.folio}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {hasChanges && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Cambios sin guardar
                    </span>
                  )}
                  {/* Botón gris superior para guardar */}
                  <button
                    className="text-muted-foreground flex items-center space-x-1"
                    style={{ background: 'none', border: 'none', cursor: hasChanges ? 'pointer' : 'not-allowed', fontSize: '16px', padding: 0 }}
                    onClick={hasChanges ? handleSave : undefined}
                    disabled={!hasChanges}
                  >
                    <Icon name="Save" size={20} />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Scope Definition */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Definición de Alcance</label>
                    <textarea
                      value={formData?.scope}
                      onChange={(e) => handleInputChange('scope', e?.target?.value)}
                      placeholder="Descripción detallada del alcance del proyecto..."
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                    />
                  </div>

                  {/* Assumptions */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Supuestos del Proyecto</label>
                    <div className="space-y-2">
                      {formData?.assumptions?.map((assumption, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-muted/30 rounded">
                          <Icon name="Check" size={14} className="text-green-600 mt-0.5" />
                          <span className="flex-1 text-sm">{assumption}</span>
                          <button
                            onClick={() => removeAssumption(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Icon name="X" size={14} />
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

                  {/* Timeline and Validity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tiempo de Ejecución</label>
                      <Input
                        value={formData?.timeline}
                        onChange={(e) => handleInputChange('timeline', e?.target?.value)}
                        placeholder="ej: 16 semanas"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Vigencia</label>
                      <Input
                        value={formData?.validity}
                        onChange={(e) => handleInputChange('validity', e?.target?.value)}
                        placeholder="30 días"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Payment Conditions */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Condiciones de Pago</label>
                    <textarea
                      value={formData?.conditions}
                      onChange={(e) => handleInputChange('conditions', e?.target?.value)}
                      placeholder="ej: 50% anticipo, 25% avance 50%, 25% finalización"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                    />
                  </div>

                  {/* Warranty */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Garantía</label>
                    <Input
                      value={formData?.warranty}
                      onChange={(e) => handleInputChange('warranty', e?.target?.value)}
                      placeholder="ej: 24 meses en equipos, 12 meses en instalación"
                    />
                  </div>

                  {/* Total Amount */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Monto Total (MXN)</label>
                    <Input
                      type="number"
                      value={formData?.totalAmount}
                      onChange={(e) => handleInputChange('totalAmount', parseFloat(e?.target?.value) || 0)}
                      placeholder="0.00"
                    />
                    {formData?.totalAmount > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${formData?.totalAmount?.toLocaleString('es-MX')} MXN
                      </p>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plantillas Rápidas</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('conditions', '50% anticipo, 50% contra entrega')}
                        className="text-xs"
                      >
                        Pago 50/50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('warranty', '24 meses equipos, 12 meses instalación')}
                        className="text-xs"
                      >
                        Garantía Estándar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('validity', '45 días')}
                        className="text-xs"
                      >
                        Vigencia 45 días
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAssumption('Acceso libre durante horario laboral')}
                        className="text-xs"
                      >
                        Acceso Estándar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Icon name="Info" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Última actualización: {quotation?.lastModified}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCreateRevision}
                    iconName="GitBranch"
                    iconPosition="left"
                  >
                    Crear Revisión
                  </Button>
                  <Button
                    onClick={() => console.log('Submit for internal review')}
                    iconName="Users"
                    iconPosition="left"
                  >
                    Enviar a Revisión
                  </Button>
                  {/* Eliminar el botón azul de Guardar aquí */}
                </div>
              </div>
            </div>
          );
        };

        export default QuotationBuilder;