import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import ImageLightbox from './ImageLightbox';

const ImageGallery = ({ images = [], onDeleteImage, onUpdateImage, projectInfo }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [viewMode, setViewMode] = useState('masonry'); // masonry, grid, list

  const categoryOptions = [
    { value: 'all', label: 'Todas las Categorías' },
    { value: 'general', label: 'General' },
    { value: 'construction', label: 'Construcción' },
    { value: 'installation', label: 'Instalación' },
    { value: 'testing', label: 'Pruebas' },
    { value: 'completion', label: 'Finalización' },
    { value: 'quality-control', label: 'Control de Calidad' },
    { value: 'safety', label: 'Seguridad' },
    { value: 'documentation', label: 'Documentación' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Más Recientes' },
    { value: 'oldest', label: 'Más Antiguos' },
    { value: 'name', label: 'Por Nombre' },
    { value: 'category', label: 'Por Categoría' }
  ];

  const viewModeOptions = [
    { value: 'masonry', label: 'Mosaico', icon: 'Grid' },
    { value: 'grid', label: 'Cuadrícula', icon: 'Grid3X3' },
    { value: 'list', label: 'Lista', icon: 'List' }
  ];

  // Filter and sort images
  const filteredImages = images
    ?.filter(image => {
      const matchesCategory = selectedCategory === 'all' || image?.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        image?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        image?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b?.timestamp || 0) - new Date(a?.timestamp || 0);
        case 'oldest':
          return new Date(a?.timestamp || 0) - new Date(b?.timestamp || 0);
        case 'name':
          return (a?.name || '')?.localeCompare(b?.name || '');
        case 'category':
          return (a?.category || '')?.localeCompare(b?.category || '');
        default:
          return 0;
      }
    });

  const getCategoryColor = (category) => {
    const colors = {
      'general': 'bg-gray-100 text-gray-800',
      'construction': 'bg-blue-100 text-blue-800',
      'installation': 'bg-green-100 text-green-800',
      'testing': 'bg-yellow-100 text-yellow-800',
      'completion': 'bg-purple-100 text-purple-800',
      'quality-control': 'bg-red-100 text-red-800',
      'safety': 'bg-orange-100 text-orange-800',
      'documentation': 'bg-indigo-100 text-indigo-800'
    };
    return colors?.[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    const option = categoryOptions?.find(opt => opt?.value === category);
    return option?.label || category;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp)?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteImage = async (image) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la imagen "${image?.name}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await onDeleteImage(image?.id);
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error al eliminar la imagen');
      }
    }
  };

  const exportGallery = () => {
    const galleryData = {
      project: projectInfo,
      images: filteredImages,
      exportDate: new Date()?.toISOString(),
      totalImages: filteredImages?.length
    };

    const blob = new Blob([JSON.stringify(galleryData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `galeria-${projectInfo?.code || 'proyecto'}-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!images?.length) {
    return (
      <div className="text-center py-12">
        <Icon name="Image" size={64} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No hay imágenes</h3>
        <p className="text-muted-foreground">
          Las imágenes subidas para este proyecto aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              placeholder="Buscar imágenes..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-md text-sm min-w-48"
          >
            {categoryOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-md text-sm min-w-40"
          >
            {sortOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode and Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-muted rounded-lg p-1">
            {viewModeOptions?.map(mode => (
              <button
                key={mode?.value}
                onClick={() => setViewMode(mode?.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-smooth ${
                  viewMode === mode?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={mode?.label}
              >
                <Icon name={mode?.icon} size={16} />
                <span className="hidden sm:inline text-sm">{mode?.label}</span>
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={exportGallery}
          >
            Exportar
          </Button>
        </div>
      </div>
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredImages?.length} de {images?.length} imágenes
        </p>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={() => setSearchTerm('')}
          >
            Limpiar búsqueda
          </Button>
        )}
      </div>
      {/* Image Gallery */}
      {filteredImages?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No se encontraron imágenes con los filtros seleccionados
          </p>
        </div>
      ) : (
        <>
          {/* Masonry View */}
          {viewMode === 'masonry' && (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {filteredImages?.map((image, index) => (
                <div 
                  key={image?.id || index} 
                  className="break-inside-avoid bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative group">
                    <Image
                      src={image?.src || image?.url}
                      alt={image?.name}
                      className="w-full h-auto cursor-pointer"
                      onClick={() => setLightboxImage(image)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Eye"
                        onClick={() => setLightboxImage(image)}
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">{image?.name}</h4>
                      <button
                        onClick={() => handleDeleteImage(image)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image?.category)}`}>
                        {getCategoryLabel(image?.category)}
                      </span>
                      
                      {image?.description && (
                        <p className="text-xs text-muted-foreground">
                          {image?.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatDate(image?.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredImages?.map((image, index) => (
                <div 
                  key={image?.id || index}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square group">
                    <Image
                      src={image?.src || image?.url}
                      alt={image?.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setLightboxImage(image)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Eye"
                        onClick={() => setLightboxImage(image)}
                      >
                        Ver
                      </Button>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(image)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                  
                  <div className="p-3">
                    <h4 className="font-medium text-foreground text-sm mb-1 truncate">
                      {image?.name}
                    </h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image?.category)}`}>
                      {getCategoryLabel(image?.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredImages?.map((image, index) => (
                <div 
                  key={image?.id || index}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={image?.src || image?.url}
                        alt={image?.name}
                        className="w-full h-full object-cover rounded cursor-pointer"
                        onClick={() => setLightboxImage(image)}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{image?.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image?.category)}`}>
                              {getCategoryLabel(image?.category)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(image?.timestamp)}
                            </span>
                          </div>
                          {image?.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {image?.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Eye"
                            onClick={() => setLightboxImage(image)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            iconName="Trash2"
                            onClick={() => handleDeleteImage(image)}
                            className="text-red-500 hover:text-red-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage}
          images={filteredImages}
          onClose={() => setLightboxImage(null)}
          onNavigate={setLightboxImage}
          onDelete={handleDeleteImage}
          onUpdate={onUpdateImage}
        />
      )}
    </div>
  );
};

export default ImageGallery;