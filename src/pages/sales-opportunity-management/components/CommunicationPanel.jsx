import React, { useState } from 'react';
import useCommunication from '../../../hooks/useCommunication';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        

        const CommunicationPanel = ({ opportunity, onAddCommunication }) => {
          const { createCommunication, loading, error, success } = useCommunication();
          const [newCommunication, setNewCommunication] = useState({
            type: 'whatsapp',
            content: '',
            urgency: 'normal',
            hasAttachments: false
          });

          const [showHistory, setShowHistory] = useState(false);
          const [localHistory, setLocalHistory] = useState(opportunity?.communications || []);

          const handleInputChange = (field, value) => {
            setNewCommunication(prev => ({ ...prev, [field]: value }));
          };

          const handleAddCommunication = async () => {
            if (!newCommunication?.content?.trim()) return;

            // Mapea los datos al formato del backend
            const commData = {
              id: `${Date.now()}`,
              tipoComunicacion: newCommunication?.type || 'whatsapp',
              nivelUrgencia: newCommunication?.urgency === 'urgent' ? 'alta' : 'normal',
              asunto: 'Comunicación automática',
              mensaje: newCommunication?.content,
              destinatario: opportunity?.clientId || opportunity?.clienteId || 'cliente777',
              medioDifusion: newCommunication?.type || 'whatsapp',
              estado: 'pendiente',
              fechaCreacion: new Date()?.toISOString(),
              creadoPor: 'test-user',
              indicadorUrgencia: newCommunication?.urgency === 'urgent' ? 'Alta🟡' : 'Normal🟢',
            };

            await createCommunication(commData);
            // Actualiza el historial local
            setLocalHistory(prev => [
              {
                id: commData.id,
                type: commData.tipoComunicacion,
                date: commData.fechaCreacion.split('T')[0],
                content: commData.mensaje,
                urgency: commData.nivelUrgencia === 'alta' ? 'urgent' : 'normal',
              },
              ...prev
            ]);
            setNewCommunication({ type: 'whatsapp', content: '', urgency: 'normal', hasAttachments: false });
          };

          const getUrgencyColor = (urgency) => {
            switch (urgency) {
              case 'urgent': return 'text-red-600 bg-red-50';
              case 'normal': return 'text-blue-600 bg-blue-50';
              default: return 'text-gray-600 bg-gray-50';
            }
          };

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="MessageSquare" size={16} className="text-primary" />
                  <h4 className="font-medium">Comunicación con Cliente</h4>
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

              {/* Communication History */}
              {showHistory && (
                <div className="max-h-48 overflow-y-auto space-y-2 bg-muted/30 rounded-lg p-3">
                  {localHistory.map((comm) => (
                    <div key={comm?.id} className="flex items-start space-x-2 text-sm">
                      <Icon 
                        name={comm?.type === 'whatsapp' ? 'MessageCircle' : 'Mail'} 
                        size={14} 
                        className="text-muted-foreground mt-0.5" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">{comm?.date}</span>
                          <span className={`px-2 py-1 text-xs rounded ${getUrgencyColor(comm?.urgency)}`}>
                            {comm?.urgency === 'urgent' ? 'Urgente' : 'Normal'}
                          </span>
                        </div>
                        <p className="text-foreground mt-1">{comm?.content}</p>
                      </div>
                    </div>
                  ))}
                  {localHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Sin comunicaciones registradas</p>
                  )}
                </div>
              )}

              {/* New Communication */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Canal</label>
                    <select
                      value={newCommunication?.type}
                      onChange={(e) => handleInputChange('type', e?.target?.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Correo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Urgencia</label>
                    <select
                      value={newCommunication?.urgency}
                      onChange={(e) => handleInputChange('urgency', e?.target?.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Mensaje</label>
                  <textarea
                    value={newCommunication?.content}
                    onChange={(e) => handleInputChange('content', e?.target?.value)}
                    placeholder="Escribir comunicación con el cliente..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="attachments"
                    checked={newCommunication?.hasAttachments}
                    onChange={(e) => handleInputChange('hasAttachments', e?.target?.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="attachments" className="text-sm">Incluye anexos</label>
                </div>

                <Button
                  onClick={handleAddCommunication}
                  disabled={!newCommunication?.content?.trim() || loading}
                  className="w-full"
                  iconName="Send"
                  iconPosition="left"
                >
                  {loading ? 'Enviando...' : 'Enviar Comunicación'}
                </Button>
                {error && <div className="text-xs text-destructive mt-2">Error al enviar comunicación</div>}
                {success && <div className="text-xs text-green-600 mt-2">Comunicación enviada correctamente</div>}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Acciones Rápidas</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('content', 'Solicitar aclaraciones técnicas mínimas')}
                    className="text-xs"
                  >
                    Solicitar Aclaraciones
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('content', 'Confirmar costo extra por escrito')}
                    className="text-xs"
                  >
                    Confirmar Costos Extra
                  </Button>
                </div>
              </div>
            </div>
          );
        };

        export default CommunicationPanel;