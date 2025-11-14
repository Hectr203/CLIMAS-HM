import React, { useState, useEffect } from 'react';
import useCommunication from '../../../hooks/useCommunication';
import { useAuth } from '../../../hooks/useAuth';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientCommunicationPanel = ({ client }) => {
  const { createCommunication, getComunicacionesByCliente, loading, error, success } = useCommunication();
  const { user } = useAuth();
  const [showNewCommForm, setShowNewCommForm] = useState(false);
  const [formData, setFormData] = useState({
    tipoComunicacion: 'email',
    nivelUrgencia: 'normal',
    asunto: '',
    mensaje: ''
  });

  const [communicationHistory, setCommunicationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Cargar historial de comunicaciones al montar el componente o cuando cambie el cliente
  useEffect(() => {
    if (client?.id || client?._id) {
      const clientId = client?.id || client?._id;
      getComunicacionesByCliente(clientId).then((res) => {
        if (res && res.data && res.data.comunicaciones && Array.isArray(res.data.comunicaciones)) {
          setCommunicationHistory(res.data.comunicaciones);
        } else if (res && res.comunicaciones && Array.isArray(res.comunicaciones)) {
          setCommunicationHistory(res.comunicaciones);
        } else if (res && res.data && Array.isArray(res.data)) {
          setCommunicationHistory(res.data);
        } else {
          setCommunicationHistory([]);
        }
      });
    } else {
      setCommunicationHistory([]);
    }
  }, [client?.id, client?._id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCommunication = async () => {
    if (!formData?.mensaje?.trim() || !formData?.asunto?.trim()) {
      return;
    }

    const clientId = client?.id || client?._id;
    if (!clientId) {
      console.error('No se encontró ID del cliente');
      return;
    }

    // Mapea los datos al formato del backend
    const commData = {
      tipoComunicacion: formData?.tipoComunicacion || 'email',
      nivelUrgencia: formData?.nivelUrgencia || 'normal',
      asunto: formData?.asunto,
      mensaje: formData?.mensaje,
      idCliente: clientId,
      idOportunidad: 'sin-oportunidad',
      creadoPor: user?.rol || user?.email || 'Usuario',
    };

    const result = await createCommunication(commData);
    
    if (result) {
      // Limpiar formulario y cerrar
      setFormData({ 
        tipoComunicacion: 'email', 
        nivelUrgencia: 'normal',
        asunto: '',
        mensaje: ''
      });
      setShowNewCommForm(false);
      
      // Recargar historial
      getComunicacionesByCliente(clientId).then((res) => {
        if (res && res.data && res.data.comunicaciones && Array.isArray(res.data.comunicaciones)) {
          setCommunicationHistory(res.data.comunicaciones);
        } else if (res && res.comunicaciones && Array.isArray(res.comunicaciones)) {
          setCommunicationHistory(res.comunicaciones);
        } else if (res && res.data && Array.isArray(res.data)) {
          setCommunicationHistory(res.data);
        }
      });
    }
  };

  const getUrgencyColor = (urgency) => {
    const normalizedUrgency = (urgency || '').toString().toLowerCase();
    switch (normalizedUrgency) {
      case 'urgente':
      case 'alta':
        return 'text-red-600 bg-red-50';
      case 'normal':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    const normalizedType = (type || '').toString().toLowerCase();
    switch (normalizedType) {
      case 'whatsapp':
        return 'MessageCircle';
      case 'llamada':
      case 'phone':
        return 'Phone';
      case 'email':
        return 'Mail';
      case 'meeting':
        return 'Users';
      default:
        return 'MessageSquare';
    }
  };

  const getTypeIconBg = (type) => {
    const normalizedType = (type || '').toString().toLowerCase();
    switch (normalizedType) {
      case 'email':
        return 'bg-blue-500';
      case 'whatsapp':
        return 'bg-green-500';
      case 'llamada':
      case 'phone':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Historial de Comunicación</h3>
        <Button
          onClick={() => setShowNewCommForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          iconName="Plus"
          iconPosition="left"
          size="sm"
        >
          Nueva Comunicación
        </Button>
      </div>

      {/* Communication History */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {loadingHistory ? (
          <div className="text-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Cargando historial...</p>
          </div>
        ) : communicationHistory.length > 0 ? (
          communicationHistory.map((comm) => (
            <div key={comm?.id} className="flex items-start space-x-3 p-3 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors">
              {/* Icon */}
              <div className={`p-3 rounded-full ${getTypeIconBg(comm?.tipoComunicacion)}`}>
                <Icon 
                  name={getTypeIcon(comm?.tipoComunicacion)} 
                  size={20}
                  className="text-white"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm text-foreground">{comm?.asunto}</h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground ml-2">
                    <Icon name="Calendar" size={12} />
                    <span>
                      {new Date(parseInt(comm.id)).toLocaleString('es-MX', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{comm?.mensaje}</p>
                
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <Icon name="User" size={12} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{comm?.creadoPor || 'Sistema'}</span>
                  </div>
                  <span className={`px-2 py-1 rounded ${getUrgencyColor(comm?.nivelUrgencia)}`}>
                    {comm?.nivelUrgencia === 'urgente' ? 'Urgente' : comm?.nivelUrgencia === 'alta' ? 'Alta' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-foreground">Sin comunicaciones registradas</p>
            <p className="text-xs text-muted-foreground mt-1">
              Agrega la primera comunicación con este cliente
            </p>
          </div>
        )}
      </div>

      {/* Modal/Form for New Communication */}
      {showNewCommForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-lg font-semibold text-foreground">Nueva Comunicación</h3>
                <button
                  onClick={() => {
                    setShowNewCommForm(false);
                    setFormData({
                      tipoComunicacion: 'email',
                      nivelUrgencia: 'normal',
                      asunto: '',
                      mensaje: ''
                    });
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      Tipo de Comunicación <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tipoComunicacion}
                      onChange={(e) => handleInputChange('tipoComunicacion', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="email">Correo Electrónico</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="llamada">Llamada Telefónica</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block text-foreground">
                      Nivel de Urgencia
                    </label>
                    <select
                      value={formData.nivelUrgencia}
                      onChange={(e) => handleInputChange('nivelUrgencia', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">
                    Asunto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.asunto}
                    onChange={(e) => handleInputChange('asunto', e.target.value)}
                    placeholder="Ej. Seguimiento de propuesta comercial"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) => handleInputChange('mensaje', e.target.value)}
                    placeholder="Escribir mensaje de comunicación con el cliente..."
                    rows={6}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Quick Templates */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Plantillas Rápidas</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('asunto', 'Seguimiento de Proyecto');
                        handleInputChange('mensaje', 'Buenos días, me comunico para dar seguimiento al proyecto en curso y verificar si requieren alguna información adicional.');
                      }}
                      className="px-3 py-2 text-xs border border-border rounded-md hover:bg-muted/50 text-left flex items-center space-x-2"
                    >
                      <Icon name="Clock" size={14} />
                      <span>Seguimiento</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('asunto', 'Propuesta Comercial');
                        handleInputChange('mensaje', 'Adjunto encontrarán nuestra propuesta comercial para el proyecto solicitado. Quedo atento a sus comentarios.');
                      }}
                      className="px-3 py-2 text-xs border border-border rounded-md hover:bg-muted/50 text-left flex items-center space-x-2"
                    >
                      <Icon name="FileText" size={14} />
                      <span>Propuesta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('asunto', 'Cotización Actualizada');
                        handleInputChange('mensaje', 'Les envío cotización actualizada considerando los ajustes solicitados. Por favor confirmen para proceder.');
                      }}
                      className="px-3 py-2 text-xs border border-border rounded-md hover:bg-muted/50 text-left flex items-center space-x-2"
                    >
                      <Icon name="DollarSign" size={14} />
                      <span>Cotización</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('asunto', 'Programación de Visita');
                        handleInputChange('mensaje', 'Nos gustaría programar una visita técnica para evaluar los requerimientos del proyecto. ¿Qué día les vendría mejor?');
                      }}
                      className="px-3 py-2 text-xs border border-border rounded-md hover:bg-muted/50 text-left flex items-center space-x-2"
                    >
                      <Icon name="Calendar" size={14} />
                      <span>Visita</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewCommForm(false);
                    setFormData({
                      tipoComunicacion: 'email',
                      nivelUrgencia: 'normal',
                      asunto: '',
                      mensaje: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddCommunication}
                  disabled={!formData.mensaje?.trim() || !formData.asunto?.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  iconName="Send"
                  iconPosition="left"
                >
                  {loading ? 'Enviando...' : 'Registrar Comunicación'}
                </Button>
              </div>

              {error && (
                <div className="text-sm text-red-600 flex items-center space-x-2 bg-red-50 p-3 rounded-md">
                  <Icon name="AlertCircle" size={16} />
                  <span>Error al enviar comunicación</span>
                </div>
              )}
              {success && (
                <div className="text-sm text-green-600 flex items-center space-x-2 bg-green-50 p-3 rounded-md">
                  <Icon name="CheckCircle2" size={16} />
                  <span>Comunicación registrada correctamente</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCommunicationPanel;
