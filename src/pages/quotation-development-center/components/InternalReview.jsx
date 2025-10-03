import React, { useState } from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';
        import Input from '../../../components/ui/Input';

        const InternalReview = ({ quotation, onSubmitReview }) => {
          const [reviewData, setReviewData] = useState(quotation?.internalReview || {
            status: 'pending',
            reviewAreas: {
              pricing: { reviewed: false, reviewer: '', comments: '' },
              scope: { reviewed: false, reviewer: '', comments: '' },
              timeline: { reviewed: false, reviewer: '', comments: '' },
              technical: { reviewed: false, reviewer: '', comments: '' }
            }
          });

          const [overallComments, setOverallComments] = useState('');

          const reviewAreas = [
            { 
              key: 'pricing', 
              name: 'Precios y Costos', 
              icon: 'DollarSign',
              description: 'Revisión de precios competitivos y márgenes'
            },
            { 
              key: 'scope', 
              name: 'Alcance y Supuestos', 
              icon: 'FileText',
              description: 'Validación del alcance definido y supuestos'
            },
            { 
              key: 'timeline', 
              name: 'Cronograma', 
              icon: 'Calendar',
              description: 'Evaluación de tiempos de ejecución'
            },
            { 
              key: 'technical', 
              name: 'Aspectos Técnicos', 
              icon: 'Settings',
              description: 'Revisión de solución técnica propuesta'
            }
          ];

          const handleAreaChange = (area, field, value) => {
            setReviewData(prev => ({
              ...prev,
              reviewAreas: {
                ...prev?.reviewAreas,
                [area]: {
                  ...prev?.reviewAreas?.[area],
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
          };

          const handleApproveReview = () => {
            const allAreasReviewed = Object.values(reviewData?.reviewAreas)?.every(area => area?.reviewed);
            
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
            const totalAreas = Object.keys(reviewData?.reviewAreas)?.length;
            const reviewedAreas = Object.values(reviewData?.reviewAreas)?.filter(area => area?.reviewed)?.length;
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
                          reviewData?.reviewAreas?.[area?.key]?.reviewed 
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
                            {reviewData?.reviewAreas?.[area?.key]?.reviewed && (
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
                              value={reviewData?.reviewAreas?.[area?.key]?.reviewer}
                              onChange={(e) => handleAreaChange(area?.key, 'reviewer', e?.target?.value)}
                              placeholder="Nombre del revisor"
                              size="sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`reviewed-${area?.key}`}
                                checked={reviewData?.reviewAreas?.[area?.key]?.reviewed}
                                onChange={(e) => handleAreaChange(area?.key, 'reviewed', e?.target?.checked)}
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
                            value={reviewData?.reviewAreas?.[area?.key]?.comments}
                            onChange={(e) => handleAreaChange(area?.key, 'comments', e?.target?.value)}
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