import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const ClientCommunication = ({ quotation, onAddCommunication }) => {
          const [newCommunication, setNewCommunication] = useState({
            type: 'email',
            subject: '',
            content: '',
            urgency: 'normal',
            hasAttachments: false,
            attachments: []
          });

          const [showHistory, setShowHistory] = useState(true);

          const handleInputChange = (field, value) => {
            setNewCommunication(prev => ({ ...prev, [field]: value }));
          };

          const handleSendCommunication = () => {
            if (!newCommunication?.subject?.trim() || !newCommunication?.content?.trim()) return;

            onAddCommunication?.(newCommunication);
            setNewCommunication({
              type: 'email',
              subject: '',
              content: '',
              urgency: 'normal',
              hasAttachments: false,
              attachments: []
            });
          };

          const handleQuotationSend = () => {
            const quotationComm = {
              type: 'email',
              subject: `Cotización ${quotation?.id} - ${quotation?.projectName}`,
              content: `Estimado cliente,\n\nAdjunto encontrará la cotización solicitada para el proyecto "${quotation?.projectName}".\n\nQuedamos a su disposición para cualquier aclaración.\n\nSaludos cordiales,\n${quotation?.assignedTo}\nAireFlow Pro`,
              urgency: 'high',
              hasAttachments: true,
              attachments: [`Cotizacion_${quotation?.id}.pdf`]
            };

            onAddCommunication?.(quotationComm);
          };

          const getUrgencyColor = (urgency) => {
            switch (urgency) {
              case 'urgent': return 'text-red-600 bg-red-50';
              case 'high': return 'text-orange-600 bg-orange-50';
              case 'normal': return 'text-blue-600 bg-blue-50';
              default: return 'text-gray-600 bg-gray-50';
            }
          };

          const getTypeIcon = (type) => {
            switch (type) {
              case 'whatsapp': return 'MessageCircle';
              case 'email': return 'Mail';
              case 'phone': return 'Phone';
              default: return 'MessageSquare';
            }
          };

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Comunicación con Cliente</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleQuotationSend}
                    iconName="Send"
                    iconPosition="left"
                  >
                    Enviar Cotización
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    iconName={showHistory ? 'EyeOff' : 'Eye'}
                    iconPosition="left"
                  >
                    {showHistory ? 'Ocultar' : 'Ver'} Historial
                  </Button>
                </div>
              </div>

              {/* Communication History */}
              {showHistory && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Icon name="History" size={16} />
                    <span>Historial de Comunicaciones</span>
                  </h4>
                  
                  <div className="max-h-96 overflow-y-auto space-y-3 bg-muted/20 rounded-lg p-4">
                    {quotation?.communications?.map((comm) => (
                      <div key={comm?.id} className="bg-white rounded-lg p-4 border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon name={getTypeIcon(comm?.type)} size={16} className="text-muted-foreground" />
                            <span className="font-medium text-sm">{comm?.subject}</span>
                            <span className={`px-2 py-1 text-xs rounded ${getUrgencyColor(comm?.urgency)}`}>
                              {comm?.urgency === 'urgent' ? 'Urgente' : comm?.urgency === 'high' ? 'Alta' : 'Normal'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{comm?.date}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{comm?.content}</p>
                        {comm?.attachments && comm?.attachments?.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                            <div className="flex flex-wrap gap-1">
                              {comm?.attachments?.map((attachment, index) => (
                                <span key={index} className="text-xs bg-muted rounded px-2 py-1">
                                  {attachment}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(!quotation?.communications || quotation?.communications?.length === 0) && (
                      <div className="text-center py-8">
                        <Icon name="Inbox" size={32} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sin comunicaciones registradas</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* New Communication Form */}
              <div className="bg-card border rounded-lg p-6">
                <h4 className="font-medium mb-4 flex items-center space-x-2">
                  <Icon name="Edit3" size={16} />
                  <span>Nueva Comunicación</span>
                </h4>
                
                <div className="space-y-4">
                  {/* Communication Type and Urgency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Canal de Comunicación</label>
                      <select
                        value={newCommunication?.type}
                        onChange={(e) => handleInputChange('type', e?.target?.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                      >
                        <option value="email">Correo Electrónico</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Llamada Telefónica</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nivel de Urgencia</label>
                      <select
                        value={newCommunication?.urgency}
                        onChange={(e) => handleInputChange('urgency', e?.target?.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                      >
                        <option value="normal">Normal</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Asunto</label>
                    <Input
                      value={newCommunication?.subject}
                      onChange={(e) => handleInputChange('subject', e?.target?.value)}
                      placeholder="Asunto de la comunicación"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mensaje</label>
                    <textarea
                      value={newCommunication?.content}
                      onChange={(e) => handleInputChange('content', e?.target?.value)}
                      placeholder="Escribir mensaje al cliente..."
                      rows={6}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                    />
                  </div>

                  {/* Attachments */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="has-attachments"
                      checked={newCommunication?.hasAttachments}
                      onChange={(e) => handleInputChange('hasAttachments', e?.target?.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="has-attachments" className="text-sm">
                      Incluir anexos (cotización, cronograma, etc.)
                    </label>
                  </div>

                  {/* Quick Templates */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plantillas Rápidas</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange('subject', 'Solicitud de aclaraciones técnicas');
                          handleInputChange('content', 'Estimado cliente,\n\nPara elaborar la cotización más precisa, necesitamos algunas aclaraciones técnicas adicionales:\n\n1. \n2. \n3. \n\nQuedamos en espera de su respuesta.\n\nSaludos cordiales.');
                        }}
                        className="text-xs"
                      >
                        Solicitar Aclaraciones
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange('subject', 'Seguimiento de cotización');
                          handleInputChange('content', 'Estimado cliente,\n\nEsperamos que se encuentre bien. Nos ponemos en contacto para dar seguimiento a la cotización enviada.\n\n¿Ha tenido oportunidad de revisar nuestra propuesta?\n\nQuedamos a su disposición para cualquier duda o aclaración.\n\nSaludos cordiales.');
                        }}
                        className="text-xs"
                      >
                        Seguimiento
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange('subject', 'Confirmación de costos adicionales');
                          handleInputChange('content', 'Estimado cliente,\n\nDespués de la revisión técnica, hemos identificado algunos trabajos adicionales necesarios:\n\n[Descripción del trabajo adicional]\nCosto adicional: $XXX MXN\nTiempo adicional: XX días\n\nSolicito su confirmación para proceder.\n\nSaludos cordiales.');
                        }}
                        className="text-xs"
                      >
                        Confirmar Extras
                      </Button>
                    </div>
                  </div>

                  {/* Send Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Cliente: {quotation?.clientName} - {quotation?.contactInfo?.email}
                    </div>
                    <Button
                      onClick={handleSendCommunication}
                      disabled={!newCommunication?.subject?.trim() || !newCommunication?.content?.trim()}
                      iconName="Send"
                      iconPosition="left"
                    >
                      Enviar Comunicación
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default ClientCommunication;