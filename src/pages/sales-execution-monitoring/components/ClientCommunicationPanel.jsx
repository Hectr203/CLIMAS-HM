import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ClientCommunicationPanel = ({ project, onAddCommunication }) => {
  const [newCommunication, setNewCommunication] = useState({
    type: 'email',
    content: '',
    urgency: 'normal',
    participants: []
  });
  
  const [participantInput, setParticipantInput] = useState('');

  const handleAddParticipant = () => {
    if (participantInput?.trim() && !newCommunication?.participants?.includes(participantInput?.trim())) {
      setNewCommunication(prev => ({
        ...prev,
        participants: [...prev?.participants, participantInput?.trim()]
      }));
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (participant) => {
    setNewCommunication(prev => ({
      ...prev,
      participants: prev?.participants?.filter(p => p !== participant)
    }));
  };

  const handleSubmit = () => {
    if (!newCommunication?.content?.trim()) return;

    const communication = {
      id: `comm-${Date.now()}`,
      type: newCommunication?.type,
      date: new Date()?.toISOString()?.split('T')?.[0],
      content: newCommunication?.content,
      participants: newCommunication?.participants?.length > 0 ? newCommunication?.participants : [project?.clientContact?.name],
      urgency: newCommunication?.urgency,
      timestamp: new Date()?.toISOString()
    };

    onAddCommunication?.(communication);
    
    // Reset form
    setNewCommunication({
      type: 'email',
      content: '',
      urgency: 'normal',
      participants: []
    });
  };

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'whatsapp': return 'MessageCircle';
      case 'email': return 'Mail';
      case 'phone': return 'Phone';
      case 'meeting': return 'Users';
      default: return 'MessageCircle';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h5 className="font-medium text-sm">Comunicación con Cliente</h5>
        <p className="text-xs text-muted-foreground">
          Punto de contacto principal durante la ejecución del proyecto
        </p>

        {/* Client Contact Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="User" size={16} className="text-blue-600" />
            <span className="font-medium text-sm">Contacto Principal</span>
          </div>
          <div className="text-sm space-y-1">
            <p><strong>{project?.clientContact?.name}</strong></p>
            <p className="text-muted-foreground">{project?.clientContact?.phone}</p>
            <p className="text-muted-foreground">{project?.clientContact?.email}</p>
          </div>
        </div>

        {/* Recent Communications */}
        <div className="space-y-3">
          <h6 className="font-medium text-sm">Comunicaciones Recientes</h6>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {project?.communications?.slice(-5)?.reverse()?.map((comm) => (
              <div key={comm?.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getCommunicationIcon(comm?.type)} 
                      size={14} 
                      className="text-muted-foreground" 
                    />
                    <span className="text-xs text-muted-foreground capitalize">
                      {comm?.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comm?.date)?.toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getUrgencyColor(comm?.urgency)}`}>
                    {comm?.urgency === 'urgent' ? 'Urgente' :
                     comm?.urgency === 'high' ? 'Alta' :
                     comm?.urgency === 'normal' ? 'Normal' : 'Baja'}
                  </span>
                </div>
                
                <p className="text-sm text-foreground mb-2">
                  {comm?.content}
                </p>
                
                {comm?.participants?.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {comm?.participants?.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {(!project?.communications || project?.communications?.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay comunicaciones registradas
              </p>
            )}
          </div>
        </div>

        {/* New Communication Form */}
        <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
          <h6 className="font-medium text-sm">Nueva Comunicación</h6>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">Tipo</label>
              <select
                value={newCommunication?.type}
                onChange={(e) => setNewCommunication(prev => ({ ...prev, type: e?.target?.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Teléfono</option>
                <option value="meeting">Reunión</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium block mb-1">Urgencia</label>
              <select
                value={newCommunication?.urgency}
                onChange={(e) => setNewCommunication(prev => ({ ...prev, urgency: e?.target?.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1">Contenido</label>
            <textarea
              value={newCommunication?.content}
              onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e?.target?.value }))}
              placeholder="Descripción de la comunicación, acuerdos, seguimientos..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Participants */}
          <div>
            <label className="text-xs font-medium block mb-1">Participantes</label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e?.target?.value)}
                placeholder="Nombre del participante..."
                className="text-sm flex-1"
                onKeyPress={(e) => e?.key === 'Enter' && handleAddParticipant()}
              />
              <Button
                variant="outline"
                size="sm"
                iconName="Plus"
                onClick={handleAddParticipant}
              />
            </div>
            
            {newCommunication?.participants?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newCommunication?.participants?.map((participant, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >
                    <span>{participant}</span>
                    <button
                      onClick={() => handleRemoveParticipant(participant)}
                      className="hover:text-blue-600"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!newCommunication?.content?.trim()}
            iconName="Send"
            iconPosition="left"
            size="sm"
            className="w-full"
          >
            Registrar Comunicación
          </Button>
        </div>

        {/* Quick Communication Templates */}
        <div className="space-y-2">
          <h6 className="font-medium text-sm">Plantillas Rápidas</h6>
          <div className="grid grid-cols-1 gap-2">
            {[
              'Actualización semanal de progreso',
              'Solicitud de acceso a nueva área',
              'Confirmación de entrega de materiales',
              'Programación de inspección',
              'Notificación de hito completado'
            ]?.map((template) => (
              <button
                key={template}
                onClick={() => setNewCommunication(prev => ({ 
                  ...prev, 
                  content: template 
                }))}
                className="text-left px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCommunicationPanel;