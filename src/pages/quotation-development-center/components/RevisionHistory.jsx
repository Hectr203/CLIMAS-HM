import React from 'react';
        import Icon from '../../../components/AppIcon';
        import Button from '../../../components/ui/Button';

        const RevisionHistory = ({ quotation }) => {
          const formatDate = (dateString) => {
            return new Date(dateString)?.toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          };

          const handleRestoreVersion = (version) => {
            console.log('Restore version:', version);
            // Implementation would restore the specific version
          };

          const handleCompareVersions = (version1, version2) => {
            console.log('Compare versions:', version1, version2);
            // Implementation would show version comparison
          };

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Historial de Revisiones</h3>
                <div className="text-sm text-muted-foreground">
                  Versión actual: {quotation?.revisions?.[quotation?.revisions?.length - 1]?.version || '1.0'}
                </div>
              </div>

              {/* Timeline of Revisions */}
              <div className="space-y-4">
                {quotation?.revisions?.map((revision, index) => (
                  <div key={index} className="relative">
                    {/* Timeline Line */}
                    {index < quotation?.revisions?.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-16 bg-border"></div>
                    )}
                    
                    {/* Revision Card */}
                    <div className="flex items-start space-x-4">
                      {/* Timeline Dot */}
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        index === quotation?.revisions?.length - 1
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border text-muted-foreground'
                      }`}>
                        <Icon 
                          name={index === quotation?.revisions?.length - 1 ? 'Check' : 'GitCommit'} 
                          size={14} 
                        />
                      </div>

                      {/* Revision Details */}
                      <div className="flex-1 bg-card border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Versión {revision?.version}</span>
                            {index === quotation?.revisions?.length - 1 && (
                              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                                Actual
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Icon name="User" size={14} />
                            <span>{revision?.author}</span>
                          </div>
                        </div>

                        <p className="text-sm text-foreground mb-3">{revision?.changes}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Icon name="Calendar" size={12} />
                            <span>{formatDate(revision?.date)}</span>
                          </div>

                          <div className="flex space-x-2">
                            {index !== quotation?.revisions?.length - 1 && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreVersion(revision?.version)}
                                  iconName="RotateCcw"
                                  className="text-xs"
                                >
                                  Restaurar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompareVersions(revision?.version, quotation?.revisions?.[quotation?.revisions?.length - 1]?.version)}
                                  iconName="GitCompare"
                                  className="text-xs"
                                >
                                  Comparar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* No Revisions State */}
                {(!quotation?.revisions || quotation?.revisions?.length === 0) && (
                  <div className="text-center py-8">
                    <Icon name="GitBranch" size={32} className="text-muted-foreground mx-auto mb-2" />
                    <h4 className="font-medium text-foreground mb-1">Sin revisiones</h4>
                    <p className="text-sm text-muted-foreground">
                      Las revisiones aparecerán aquí cuando se realicen cambios
                    </p>
                  </div>
                )}
              </div>

              {/* Revision Statistics */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-3">Estadísticas de Revisión</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="GitCommit" size={16} className="text-muted-foreground" />
                    <span>Total de revisiones: {quotation?.revisions?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="User" size={16} className="text-muted-foreground" />
                    <span>Última modificación: {quotation?.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={16} className="text-muted-foreground" />
                    <span>Fecha: {formatDate(quotation?.lastModified)}</span>
                  </div>
                </div>
              </div>

              {/* Change Tracking */}
              <div className="space-y-4">
                <h4 className="font-medium">Control de Cambios</h4>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Shield" size={16} className="text-green-600" />
                    <span className="font-medium text-green-800">Trazabilidad Completa</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Todos los cambios son registrados automáticamente para mantener un historial completo de la cotización.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="FileText" size={16} className="text-primary" />
                      <span className="font-medium">Cambios de Contenido</span>
                    </div>
                    <p className="text-muted-foreground">
                      Modificaciones en alcance, supuestos, condiciones y montos son registradas.
                    </p>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="Users" size={16} className="text-primary" />
                      <span className="font-medium">Autoría</span>
                    </div>
                    <p className="text-muted-foreground">
                      Cada cambio incluye información del usuario que lo realizó y la fecha exacta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        };

        export default RevisionHistory;