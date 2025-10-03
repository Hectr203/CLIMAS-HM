import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DocumentUploadPanel = ({ project, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');

  const documentTypes = [
    { value: 'catalog', label: 'Catálogo Cliente', icon: 'Book' },
    { value: 'plan', label: 'Planos de Obra', icon: 'FileText' },
    { value: 'requirement', label: 'Requerimientos', icon: 'CheckSquare' },
    { value: 'location', label: 'Ubicación de Obra', icon: 'MapPin' },
    { value: 'contract', label: 'Contrato', icon: 'FileSignature' },
    { value: 'certification', label: 'Certificación', icon: 'Award' }
  ];

  const handleFileSelect = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) return;

    setIsUploading(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const document = {
      id: Date.now()?.toString(),
      name: selectedFile?.name,
      type: documentType,
      status: 'uploaded',
      uploadedAt: new Date()?.toISOString(),
      size: selectedFile?.size
    };

    onUpload?.(document);
    
    setSelectedFile(null);
    setDocumentType('');
    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon name="Upload" size={16} className="text-primary" />
        <h4 className="font-medium">Gestión de Documentos</h4>
      </div>
      {/* Existing Documents */}
      {project?.documents?.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">Documentos Existentes</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {project?.documents?.map((doc, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <Icon 
                  name={
                    doc?.type === 'catalog' ? 'Book' :
                    doc?.type === 'plan' ? 'FileText' :
                    doc?.type === 'requirement' ? 'CheckSquare' :
                    doc?.type === 'location'? 'MapPin' : 'File'
                  } 
                  size={14} 
                  className="text-primary" 
                />
                <span className="text-sm flex-1">{doc?.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  doc?.status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc?.status === 'uploaded' ? 'Subido' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Upload New Document */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium text-muted-foreground">Subir Nuevo Documento</h5>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Documento</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e?.target?.value)}
            className="w-full p-2 border rounded-md text-sm"
          >
            <option value="">Seleccionar tipo...</option>
            {documentTypes?.map((type) => (
              <option key={type?.value} value={type?.value}>{type?.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Archivo</label>
          <Input
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="text-sm"
          />
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              Archivo seleccionado: {selectedFile?.name}
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || isUploading}
          iconName={isUploading ? "Loader2" : "Upload"}
          iconPosition="left"
          size="sm"
          className="w-full"
        >
          {isUploading ? 'Subiendo...' : 'Subir Documento'}
        </Button>
      </div>
      {/* Upload Guidelines */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={14} className="text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Organización Manual de Documentos</p>
            <p>Los documentos se organizan en carpetas digitales. Asegúrese de seleccionar el tipo correcto para una mejor organización.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPanel;