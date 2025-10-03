import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const QuotationWorkflow = ({ project, onUpdate }) => {
  const [quotationData, setQuotationData] = useState(project?.quotationData || {});
  const [isEditing, setIsEditing] = useState(false);

  const handleQuotationUpdate = (field, value) => {
    setQuotationData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const base = parseFloat(quotationData?.baseAmount || 0);
    const installation = (base * (quotationData?.installationPercentage || 0)) / 100;
    const travel = parseFloat(quotationData?.travel || 0);
    const personnel = parseFloat(quotationData?.personnelCost || 0);
    return base + installation + travel + personnel;
  };

  const saveQuotation = () => {
    setIsEditing(false);
    // Update project with new quotation data
    onUpdate(project?.id, 'quotation-validation');
  };

  const sendQuotation = () => {
    onUpdate(project?.id, 'client-proposal');
  };

  return (
    <div className="space-y-6">
      {/* Quotation Builder */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Constructor de Cotización</h3>
            <p className="text-muted-foreground text-sm">
              {quotationData?.hasClientCatalog 
                ? 'Cotización basada en catálogo del cliente' :'Cotización basada en planos e identificación de materiales'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                iconName="Edit"
                iconPosition="left"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setQuotationData(project?.quotationData);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  iconName="Save"
                  iconPosition="left"
                  onClick={saveQuotation}
                >
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quotation Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Main Items */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Materiales y Equipos
              </label>
              {isEditing ? (
                <textarea
                  className="w-full p-3 border border-border rounded-lg resize-none"
                  rows="3"
                  value={quotationData?.parts || ''}
                  onChange={(e) => handleQuotationUpdate('parts', e?.target?.value)}
                  placeholder="Descripción detallada de materiales..."
                />
              ) : (
                <div className="p-3 bg-muted rounded-lg">
                  {quotationData?.parts || 'Sin especificar'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Monto Base
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={quotationData?.baseAmount || ''}
                    onChange={(e) => handleQuotationUpdate('baseAmount', e?.target?.value)}
                    placeholder="$0"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-lg font-mono">
                    ${quotationData?.baseAmount?.toLocaleString() || '0'}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  % Instalación
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={quotationData?.installationPercentage || ''}
                    onChange={(e) => handleQuotationUpdate('installationPercentage', e?.target?.value)}
                    placeholder="30"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-lg">
                    {quotationData?.installationPercentage || 0}%
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Viáticos
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={quotationData?.travel || ''}
                    onChange={(e) => handleQuotationUpdate('travel', e?.target?.value)}
                    placeholder="$5000"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-lg font-mono">
                    ${quotationData?.travel?.toLocaleString() || '0'}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Personal Estimado
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={quotationData?.estimatedPersonnel || ''}
                    onChange={(e) => handleQuotationUpdate('estimatedPersonnel', e?.target?.value)}
                    placeholder="8"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-lg">
                    {quotationData?.estimatedPersonnel || 0} personas
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Conditions & Total */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-3">Condiciones de Pago</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Anticipo (%)
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={quotationData?.advancePayment || ''}
                      onChange={(e) => handleQuotationUpdate('advancePayment', e?.target?.value)}
                      placeholder="30"
                    />
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      {quotationData?.advancePayment || 30}%
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Avance (%)
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={quotationData?.progressPayment || ''}
                      onChange={(e) => handleQuotationUpdate('progressPayment', e?.target?.value)}
                      placeholder="70"
                    />
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      {quotationData?.progressPayment || 70}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Garantía
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={quotationData?.warranty || ''}
                  onChange={(e) => handleQuotationUpdate('warranty', e?.target?.value)}
                  placeholder="12 meses"
                />
              ) : (
                <div className="p-3 bg-muted rounded-lg">
                  {quotationData?.warranty || 'Sin especificar'}
                </div>
              )}
            </div>

            {/* Total Calculation */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Total de la Cotización</span>
                <Icon name="Calculator" size={16} className="text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary font-mono">
                ${calculateTotal()?.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Incluye instalación, viáticos y personal
              </div>
            </div>

            {/* Validation Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Estado de Validación</span>
                {quotationData?.validatedBy ? (
                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                ) : (
                  <Icon name="Clock" size={16} className="text-yellow-600" />
                )}
              </div>
              {quotationData?.validatedBy ? (
                <div className="text-sm">
                  <div className="text-green-600">Validada por {quotationData?.validatedBy}</div>
                  <div className="text-muted-foreground">Lista para envío al cliente</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Pendiente validación por Ventas/Martín
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="FileText"
              iconPosition="left"
            >
              Generar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Exportar Excel
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {quotationData?.validatedBy ? (
              <>
                <Button
                  variant="success"
                  size="sm"
                  iconName="Mail"
                  iconPosition="left"
                  onClick={sendQuotation}
                >
                  Enviar por Correo
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  iconName="MessageCircle"
                  iconPosition="left"
                  onClick={sendQuotation}
                >
                  Enviar por WhatsApp
                </Button>
              </>
            ) : (
              <Button
                variant="warning"
                size="sm"
                iconName="AlertTriangle"
                iconPosition="left"
              >
                Requiere Validación
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Quotation History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Historial de Cotizaciones</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="FileText" size={16} className="text-blue-600" />
              <div>
                <div className="font-medium text-sm">Cotización Inicial v1.0</div>
                <div className="text-xs text-muted-foreground">Creada: 15 Ene 2024</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono">$850,000</span>
              <Button variant="ghost" size="sm" iconName="Eye" />
              <Button variant="ghost" size="sm" iconName="Download" />
            </div>
          </div>

          {quotationData?.clientApproved && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="CheckCircle" size={16} className="text-green-600" />
                <div>
                  <div className="font-medium text-sm text-green-800">Cotización Aprobada</div>
                  <div className="text-xs text-green-600">Aprobada por el cliente</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-green-800">${quotationData?.totalAmount?.toLocaleString()}</span>
                <Icon name="ThumbsUp" size={14} className="text-green-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationWorkflow;