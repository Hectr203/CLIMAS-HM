import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ImageLightbox = ({ 
  isOpen, 
  onClose, 
  currentImage, 
  images, 
  onNavigate, 
  slideshowMode, 
  onToggleSlideshow 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMetadata, setShowMetadata] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(null);

  // Find current image index
  useEffect(() => {
    if (currentImage && images?.length > 0) {
      const index = images?.findIndex(img => img?.id === currentImage?.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [currentImage, images]);

  // Slideshow functionality
  useEffect(() => {
    if (slideshowMode && isOpen) {
      const interval = setInterval(() => {
        handleNext();
      }, 3000); // 3 seconds per image
      setSlideshowInterval(interval);
      
      return () => {
        clearInterval(interval);
        setSlideshowInterval(null);
      };
    } else {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        setSlideshowInterval(null);
      }
    }
  }, [slideshowMode, isOpen, currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e?.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case ' ':
        e?.preventDefault();
        onToggleSlideshow();
        break;
      case 'i':
        setShowMetadata(!showMetadata);
        break;
      case '=': case'+':
        e?.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e?.preventDefault();
        handleZoomOut();
        break;
      case '0':
        handleZoomReset();
        break;
    }
  }, [isOpen, showMetadata, onToggleSlideshow]);

  useEffect(() => {
    window?.addEventListener('keydown', handleKeyDown);
    return () => window?.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navigation functions
  const handleNext = () => {
    if (images?.length === 0) return;
    const nextIndex = (currentIndex + 1) % images?.length;
    const nextImage = images?.[nextIndex];
    setCurrentIndex(nextIndex);
    onNavigate(nextImage);
    resetZoom();
  };

  const handlePrevious = () => {
    if (images?.length === 0) return;
    const prevIndex = currentIndex === 0 ? images?.length - 1 : currentIndex - 1;
    const prevImage = images?.[prevIndex];
    setCurrentIndex(prevIndex);
    onNavigate(prevImage);
    resetZoom();
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomReset = () => {
    resetZoom();
  };

  // Pan functions
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e?.clientX - panOffset?.x, y: e?.clientY - panOffset?.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e?.clientX - dragStart?.x,
        y: e?.clientY - dragStart?.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Download function
  const handleDownload = async () => {
    if (!currentImage) return;
    
    try {
      const link = document.createElement('a');
      link.href = currentImage?.url;
      link.download = `${currentImage?.title || 'image'}.jpg`;
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              iconName="X"
              onClick={onClose}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            />
            <div className="text-white">
              <h3 className="font-medium">{currentImage?.title}</h3>
              <p className="text-sm text-white/80">
                {currentIndex + 1} de {images?.length} imágenes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Info"
              onClick={() => setShowMetadata(!showMetadata)}
              className={`bg-white/10 border-white/20 text-white hover:bg-white/20 ${
                showMetadata ? 'bg-white/20' : ''
              }`}
            />
            <Button
              variant="outline"
              size="sm"
              iconName={slideshowMode ? "Pause" : "Play"}
              onClick={onToggleSlideshow}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            />
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              onClick={handleDownload}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Main Image Area */}
      <div 
        className="flex items-center justify-center h-full p-20"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage?.url}
          alt={currentImage?.title}
          className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
            zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          } ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset?.x / zoomLevel}px, ${panOffset?.y / zoomLevel}px)`
          }}
          onClick={() => zoomLevel === 1 && setZoomLevel(2)}
          draggable={false}
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white transition-smooth"
        disabled={images?.length <= 1}
      >
        <Icon name="ChevronLeft" size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white transition-smooth"
        disabled={images?.length <= 1}
      >
        <Icon name="ChevronRight" size={24} />
      </button>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Minus"
          onClick={handleZoomOut}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          disabled={zoomLevel <= 0.5}
        />
        <span className="text-white text-sm px-3 py-1 bg-white/10 rounded">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          iconName="Plus"
          onClick={handleZoomIn}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          disabled={zoomLevel >= 5}
        />
        <Button
          variant="outline"
          size="sm"
          iconName="RotateCcw"
          onClick={handleZoomReset}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        />
      </div>

      {/* Image Counter */}
      <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2 text-white text-sm">
          <Icon name="Image" size={16} />
          <span>{currentIndex + 1} / {images?.length}</span>
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div className="absolute top-20 right-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Información de la Imagen</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Título:</span>
                  <span className="ml-2 text-foreground">{currentImage?.title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="ml-2 text-foreground">{currentImage?.categoryLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fase:</span>
                  <span className="ml-2 text-foreground">{currentImage?.phaseLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Descripción:</span>
                  <p className="mt-1 text-foreground">{currentImage?.description}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">Detalles del Archivo</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Tamaño:</span>
                  <span className="ml-2 text-foreground">{currentImage?.fileSize}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="ml-2 text-foreground">{currentImage?.fileType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Dimensiones:</span>
                  <span className="ml-2 text-foreground">{currentImage?.dimensions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Subido por:</span>
                  <span className="ml-2 text-foreground">{currentImage?.uploader}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="ml-2 text-foreground">{formatDate(currentImage?.uploadDate)}</span>
                </div>
              </div>
            </div>
            
            {currentImage?.tags && currentImage?.tags?.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-1">
                  {currentImage?.tags?.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slideshow Progress */}
      {slideshowMode && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-primary transition-all duration-3000 ease-linear"
            style={{ width: `${((currentIndex + 1) / images?.length) * 100}%` }}
          />
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-white text-xs opacity-60">
        ESC: Cerrar | ←→: Navegar | Espacio: Presentación | I: Info | +/-: Zoom
      </div>
    </div>
  );
};

export default ImageLightbox;