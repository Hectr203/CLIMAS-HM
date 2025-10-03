import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const WorkOrderPanel = ({ opportunity, onGenerateWorkOrder }) => {
          const [workOrderData, setWorkOrderData] = useState({
            reference: `WO-2024-${opportunity?.clientName?.substring(0,3)?.toUpperCase()}-${String(Date.now())?.slice(-3)}`,
            finalScope: opportunity?.quotationData?.scope || '',
            references: {
              administration: true,
              purchases: true,
              production: true
            },
            startupTracking: {
              confirmedDate: '',
              fieldSupervisor: '',
              supervisorContact: ''
            },
            billingInfo: opportunity?.contractualInfo?.billingData || {},
            deliveryLogistics: {
              type: 'project', // 'project' or 'pieces'
              schedule: opportunity?.contractualInfo?.deliverySchedule || []
            }
          });

          const handleInputChange = (field, value) => {
            setWorkOrderData(prev => ({ ...prev, [field]: value }));
          };

          const handleNestedChange = (section, field, value) => {
            setWorkOrderData(prev => ({
              ...prev,
              [section]: { ...prev?.[section], [field]: value }
            }));
          };

          const handleGenerateWorkOrder = () => {
            onGenerateWorkOrder?.(workOrderData);
          };

          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Icon name="FileCheck" size={16} className="text-primary" />
                <h4 className="font-medium">Generación de Orden de Trabajo</h4>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="CheckCircle2" size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Cliente Aprobó Cotización</span>
                </div>
                <div className="text-xs text-green-700">
                  <p>Monto: ${opportunity?.quotationData?.totalAmount?.toLocaleString('es-MX')} MXN</p>
                  <p>Aprobado: {opportunity?.quotationData?.approvalDate}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Work Order Reference */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Referencia de Orden</label>
                  <Input
                    value={workOrderData?.reference}
                    onChange={(e) => handleInputChange('reference', e?.target?.value)}
                    placeholder="WO-2024-XXX-001"
                  />
                </div>

                {/* Final Scope */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Alcance Final</label>
                  <textarea
                    value={workOrderData?.finalScope}
                    onChange={(e) => handleInputChange('finalScope', e?.target?.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                  />
                </div>

                {/* Internal References */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Notificación a Departamentos</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="admin-ref"
                        checked={workOrderData?.references?.administration}
                        onChange={(e) => handleNestedChange('references', 'administration', e?.target?.checked)}
                        className="rounded border-border"
                      />
                      <label htmlFor="admin-ref" className="text-sm">Administración</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="purchases-ref"
                        checked={workOrderData?.references?.purchases}
                        onChange={(e) => handleNestedChange('references', 'purchases', e?.target?.checked)}
                        className="rounded border-border"
                      />
                      <label htmlFor="purchases-ref" className="text-sm">Compras</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="production-ref"
                        checked={workOrderData?.references?.production}
                        onChange={(e) => handleNestedChange('references', 'production', e?.target?.checked)}
                        className="rounded border-border"
                      />
                      <label htmlFor="production-ref" className="text-sm">Producción</label>
                    </div>
                  </div>
                </div>

                {/* Startup Tracking */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Seguimiento de Arranque</label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={workOrderData?.startupTracking?.confirmedDate}
                      onChange={(e) => handleNestedChange('startupTracking', 'confirmedDate', e?.target?.value)}
                      placeholder="Fecha confirmada"
                    />
                    <Input
                      value={workOrderData?.startupTracking?.fieldSupervisor}
                      onChange={(e) => handleNestedChange('startupTracking', 'fieldSupervisor', e?.target?.value)}
                      placeholder="Nombre del supervisor de campo"
                    />
                    <Input
                      value={workOrderData?.startupTracking?.supervisorContact}
                      onChange={(e) => handleNestedChange('startupTracking', 'supervisorContact', e?.target?.value)}
                      placeholder="Contacto del supervisor"
                    />
                  </div>
                </div>

                {/* Delivery Type */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo de Entrega</label>
                  <select
                    value={workOrderData?.deliveryLogistics?.type}
                    onChange={(e) => handleNestedChange('deliveryLogistics', 'type', e?.target?.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                  >
                    <option value="project">Obra - Instalación en sitio</option>
                    <option value="pieces">Piezas - Entrega de componentes</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleGenerateWorkOrder}
                  className="w-full"
                  iconName="FileCheck"
                  iconPosition="left"
                >
                  Generar Orden de Trabajo Interna
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Se notificará a Producción para iniciar el proceso interno
                </p>
              </div>

              {/* Billing Information */}
              {opportunity?.contractualInfo?.billingData && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <h5 className="text-sm font-medium mb-2">Datos de Facturación</h5>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Razón Social:</strong> {opportunity?.contractualInfo?.billingData?.businessName}</p>
                    <p><strong>RFC:</strong> {opportunity?.contractualInfo?.billingData?.rfc}</p>
                    <p><strong>Dirección:</strong> {opportunity?.contractualInfo?.billingData?.address}</p>
                  </div>
                </div>
              )}
            </div>
          );
        };

        export default WorkOrderPanel;