import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentTree = ({ project, onDocumentUpload }) => {
  const [expandedFolders, setExpandedFolders] = useState(['clientInfo', 'quotations']);
  const [dragOver, setDragOver] = useState(null);

  const documentFolders = [
    {
      id: 'clientInfo',
      name: 'Información del Cliente',
      icon: 'User',
      color: 'blue',
      description: 'Catálogos, planos, ubicación de obra y requerimientos',
      documents: project?.documents?.clientInfo || []
    },
    {
      id: 'quotations',
      name: 'Cotizaciones',
      icon: 'Calculator',
      color: 'green',
      description: 'Cotizaciones iniciales, ajustadas y aprobadas',
      documents: project?.documents?.quotations || []
    },
    {
      id: 'contracts',
      name: 'Contratos',
      icon: 'FileText',
      color: 'purple',
      description: 'Contratos, términos y condiciones',
      documents: project?.documents?.contracts || []
    },
    {
      id: 'progressPhotos',
      name: 'Fotos de Avance',
      icon: 'Camera',
      color: 'orange',
      description: 'Documentación fotográfica del progreso',
      documents: project?.documents?.progressPhotos || []
    },
    {
      id: 'certifications',
      name: 'Certificaciones',
      icon: 'Award',
      color: 'yellow',
      description: 'Certificaciones de materiales y conformidad',
      documents: project?.documents?.certifications || []
    },
    {
      id: 'finalDocs',
      name: 'Documentación Final',
      icon: 'FileCheck',
      color: 'indigo',
      description: 'Facturas, comprobantes y documentos de cierre',
      documents: project?.documents?.finalDocs || []
    }
  ];

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev =>
      prev?.includes(folderId)
        ? prev?.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleDragOver = (e, folderId) => {
    e?.preventDefault();
    setDragOver(folderId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e, folderId) => {
    e?.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e?.dataTransfer?.files);
    files?.forEach(file => {
      const document = {
        name: file?.name,
        type: file?.type?.includes('image') ? 'image' : 
              file?.type?.includes('pdf') ? 'pdf' : 
              file?.type?.includes('excel') || file?.type?.includes('sheet') ? 'excel' : 'file',
        size: `${(file?.size / (1024 * 1024))?.toFixed(1)} MB`,
        uploaded: true,
        uploadDate: new Date()?.toISOString()
      };
      onDocumentUpload(project?.id, folderId, document);
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return 'FileText';
      case 'excel': return 'Sheet';
      case 'image': return 'Image';
      case 'dwg': return 'PenTool';
      default: return 'File';
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'text-red-600';
      case 'excel': return 'text-green-600';
      case 'image': return 'text-blue-600';
      case 'dwg': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Árbol de Documentos</h3>
          <p className="text-muted-foreground text-sm">
            Organización estructurada con carpetas digitales
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Search"
            iconPosition="left"
          >
            Buscar
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Filter"
            iconPosition="left"
          >
            Filtrar
          </Button>
          <Button
            size="sm"
            iconName="FolderPlus"
            iconPosition="left"
          >
            Nueva Carpeta
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {documentFolders?.map((folder) => (
          <div key={folder?.id} className="border border-border rounded-lg">
            {/* Folder Header */}
            <div
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                dragOver === folder?.id ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => toggleFolder(folder?.id)}
              onDragOver={(e) => handleDragOver(e, folder?.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folder?.id)}
            >
              <div className="flex items-center space-x-3">
                <button className="p-1">
                  <Icon
                    name={expandedFolders?.includes(folder?.id) ? 'ChevronDown' : 'ChevronRight'}
                    size={16}
                    className="text-muted-foreground"
                  />
                </button>
                <div className={`p-2 rounded-lg bg-${folder?.color}-100`}>
                  <Icon
                    name={folder?.icon}
                    size={18}
                    className={`text-${folder?.color}-600`}
                  />
                </div>
                <div>
                  <div className="font-medium text-foreground">{folder?.name}</div>
                  <div className="text-sm text-muted-foreground">{folder?.description}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  {folder?.documents?.length} {folder?.documents?.length === 1 ? 'archivo' : 'archivos'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Upload"
                  iconPosition="left"
                  onClick={(e) => {
                    e?.stopPropagation();
                    // Trigger file upload
                  }}
                >
                  Subir
                </Button>
              </div>
            </div>

            {/* Folder Contents */}
            {expandedFolders?.includes(folder?.id) && (
              <div className="border-t border-border bg-muted/20">
                {folder?.documents?.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {folder?.documents?.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon
                            name={getFileIcon(doc?.type)}
                            size={16}
                            className={getFileTypeColor(doc?.type)}
                          />
                          <div>
                            <div className="font-medium text-sm">{doc?.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center space-x-2">
                              <span>{doc?.size}</span>
                              {doc?.count && <span>• {doc?.count} fotos</span>}
                              {doc?.uploaded && (
                                <span className="flex items-center space-x-1 text-green-600">
                                  <Icon name="CheckCircle" size={12} />
                                  <span>Subido</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Eye"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Download"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="MoreVertical"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Icon
                      name="Upload"
                      size={32}
                      className="text-muted-foreground mx-auto mb-2"
                    />
                    <p className="text-muted-foreground text-sm mb-2">
                      No hay documentos en esta carpeta
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Arrastra archivos aquí o haz clic en "Subir"
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Upload"
                      iconPosition="left"
                    >
                      Subir Archivos
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Bulk Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Acciones en lote:</span>
          <Button variant="ghost" size="sm" iconName="Download">
            Descargar Todo
          </Button>
          <Button variant="ghost" size="sm" iconName="Archive">
            Archivar
          </Button>
          <Button variant="ghost" size="sm" iconName="Share">
            Compartir
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="HardDrive" size={16} />
          <span>
            {documentFolders?.reduce((total, folder) => total + folder?.documents?.length, 0)} archivos totales
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentTree;