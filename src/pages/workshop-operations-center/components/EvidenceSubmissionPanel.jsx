import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EvidenceSubmissionPanel = ({ workOrders = [], onEvidenceSubmission, onReportToProjects }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [evidencePhotos, setEvidencePhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [submissionNotes, setSubmissionNotes] = useState('');

  const requiredDocuments = [
    {
      id: 'installation_certificate',
      name: 'Certificado de Instalación',
      description: 'Documento oficial de instalación completada',
      icon: 'FileCheck',
      required: true
    },
    {
      id: 'user_manual',
      name: 'Manual de Usuario',
      description: 'Guía de operación y mantenimiento',
      icon: 'Book',
      required: true
    },
    {
      id: 'warranty_document',
      name: 'Documento de Garantía',
      description: 'Términos y condiciones de garantía',
      icon: 'Shield',
      required: true
    },
    {
      id: 'technical_specs',
      name: 'Especificaciones Técnicas',
      description: 'Detalles técnicos del sistema instalado',
      icon: 'FileText',
      required: false
    },
    {
      id: 'compliance_certificate',
      name: 'Certificado de Cumplimiento',
      description: 'Cumplimiento de normas y regulaciones',
      icon: 'Award',
      required: false
    }
  ];

  const evidenceCategories = [
    {
      id: 'installation_progress',
      name: 'Progreso de Instalación',
      description: 'Fotos del proceso de instalación paso a paso',
      icon: 'Wrench'
    },
    {
      id: 'final_product',
      name: 'Producto Final',
      description: 'Fotografías del sistema completamente instalado',
      icon: 'Camera'
    },
    {
      id: 'quality_tests',
      name: 'Pruebas de Calidad',
      description: 'Evidencia de pruebas de funcionamiento',
      icon: 'CheckCircle'
    },
    {
      id: 'workspace_cleanup',
      name: 'Limpieza del Área',
      description: 'Área de trabajo limpia y organizada',
      icon: 'Trash2'
    }
  ];

  const handlePhotoUpload = (event, category = null) => {
    const files = Array.from(event?.target?.files || []);
    files?.forEach(file => {
      const photoData = {
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        category: category || 'general',
        timestamp: new Date()?.toISOString(),
        description: ''
      };
      setEvidencePhotos(prev => [...prev, photoData]);
    });
  };

  const handleDocumentUpload = (event, documentType) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const documentData = {
      id: Date.now(),
      type: documentType,
      name: file?.name,
      file,
      url: URL.createObjectURL(file),
      uploadedAt: new Date()?.toISOString()
    };
    setDocuments(prev => [...prev, documentData]);
  };

  const handleSubmitEvidence = (workOrder) => {
    const requiredDocs = requiredDocuments?.filter(doc => doc?.required);
    const uploadedRequired = documents?.filter(doc => 
      requiredDocs?.some(req => req?.id === doc?.type)
    );

    if (uploadedRequired?.length < requiredDocs?.length) {
      alert('Por favor sube todos los documentos obligatorios antes de enviar las evidencias.');
      return;
    }

    if (evidencePhotos?.length < 3) {
      alert('Por favor incluye al menos 3 fotografías como evidencia del trabajo completado.');
      return;
    }

    const evidencePackage = {
      status: 'completed',
      photos: evidencePhotos?.map(photo => ({
        category: photo?.category,
        url: photo?.url,
        description: photo?.description,
        timestamp: photo?.timestamp
      })),
      documents: documents?.map(doc => ({
        type: doc?.type,
        name: doc?.name,
        url: doc?.url,
        uploadedAt: doc?.uploadedAt
      })),
      submittedToProjects: true,
      submissionDate: new Date()?.toISOString(),
      notes: submissionNotes,
      submittedBy: 'Workshop Team'
    };

    onEvidenceSubmission?.(workOrder?.id, evidencePackage);

    // Send package to Projects department
    onReportToProjects?.(workOrder?.id, 'work_completion', {
      ...evidencePackage,
      projectReference: workOrder?.projectReference,
      clientName: workOrder?.clientName,
      completedTechnicians: workOrder?.assignedTechnicians
    });

    // Reset form
    setSelectedOrder(null);
    setEvidencePhotos([]);
    setDocuments([]);
    setSubmissionNotes('');
  };

  const removePhoto = (photoId) => {
    setEvidencePhotos(prev => prev?.filter(photo => photo?.id !== photoId));
  };

  const removeDocument = (docId) => {
    setDocuments(prev => prev?.filter(doc => doc?.id !== docId));
  };

  const updatePhotoDescription = (photoId, description) => {
    setEvidencePhotos(prev => prev?.map(photo =>
      photo?.id === photoId ? { ...photo, description } : photo
    ));
  };

  const getPhotosByCategory = (category) => {
    return evidencePhotos?.filter(photo => photo?.category === category);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Icon name="Camera" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Envío de Evidencias</h2>
            <p className="text-sm text-muted-foreground">Documentación y fotografías del trabajo completado</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Upload">
            Cargar
          </Button>
          <Button variant="outline" size="sm" iconName="Send">
            Enviar
          </Button>
        </div>
      </div>
      {workOrders?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Camera" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay trabajos listos para envío</h3>
          <p className="text-muted-foreground">Los trabajos aparecerán aquí una vez aprobados en control de calidad</p>
        </div>
      ) : (
        <div className="space-y-6">
          {workOrders?.map((workOrder) => (
            <div key={workOrder?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{workOrder?.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">{workOrder?.projectReference}</p>
                  <p className="text-xs text-muted-foreground">Cliente: {workOrder?.clientName}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex -space-x-1">
                      {workOrder?.assignedTechnicians?.map((tech, index) => (
                        <div
                          key={tech?.id}
                          className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-medium text-secondary-foreground border-2 border-background"
                          title={`${tech?.name} - ${tech?.role}`}
                        >
                          {tech?.name?.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Técnicos responsables</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  workOrder?.evidenceSubmission?.submittedToProjects ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {workOrder?.evidenceSubmission?.submittedToProjects ? 'Enviado' : 'Pendiente'}
                </div>
              </div>

              {/* Evidence Categories */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground">Categorías de Evidencia:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evidenceCategories?.map((category) => {
                    const categoryPhotos = getPhotosByCategory(category?.id);
                    
                    return (
                      <div key={category?.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Icon name={category?.icon} size={16} className="text-indigo-600" />
                            <div>
                              <h5 className="font-medium text-sm text-foreground">{category?.name}</h5>
                              <p className="text-xs text-muted-foreground">{category?.description}</p>
                            </div>
                          </div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(e, category?.id)}
                              className="hidden"
                            />
                            <Button variant="outline" size="sm" iconName="Plus" className="text-xs px-2 py-1">
                              Agregar
                            </Button>
                          </label>
                        </div>
                        
                        {categoryPhotos?.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {categoryPhotos?.map((photo) => (
                                <div key={photo?.id} className="relative group overflow-hidden">
                                <img
                                  src={photo?.url}
                                  alt={`${category?.name} evidence`}
                                  className="w-full h-16 object-cover rounded border"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-1 -right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removePhoto(photo?.id)}
                                >
                                  <Icon name="X" size={10} />
                                </Button>
                                <input
                                  type="text"
                                  placeholder="Descripción..."
                                  value={photo?.description}
                                  onChange={(e) => updatePhotoDescription(photo?.id, e?.target?.value)}
                                  className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded-b truncate"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 border-2 border-dashed border-muted rounded">
                            <Icon name="ImagePlus" size={24} className="text-muted-foreground mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No hay fotos para esta categoría</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Required Documents */}
              <div className="mt-6">
                <h4 className="font-medium text-sm text-foreground mb-3">Documentos Requeridos:</h4>
                
                <div className="space-y-2">
                  {requiredDocuments?.map((docType) => {
                    const uploadedDoc = documents?.find(doc => doc?.type === docType?.id);
                    
                    return (
                      <div key={docType?.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        docType?.required ? 'bg-indigo-50 border border-indigo-200' : 'bg-muted'
                      }`}>
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            uploadedDoc ? 'bg-green-500' : docType?.required ? 'bg-indigo-500' : 'bg-gray-500'
                          } overflow-hidden`}> 
                            <Icon name={docType?.icon} size={16} color="white" />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-foreground flex items-center space-x-2">
                              <span>{docType?.name}</span>
                              {docType?.required && (
                                <span className="px-2 py-1 bg-indigo-500 text-white text-xs rounded-full">
                                  Obligatorio
                                </span>
                              )}
                            </h5>
                            <p className="text-xs text-muted-foreground">{docType?.description}</p>
                            {uploadedDoc && (
                              <p className="text-xs text-green-600 truncate">Archivo: {uploadedDoc?.name}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {uploadedDoc ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                iconName="Eye"
                                className="text-xs px-2 py-1"
                                onClick={() => window.open(uploadedDoc?.url, '_blank')}
                              >
                                Ver
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                iconName="Trash2"
                                className="text-xs px-2 py-1"
                                onClick={() => removeDocument(uploadedDoc?.id)}
                              >
                                Eliminar
                              </Button>
                            </>
                          ) : (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.png"
                                onChange={(e) => handleDocumentUpload(e, docType?.id)}
                                className="hidden"
                              />
                              <Button variant="outline" size="sm" iconName="Upload" className="text-xs px-2 py-1">
                                Subir
                              </Button>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submission Notes */}
              <div className="mt-4">
                <textarea
                  placeholder="Notas adicionales para el equipo de Proyectos..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e?.target?.value)}
                  className="w-full p-3 border border-border rounded-lg resize-none h-20 text-sm"
                />
              </div>

              {/* Summary and Submit */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm text-foreground">Resumen de Evidencias</h4>
                  <div className="text-xs text-muted-foreground">
                    Última actualización: {new Date()?.toLocaleString('es-MX')}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">{evidencePhotos?.length}</div>
                    <div className="text-xs text-muted-foreground">Fotografías</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{documents?.length}</div>
                    <div className="text-xs text-muted-foreground">Documentos</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${
                      workOrder?.evidenceSubmission?.submittedToProjects ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {workOrder?.evidenceSubmission?.submittedToProjects ? 'Enviado' : 'Pendiente'}
                    </div>
                    <div className="text-xs text-muted-foreground">Estado</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Eye"
                  onClick={() => setSelectedOrder(selectedOrder === workOrder?.id ? null : workOrder?.id)}
                >
                  {selectedOrder === workOrder?.id ? 'Ocultar' : 'Vista Previa'}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSubmitEvidence(workOrder)}
                  iconName="Send"
                  disabled={workOrder?.evidenceSubmission?.submittedToProjects}
                >
                  Enviar a Proyectos
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceSubmissionPanel;