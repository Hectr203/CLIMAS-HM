import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const ChangeManagementPanel = ({ opportunity, onRequestChange }) => {
          const [changeRequest, setChangeRequest] = useState({
            type: 'scope',
            description: '',
            commercialImpact: {
              cost: 0,
              time: '',
              hasImpact: false
            },
            justification: '',
            urgency: 'normal'
          });

          const [showHistory, setShowHistory] = useState(false);

          const handleInputChange = (field, value) => {
            setChangeRequest(prev => ({ ...prev, [field]: value }));
          };

          const handleImpactChange = (field, value) => {
            setChangeRequest(prev => ({
              ...prev,
              commercialImpact: { ...prev?.commercialImpact, [field]: value }
            }));
          };

          const handleSubmitChange = () => {
            if (!changeRequest?.description?.trim()) return;

            const change = {
              id: `change-${Date.now()}`,
              ...changeRequest,
              requestedDate: new Date()?.toISOString()?.split('T')?.[0],
              status: 'pending'
            };

            onRequestChange?.(change);
            setChangeRequest({
              type: 'scope',
              description: '',
              commercialImpact: { cost: 0, time: '', hasImpact: false },
              justification: '',
              urgency: 'normal'
            });
          };

          const getImpactColor = (hasImpact) => {
            return hasImpact ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50';
          };

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-primary" />
                  <h4 className="font-medium">Gestión de Cambios</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  iconName={showHistory ? 'ChevronUp' : 'ChevronDown'}
                >
                  Historial
                </Button>
              </div>

              {/* Change History */}
              {showHistory && (
                <div className="max-h-48 overflow-y-auto space-y-2 bg-muted/30 rounded-lg p-3">
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Sin cambios registrados</p>
                  </div>
                </div>
              )}

              {/* New Change Request */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de Cambio</label>
                    <select
                      value={changeRequest?.type}
                      onChange={(e) => handleInputChange('type', e?.target?.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="scope">Alcance</option>
                      <option value="time">Tiempo</option>
                      <option value="cost">Costo</option>
                      <option value="technical">Técnico</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Urgencia</label>
                    <select
                      value={changeRequest?.urgency}
                      onChange={(e) => handleInputChange('urgency', e?.target?.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Descripción del Cambio</label>
                  <textarea
                    value={changeRequest?.description}
                    onChange={(e) => handleInputChange('description', e?.target?.value)}
                    placeholder="Describir el cambio solicitado por el cliente..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Justificación</label>
                  <textarea
                    value={changeRequest?.justification}
                    onChange={(e) => handleInputChange('justification', e?.target?.value)}
                    placeholder="Justificación técnica o comercial del cambio..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                  />
                </div>

                {/* Commercial Impact Assessment */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon name="TrendingUp" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Evaluación de Impacto Comercial</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="has-impact"
                        checked={changeRequest?.commercialImpact?.hasImpact}
                        onChange={(e) => handleImpactChange('hasImpact', e?.target?.checked)}
                        className="rounded border-border"
                      />
                      <label htmlFor="has-impact" className="text-sm">Tiene impacto comercial</label>
                    </div>

                    {changeRequest?.commercialImpact?.hasImpact && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Impacto en Costo (MXN)</label>
                          <Input
                            type="number"
                            value={changeRequest?.commercialImpact?.cost}
                            onChange={(e) => handleImpactChange('cost', parseFloat(e?.target?.value) || 0)}
                            placeholder="0.00"
                            size="sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Impacto en Tiempo</label>
                          <Input
                            value={changeRequest?.commercialImpact?.time}
                            onChange={(e) => handleImpactChange('time', e?.target?.value)}
                            placeholder="ej: +2 semanas"
                            size="sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className={`px-2 py-1 text-xs rounded inline-block ${getImpactColor(changeRequest?.commercialImpact?.hasImpact)}`}>
                      {changeRequest?.commercialImpact?.hasImpact ? 'Con impacto comercial' : 'Sin impacto comercial'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleSubmitChange}
                  disabled={!changeRequest?.description?.trim()}
                  iconName="Send"
                  iconPosition="left"
                  size="sm"
                >
                  Levantar Cambio
                </Button>
                <Button
                  variant="outline"
                  // console.log eliminado
                  iconName="CheckCircle"
                  iconPosition="left"
                  size="sm"
                >
                  Solicitar Aprobación
                </Button>
              </div>

              {/* Change Process Info */}
              <div className="bg-muted/30 rounded-lg p-3">
                <h5 className="text-sm font-medium mb-2">Proceso de Cambios</h5>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>1. Levantar cambio con impacto comercial</p>
                  <p>2. Comunicar ajuste al cliente</p>
                  <p>3. Solicitar aprobación formal</p>
                  <p>4. Registrar adenda y notificar internamente</p>
                </div>
              </div>
            </div>
          );
        };

        export default ChangeManagementPanel;