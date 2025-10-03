import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedCount, onBulkDownload, onBulkDelete, onClearSelection }) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <Icon name="CheckSquare" size={16} className="text-primary" />
          </div>
          <div>
            <span className="text-foreground font-medium">
              {selectedCount} imagen{selectedCount !== 1 ? 'es' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
            </span>
            <p className="text-sm text-muted-foreground">
              Elija una acción para aplicar a las imágenes seleccionadas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onBulkDownload}
          >
            Descargar ({selectedCount})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Share"
            iconPosition="left"
            onClick={() => {
              // Share functionality could be implemented here
              alert('Función de compartir próximamente disponible');
            }}
          >
            Compartir
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Archive"
            iconPosition="left"
            onClick={() => {
              // Archive functionality could be implemented here
              alert('Función de archivar próximamente disponible');
            }}
          >
            Archivar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Trash2"
            iconPosition="left"
            onClick={onBulkDelete}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            Eliminar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={onClearSelection}
          >
            Cancelar
          </Button>
        </div>
      </div>
      
      {/* Additional Bulk Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            iconName="Tag"
            iconPosition="left"
            onClick={() => {
              const newTag = prompt('Ingrese una nueva etiqueta para las imágenes seleccionadas:');
              if (newTag) {
                console.log(`Agregando etiqueta "${newTag}" a ${selectedCount} imágenes`);
                // Tag functionality could be implemented here
              }
            }}
          >
            Agregar Etiqueta
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="FolderPlus"
            iconPosition="left"
            onClick={() => {
              // Move to category functionality could be implemented here
              alert('Función de mover a categoría próximamente disponible');
            }}
          >
            Mover a Categoría
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={() => {
              // Batch edit functionality could be implemented here  
              alert('Función de edición en lote próximamente disponible');
            }}
          >
            Editar en Lote
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="FileText"
            iconPosition="left"
            onClick={() => {
              // Generate report functionality could be implemented here
              console.log(`Generando reporte para ${selectedCount} imágenes seleccionadas`);
              alert('Generando reporte de imágenes seleccionadas...');
            }}
          >
            Generar Reporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;