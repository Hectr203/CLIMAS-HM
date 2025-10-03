import React from 'react';
import Icon from '../../../components/AppIcon';


const ImageGallery = ({ images, selectedImages, onImageSelect, onImageClick, viewMode }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'material-reception': 'bg-blue-100 text-blue-800',
      'manufacturing': 'bg-orange-100 text-orange-800',
      'quality-control': 'bg-purple-100 text-purple-800',
      'documentation': 'bg-green-100 text-green-800',
      'installation': 'bg-indigo-100 text-indigo-800',
      'testing': 'bg-yellow-100 text-yellow-800',
      'training': 'bg-pink-100 text-pink-800',
      'completion': 'bg-emerald-100 text-emerald-800',
      'new-upload': 'bg-gray-100 text-gray-800'
    };
    return colors?.[category] || 'bg-gray-100 text-gray-800';
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'planning': 'text-blue-600',
      'in-progress': 'text-orange-600',
      'completed': 'text-green-600',
      'on-hold': 'text-yellow-600',
      'cancelled': 'text-red-600'
    };
    return colors?.[phase] || 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {images?.map((image) => (
          <div 
            key={image?.id} 
            className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-smooth"
          >
            <div className="flex items-start space-x-4">
              {/* Selection Checkbox */}
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={selectedImages?.includes(image?.id)}
                  onChange={() => onImageSelect(image?.id)}
                  className="rounded border-border focus:ring-primary"
                />
              </div>
              
              {/* Thumbnail */}
              <div 
                className="flex-shrink-0 cursor-pointer"
                onClick={() => onImageClick(image)}
              >
                <img
                  src={image?.thumbnail}
                  alt={image?.title}
                  className="w-24 h-18 object-cover rounded-lg border hover:shadow-lg transition-smooth"
                />
              </div>
              
              {/* Image Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-lg font-medium text-foreground cursor-pointer hover:text-primary truncate"
                      onClick={() => onImageClick(image)}
                    >
                      {image?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {image?.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(image?.category)}`}>
                      {image?.categoryLabel}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Icon 
                        name="Circle" 
                        size={12} 
                        className={`fill-current ${getPhaseColor(image?.phase)}`}
                      />
                      <span className={`text-xs ${getPhaseColor(image?.phase)}`}>
                        {image?.phaseLabel}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm text-muted-foreground">
                  <div>
                    <span className="block text-xs">Fecha de Subida</span>
                    <span className="text-foreground">{formatDate(image?.uploadDate)}</span>
                  </div>
                  <div>
                    <span className="block text-xs">Subido por</span>
                    <span className="text-foreground">{image?.uploader}</span>
                  </div>
                  <div>
                    <span className="block text-xs">Tamaño</span>
                    <span className="text-foreground">{image?.fileSize}</span>
                  </div>
                  <div>
                    <span className="block text-xs">Dimensiones</span>
                    <span className="text-foreground">{image?.dimensions}</span>
                  </div>
                </div>
                
                {image?.tags && image?.tags?.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {image?.tags?.slice(0, 4)?.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {image?.tags?.length > 4 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                          +{image?.tags?.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid/Masonry View
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images?.map((image, index) => (
        <div 
          key={image?.id} 
          className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-smooth group ${
            index % 7 === 0 ? 'md:col-span-2 md:row-span-2' : 
            index % 5 === 0 ? 'lg:col-span-2' : ''
          }`}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selectedImages?.includes(image?.id)}
              onChange={() => onImageSelect(image?.id)}
              className="rounded border-border bg-white/90 backdrop-blur-sm focus:ring-primary"
            />
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getCategoryColor(image?.category)}`}>
              {image?.categoryLabel}
            </span>
          </div>
          
          {/* Image */}
          <div 
            className="relative cursor-pointer overflow-hidden"
            onClick={() => onImageClick(image)}
          >
            <img
              src={image?.thumbnail}
              alt={image?.title}
              className={`w-full object-cover transition-smooth group-hover:scale-105 ${
                index % 7 === 0 ? 'h-64 md:h-96' : 'h-48'
              }`}
              loading="lazy"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
              <div className="flex items-center space-x-2 text-white">
                <Icon name="Eye" size={20} />
                <span className="text-sm">Ver imagen</span>
              </div>
            </div>
          </div>
          
          {/* Image Info */}
          <div className="p-3">
            <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
              {image?.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{formatDate(image?.uploadDate)}</span>
              <div className="flex items-center space-x-1">
                <Icon 
                  name="Circle" 
                  size={8} 
                  className={`fill-current ${getPhaseColor(image?.phase)}`}
                />
                <span className={getPhaseColor(image?.phase)}>
                  {image?.phaseLabel}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {image?.description}
            </p>
            
            {/* Image Meta */}
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{image?.fileSize}</span>
              <span>por {image?.uploader}</span>
            </div>
            
            {/* Tags Preview */}
            {image?.tags && image?.tags?.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {image?.tags?.slice(0, 2)?.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-1 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                  {image?.tags?.length > 2 && (
                    <span className="px-1 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                      +{image?.tags?.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;