import React, { useState } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import useQuotation from '../../../hooks/useQuotation';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const InternalReview = ({ quotation, onSubmitReview }) => {
          const { showSuccess, showError } = useNotifications();
          const { upsertRevision } = useQuotation();
          // Función para enviar la revisión al backend
          const sendRevisionToBackend = async (reviewData) => {
            try {
              const fechaHoy = new Date().toISOString().split('T')[0];
              // Construir el objeto de revisión para el backend con todas las áreas
              const areaMap = {
                preciosYCostos: 'Precios y Costos',
                alcanceYSupuestos: 'Alcance y Supuestos',
                cronograma: 'Cronograma',
                aspectosTecnicos: 'Aspectos Técnicos'
              };
              const areasRevision = {};
              Object.entries(reviewData?.areasRevision || {}).forEach(([key, value]) => {
                const areaName = areaMap[key] || key;
                areasRevision[areaName] = {
                  [fechaHoy]: {
                    revisor: value?.revisor || '',
                    revisado: value?.revisado || false,
                    descripcion: value?.comentarios || '',
                    fecha: fechaHoy
                  }
                };
              });
              const revisionPayload = {
                idCotizacion: quotation?.id,
                areasRevision,
                comentariosGenerales: overallComments
              };
              await upsertRevision(revisionPayload);
              showSuccess('Revisión enviada');
            } catch (err) {
              showError('Error al enviar la revisión');
            }
          };
          const [reviewData, setReviewData] = useState(quotation?.internalReview || {
            status: 'pending',
            areasRevision: {
              preciosYCostos: { revisado: false, revisor: '', comentarios: '' },
              alcanceYSupuestos: { revisado: false, revisor: '', comentarios: '' },
              cronograma: { revisado: false, revisor: '', comentarios: '' },
              aspectosTecnicos: { revisado: false, revisor: '', comentarios: '' }
            }
          });

          const [overallComments, setOverallComments] = useState('');

          const reviewAreas = [
            { 
              key: 'preciosYCostos', 
              name: 'Precios y Costos', 
              icon: 'DollarSign',
              description: 'Revisión de precios competitivos y márgenes'
            },
            { 
              key: 'alcanceYSupuestos', 
              name: 'Alcance y Supuestos', 
              icon: 'FileText',
              description: 'Validación del alcance definido y supuestos'
            },
            { 
              key: 'cronograma', 
              name: 'Cronograma', 
              icon: 'Calendar',
              description: 'Evaluación de tiempos de ejecución'
            },
            { 
              key: 'aspectosTecnicos', 
              name: 'Aspectos Técnicos', 
              icon: 'Settings',
              description: 'Revisión de solución técnica propuesta'
            }
          ];

          const handleAreaChange = (area, field, value) => {
            setReviewData(prev => ({
              ...prev,
              areasRevision: {
                ...prev?.areasRevision,
                [area]: {
                  ...prev?.areasRevision?.[area],
                  [field]: value
                }
              }
            }));
          };

          const handleSubmitForReview = () => {
            const updatedReview = {
              ...reviewData,
              status: 'in-review',
              submittedDate: new Date()?.toISOString()?.split('T')?.[0],
              submittedBy: quotation?.assignedTo
            };
            onSubmitReview?.(updatedReview);
            sendRevisionToBackend(updatedReview);
          };

          const handleApproveReview = () => {
            const allAreasReviewed = Object.values(reviewData?.areasRevision)?.every(area => area?.revisado);
            if (!allAreasReviewed) {
              alert('Todas las áreas deben ser revisadas antes de la aprobación');
              return;
            }
            const approvedReview = {
              ...reviewData,
              status: 'approved',
              approvedDate: new Date()?.toISOString()?.split('T')?.[0],
              approvedBy: 'Ventas/Martín', // This would come from current user
              overallComments
            };
            onSubmitReview?.(approvedReview);
            sendRevisionToBackend(approvedReview);
          };

          const getStatusColor = (status) => {
            switch (status) {
              case 'approved': return 'text-green-600 bg-green-50 border-green-200';
              case 'in-review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
              case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
              case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
              default: return 'text-gray-600 bg-gray-50 border-gray-200';
            }
          };

          const getCompletionPercentage = () => {
            const totalAreas = Object.keys(reviewData?.areasRevision)?.length;
            const reviewedAreas = Object.values(reviewData?.areasRevision)?.filter(area => area?.revisado)?.length;
            return Math.round((reviewedAreas / totalAreas) * 100);
          };

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Revisión Comercial Interna</h3>
                  <p className="text-sm text-muted-foreground">
                    Validación de precios, alcances y tiempos antes del envío al cliente
                  </p>
                </div>
                <div className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(reviewData?.status)}`}>
                  {reviewData?.status === 'approved' ? 'Aprobada' :
                   reviewData?.status === 'in-review' ? 'En Revisión' :
                   reviewData?.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                </div>
              </div>

              {/* Review Progress */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Progreso de Revisión</span>
                  <span className="text-sm text-muted-foreground">{getCompletionPercentage()}% completado</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Review Areas */}
              <div className="space-y-4">
                <h4 className="font-medium">Áreas de Revisión</h4>
                
                {reviewAreas?.map((area) => (
                  <div key={area?.key} className="bg-card border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {/* Area Icon and Info */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          reviewData?.areasRevision?.[area?.key]?.revisado 
                            ? 'bg-green-100 text-green-600' :'bg-muted text-muted-foreground'
                        }`}>
                          <Icon name={area?.icon} size={20} />
                        </div>
                      </div>

                      {/* Area Content */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium">{area?.name}</h5>
                            {reviewData?.areasRevision?.[area?.key]?.revisado && (
                              <Icon name="CheckCircle" size={16} className="text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{area?.description}</p>
                        </div>

                        {/* Reviewer Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Revisor</label>
                            <Input
                              value={reviewData?.areasRevision?.[area?.key]?.revisor}
                              onChange={(e) => handleAreaChange(area?.key, 'revisor', e?.target?.value)}
                              placeholder="Nombre del revisor"
                              size="sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`reviewed-${area?.key}`}
                                checked={reviewData?.areasRevision?.[area?.key]?.revisado}
                                onChange={(e) => handleAreaChange(area?.key, 'revisado', e?.target?.checked)}
                                className="rounded border-border"
                              />
                              <label htmlFor={`reviewed-${area?.key}`} className="text-sm">
                                Revisado
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Comments */}
                        <div>
                          <label className="text-sm font-medium mb-1 block">Comentarios</label>
                          <textarea
                            value={reviewData?.areasRevision?.[area?.key]?.comentarios}
                            onChange={(e) => handleAreaChange(area?.key, 'comentarios', e?.target?.value)}
                            placeholder="Comentarios y observaciones..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Comentarios Generales</label>
                <textarea
                  value={overallComments}
                  onChange={(e) => setOverallComments(e?.target?.value)}
                  placeholder="Comentarios generales sobre la cotización..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background resize-none"
                />
              </div>

              {/* Review Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  {reviewData?.approvedDate && (
                    <p>Aprobada el {reviewData?.approvedDate} por {reviewData?.approvedBy}</p>
                  )}
                  {reviewData?.submittedDate && reviewData?.status !== 'approved' && (
                    <p>Enviada para revisión el {reviewData?.submittedDate}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {reviewData?.status === 'pending' && (
                    <Button
                      onClick={handleSubmitForReview}
                      iconName="Send"
                      iconPosition="left"
                    >
                      Enviar para Revisión
                    </Button>
                  )}
                  
                  {reviewData?.status === 'in-review' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onSubmitReview?.({ ...reviewData, status: 'rejected' })}
                        iconName="X"
                        iconPosition="left"
                      >
                        Rechazar
                      </Button>
                      <Button
                        onClick={handleApproveReview}
                        iconName="CheckCircle"
                        iconPosition="left"
                      >
                        Aprobar
                      </Button>
                    </>
                  )}

                  {reviewData?.status === 'approved' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Icon name="CheckCircle" size={16} />
                      <span className="text-sm font-medium">Cotización aprobada</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Info" size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-800">Criterios de Revisión</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Verificar competitividad de precios en el mercado</li>
                  <li>• Validar que el alcance esté completo y bien definido</li>
                  <li>• Confirmar que los tiempos de ejecución sean realistas</li>
                  <li>• Revisar viabilidad técnica de la solución propuesta</li>
                </ul>
              </div>
            </div>
          );
        };

        export default InternalReview;