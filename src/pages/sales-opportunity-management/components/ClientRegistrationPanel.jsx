import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const ClientRegistrationPanel = ({ opportunity, onRegister }) => {
          const [formData, setFormData] = useState({
            contactPerson: opportunity?.contactInfo?.contactPerson || '',
            phone: opportunity?.contactInfo?.phone || '',
            email: opportunity?.contactInfo?.email || '',
            company: opportunity?.clientName || '',
            position: '',
            projectType: opportunity?.projectType || 'project',
            channel: opportunity?.contactChannel || 'whatsapp'
          });

          const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
          };

          const handleRegister = () => {
            onRegister?.(formData);
          };

          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Icon name="UserPlus" size={16} className="text-primary" />
                <h4 className="font-medium">Registro de Cliente</h4>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Persona de Contacto</label>
                  <Input
                    value={formData?.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e?.target?.value)}
                    placeholder="Nombre del contacto principal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Teléfono</label>
                    <Input
                      value={formData?.phone}
                      onChange={(e) => handleInputChange('phone', e?.target?.value)}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Canal</label>
                    <select
                      value={formData?.channel}
                      onChange={(e) => handleInputChange('channel', e?.target?.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Correo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Correo Electrónico</label>
                  <Input
                    type="email"
                    value={formData?.email}
                    onChange={(e) => handleInputChange('email', e?.target?.value)}
                    placeholder="contacto@empresa.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Empresa</label>
                  <Input
                    value={formData?.company}
                    onChange={(e) => handleInputChange('company', e?.target?.value)}
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Puesto</label>
                    <Input
                      value={formData?.position}
                      onChange={(e) => handleInputChange('position', e?.target?.value)}
                      placeholder="Ing./Arq./Lic."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo</label>
                    <select
                      value={formData?.projectType}
                      onChange={(e) => handleInputChange('projectType', e?.target?.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                    >
                      <option value="project">Proyecto</option>
                      <option value="piece">Pieza</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRegister}
                className="w-full"
                iconName="Save"
                iconPosition="left"
              >
                Registrar Cliente
              </Button>
            </div>
          );
        };

        export default ClientRegistrationPanel;