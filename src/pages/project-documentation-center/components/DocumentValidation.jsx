import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentValidation = ({ project, onValidationComplete }) => {
  const [checklist, setChecklist] = useState({
    clientContract: false,
    invoices: false,
    receipts: false,
    materialCertifications: false,
    workPhotos: false,
    clientApproval: false,
    warrantyDocs: false,
    finalPayment: false
  });

  const validationItems = [
    {
      id: 'clientContract',
      label: 'Contrato con Cliente',
      description: 'Contrato firmado y términos acordados',
      category: 'legal',
      required: true,
      icon: 'FileText'
    },
    {
      id: 'invoices',
      label: 'Facturas Completas',
      description: 'Todas las facturas emitidas y validadas',
      category: 'financial',
      required: true,
      icon: 'Receipt'
    },
    {
      id: 'receipts',
      label: 'Comprobantes de Pago',
      description: 'Evidencias de pagos recibidos',
      category: 'financial',
      required: true,
      icon: 'CreditCard'
    },
    {
      id: 'materialCertifications',
      label: 'Certificaciones de Material',
      description: 'Certificados de calidad y conformidad',
      category: 'quality',
      required: true,
      icon: 'Award'
    },
    {
      id: 'workPhotos',
      label: 'Fotografías de Trabajo',
      description: 'Documentación fotográfica completa',
      category: 'documentation',
      required: true,
      icon: 'Camera'
    },
    {
      id: 'clientApproval',
      label: 'Aprobación Final del Cliente',
      description: 'Confirmación escrita de satisfacción',
      category: 'approval',
      required: true,
      icon: 'ThumbsUp'
    },
    {
      id: 'warrantyDocs',
      label: 'Documentos de Garantía',
      description: 'Términos y condiciones de garantía',
      category: 'warranty',
      required: false,
      icon: 'Shield'
    },
    {
      id: 'finalPayment',
      label: 'Pago Final Confirmado',
      description: 'Liquidación completa del proyecto',
      category: 'financial',
      required: true,
      icon: 'DollarSign'
    }
  ];

  const categories = [
    { id: 'legal', label: 'Documentos Legales', color: 'purple', icon: 'Scale' },
    { id: 'financial', label: 'Documentos Financieros', color: 'green', icon: 'DollarSign' },
    { id: 'quality', label: 'Control de Calidad', color: 'blue', icon: 'CheckCircle' },
    { id: 'documentation', label: 'Documentación', color: 'orange', icon: 'FileImage' },
    { id: 'approval', label: 'Aprobaciones', color: 'yellow', icon: 'UserCheck' },
    { id: 'warranty', label: 'Garantías', color: 'indigo', icon: 'Shield' }
  ];

  const handleChecklistChange = (itemId, checked) => {
    setChecklist(prev => ({ ...prev, [itemId]: checked }));
  };

  const getCompletionStats = () => {
    const total = validationItems?.length;
    const required = validationItems?.filter(item => item?.required)?.length;
    const completed = Object.values(checklist)?.filter(Boolean)?.length;
    const requiredCompleted = validationItems?.filter(item => 
      item?.required && checklist?.[item?.id]
    )?.length;

    return { total, required, completed, requiredCompleted };
  };

  const stats = getCompletionStats();
  const isProjectReady = stats?.requiredCompleted === stats?.required;

  const generateFinalPackage = () => {
    // Simulate final documentation package generation
    onValidationComplete(project?.id, 'warranty-continuity');
  };

  const getCategoryIcon = (categoryId) => {
    return categories?.find(cat => cat?.id === categoryId)?.icon || 'File';
  };

  const getCategoryColor = (categoryId) => {
    return categories?.find(cat => cat?.id === categoryId)?.color || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Validation Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Validación de Documentación Final
            </h3>
            <p className="text-muted-foreground text-sm">
              Checklist para obras pequeñas - Verificación antes del cierre
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round((stats?.completed / stats?.total) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Completado</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso de Validación</span>
            <span className="text-sm text-muted-foreground">
              {stats?.completed}/{stats?.total} elementos
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats?.completed / stats?.total) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Requeridos: {stats?.requiredCompleted}/{stats?.required}</span>
            <span>Opcionales: {stats?.completed - stats?.requiredCompleted}/{stats?.total - stats?.required}</span>
          </div>
        </div>

        {/* Status Alert */}
        {isProjectReady ? (
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-green-800">Proyecto Listo para Cierre</div>
              <div className="text-sm text-green-600">
                Todos los documentos requeridos están completos
              </div>
            </div>
            <Button
              variant="success"
              iconName="Package"
              iconPosition="left"
              onClick={generateFinalPackage}
            >
              Generar Paquete Final
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
            <div className="flex-1">
              <div className="font-medium text-yellow-800">Documentos Pendientes</div>
              <div className="text-sm text-yellow-600">
                {stats?.required - stats?.requiredCompleted} documentos requeridos faltantes
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Validation Checklist by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories?.map((category) => {
          const categoryItems = validationItems?.filter(item => item?.category === category?.id);
          const categoryCompleted = categoryItems?.filter(item => checklist?.[item?.id])?.length;
          
          return (
            <div key={category?.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${category?.color}-100`}>
                    <Icon
                      name={category?.icon}
                      size={18}
                      className={`text-${category?.color}-600`}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{category?.label}</h4>
                    <div className="text-sm text-muted-foreground">
                      {categoryCompleted}/{categoryItems?.length} completados
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round((categoryCompleted / categoryItems?.length) * 100)}%
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {categoryItems?.map((item) => (
                  <div
                    key={item?.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      checklist?.[item?.id] 
                        ? 'bg-green-50 border-green-200' :'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleChecklistChange(item?.id, !checklist?.[item?.id])}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          checklist?.[item?.id]
                            ? 'bg-green-600 border-green-600' :'border-border hover:border-primary'
                        }`}
                      >
                        {checklist?.[item?.id] && (
                          <Icon name="Check" size={12} className="text-white" />
                        )}
                      </button>

                      <div className="flex items-center space-x-2">
                        <Icon
                          name={item?.icon}
                          size={14}
                          className={checklist?.[item?.id] ? 'text-green-600' : 'text-muted-foreground'}
                        />
                        <div>
                          <div className={`text-sm font-medium ${
                            checklist?.[item?.id] ? 'text-green-800' : 'text-foreground'
                          }`}>
                            {item?.label}
                            {item?.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </div>
                          <div className={`text-xs ${
                            checklist?.[item?.id] ? 'text-green-600' : 'text-muted-foreground'
                          }`}>
                            {item?.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {checklist?.[item?.id] ? (
                        <Icon name="CheckCircle" size={16} className="text-green-600" />
                      ) : item?.required ? (
                        <Icon name="AlertCircle" size={16} className="text-red-500" />
                      ) : (
                        <Icon name="Circle" size={16} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Missing Documents Alert */}
      {!isProjectReady && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="AlertTriangle" size={20} className="text-red-500" />
            <h4 className="font-semibold text-foreground">Documentos Faltantes</h4>
          </div>

          <div className="space-y-2">
            {validationItems
              ?.filter(item => item?.required && !checklist?.[item?.id])
              ?.map((item) => (
                <div key={item?.id} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                  <Icon name={item?.icon} size={14} className="text-red-500" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-800">{item?.label}</div>
                    <div className="text-xs text-red-600">{item?.description}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Upload"
                    iconPosition="left"
                  >
                    Subir
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Final Documentation Package */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold text-foreground mb-4">Paquete de Documentación Final</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Incluye:</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Icon name="FileText" size={14} className="text-blue-600" />
                <span>Contrato firmado</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Receipt" size={14} className="text-green-600" />
                <span>Facturas y comprobantes</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Award" size={14} className="text-purple-600" />
                <span>Certificaciones de material</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Camera" size={14} className="text-orange-600" />
                <span>Reporte fotográfico</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Formatos disponibles:</h5>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" iconName="FileText">PDF</Button>
              <Button variant="outline" size="sm" iconName="Archive">ZIP</Button>
              <Button variant="outline" size="sm" iconName="Mail">Email</Button>
              <Button variant="outline" size="sm" iconName="Cloud">Cloud</Button>
            </div>
          </div>
        </div>

        {isProjectReady && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                El paquete final será generado automáticamente una vez que se complete la validación.
              </div>
              <Button
                variant="success"
                iconName="Download"
                iconPosition="left"
                onClick={generateFinalPackage}
              >
                Generar y Descargar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentValidation;