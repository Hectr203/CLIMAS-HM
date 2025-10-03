import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ReceiptManagementPanel = ({ receipts, onUpload, onDelete, onCategorize }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const categoryOptions = [
    { value: '', label: 'Todas las Categorías' },
    { value: 'Viajes', label: 'Viajes' },
    { value: 'Materiales', label: 'Materiales' },
    { value: 'Servicios', label: 'Servicios' },
    { value: 'Equipos', label: 'Equipos' },
    { value: 'Otros', label: 'Otros' }
  ];

  const handleFileUpload = async (event) => {
    const files = Array.from(event?.target?.files);
    if (files?.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files?.length; i++) {
        const file = files?.[i];
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const newReceipt = {
          id: Date.now() + i,
          name: file?.name,
          size: file?.size,
          type: file?.type,
          uploadDate: new Date()?.toLocaleDateString('es-MX'),
          category: 'Sin Categorizar',
          status: 'Pendiente',
          url: URL.createObjectURL(file)
        };

        await onUpload(newReceipt);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCategorize = async (receiptId, category) => {
    try {
      await onCategorize(receiptId, category);
    } catch (error) {
      console.error('Error categorizing receipt:', error);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes('image')) return 'Image';
    if (type?.includes('pdf')) return 'FileText';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return 'FileSpreadsheet';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const filteredReceipts = receipts?.filter(receipt => {
    const matchesSearch = receipt?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         receipt?.category?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesCategory = filterCategory === '' || receipt?.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Gestión de Recibos</h3>
            <p className="text-sm text-muted-foreground">
              Subir, categorizar y gestionar documentos de gastos
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="file"
              id="receipt-upload"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="default"
              onClick={() => document.getElementById('receipt-upload')?.click()}
              disabled={isUploading}
              iconName="Upload"
              iconPosition="left"
            >
              Subir Recibos
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Subiendo archivos...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar recibos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="pl-10"
            />
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <Select
            placeholder="Filtrar por categoría"
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
          />
        </div>
      </div>
      <div className="p-6">
        {filteredReceipts?.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No hay recibos</h4>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterCategory ? 'No se encontraron recibos con los filtros aplicados' : 'Comience subiendo sus primeros recibos'}
            </p>
            {!searchTerm && !filterCategory && (
              <Button
                variant="outline"
                onClick={() => document.getElementById('receipt-upload')?.click()}
                iconName="Upload"
                iconPosition="left"
              >
                Subir Primer Recibo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceipts?.map((receipt) => (
              <div key={receipt?.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-smooth">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Icon name={getFileIcon(receipt?.type)} size={20} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-foreground truncate">{receipt?.name}</h4>
                      <p className="text-xs text-muted-foreground">{formatFileSize(receipt?.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedReceipt(receipt)}
                      className="h-8 w-8"
                    >
                      <Icon name="Eye" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(receipt?.id)}
                      className="h-8 w-8 text-error hover:text-error"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="text-foreground">{receipt?.uploadDate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className={`px-2 py-1 rounded-full ${
                      receipt?.status === 'Procesado' ? 'bg-success text-success-foreground' :
                      receipt?.status === 'En Revisión' ? 'bg-warning text-warning-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {receipt?.status}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Select
                      placeholder="Categorizar"
                      options={categoryOptions?.filter(opt => opt?.value !== '')}
                      value={receipt?.category === 'Sin Categorizar' ? '' : receipt?.category}
                      onChange={(value) => handleCategorize(receipt?.id, value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1050 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">{selectedReceipt?.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedReceipt(null)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-4 h-96 flex items-center justify-center bg-muted">
              {selectedReceipt?.type?.includes('image') ? (
                <img 
                  src={selectedReceipt?.url} 
                  alt={selectedReceipt?.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Icon name={getFileIcon(selectedReceipt?.type)} size={64} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Vista previa no disponible para este tipo de archivo</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(selectedReceipt?.url, '_blank')}
                    iconName="ExternalLink"
                    iconPosition="left"
                  >
                    Abrir Archivo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptManagementPanel;