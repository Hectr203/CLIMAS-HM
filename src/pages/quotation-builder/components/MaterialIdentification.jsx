import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MaterialIdentification = ({ quotation, onMaterialUpdate }) => {
  const [materials, setMaterials] = useState(quotation?.materials || []);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    quantity: 1,
    unitPrice: 0,
    source: quotation?.hasCatalog ? 'catalog' : 'plan_analysis'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddMaterial = () => {
    if (!newMaterial?.name || !newMaterial?.quantity || !newMaterial?.unitPrice) return;

    const material = {
      id: Date.now(),
      ...newMaterial,
      total: newMaterial?.quantity * newMaterial?.unitPrice,
      identified: true
    };

    const updatedMaterials = [...materials, material];
    setMaterials(updatedMaterials);
    onMaterialUpdate?.(updatedMaterials);

    setNewMaterial({
      name: '',
      quantity: 1,
      unitPrice: 0,
      source: quotation?.hasCatalog ? 'catalog' : 'plan_analysis'
    });
  };

  const handleMaterialChange = (id, field, value) => {
    const updatedMaterials = materials?.map(material => {
      if (material?.id === id) {
        const updatedMaterial = { ...material, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedMaterial.total = updatedMaterial?.quantity * updatedMaterial?.unitPrice;
        }
        return updatedMaterial;
      }
      return material;
    });

    setMaterials(updatedMaterials);
    onMaterialUpdate?.(updatedMaterials);
  };

  const handleRemoveMaterial = (id) => {
    const updatedMaterials = materials?.filter(material => material?.id !== id);
    setMaterials(updatedMaterials);
    onMaterialUpdate?.(updatedMaterials);
  };

  const handleAutoIdentify = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate automatic material identification
    const autoMaterials = [
      {
        id: Date.now() + 1,
        name: "Diffusor Lineal 600mm",
        quantity: 12,
        unitPrice: 850,
        total: 10200,
        source: "plan_analysis",
        identified: true,
        confidence: 95
      },
      {
        id: Date.now() + 2,
        name: "Tubería Cobre 1/2\"",
        quantity: 25,
        unitPrice: 320,
        total: 8000,
        source: "plan_analysis",
        identified: true,
        confidence: 88
      }
    ];

    const updatedMaterials = [...materials, ...autoMaterials];
    setMaterials(updatedMaterials);
    onMaterialUpdate?.(updatedMaterials);
    setIsAnalyzing(false);
  };

  const getTotalValue = () => {
    return materials?.reduce((sum, material) => sum + (material?.total || 0), 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Identificación de Materiales</h3>
        <div className="flex space-x-2">
          {!quotation?.hasCatalog && (
            <Button
              variant="outline"
              size="sm"
              iconName={isAnalyzing ? "Loader2" : "Search"}
              iconPosition="left"
              onClick={handleAutoIdentify}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analizando...' : 'Auto-Identificar'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            iconName="Upload"
            iconPosition="left"
          >
            Importar desde Inventario
          </Button>
        </div>
      </div>
      {/* Source Method */}
      <div className={`p-4 rounded-lg ${
        quotation?.hasCatalog ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <Icon 
            name={quotation?.hasCatalog ? "Book" : "FileText"} 
            size={16} 
            className={quotation?.hasCatalog ? "text-green-600" : "text-yellow-600"} 
          />
          <h4 className={`font-medium ${
            quotation?.hasCatalog ? "text-green-800" : "text-yellow-800"
          }`}>
            {quotation?.hasCatalog ? "Identificación desde Catálogo" : "Identificación desde Planos"}
          </h4>
        </div>
        <p className={`text-sm ${
          quotation?.hasCatalog ? "text-green-700" : "text-yellow-700"
        }`}>
          {quotation?.hasCatalog 
            ? "Materiales identificados automáticamente desde el catálogo proporcionado por el cliente"
            : "Materiales identificados mediante análisis de planos de obra y especificaciones técnicas"
          }
        </p>
      </div>
      {/* Add New Material */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Agregar Nuevo Material</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Descripción</label>
            <Input
              value={newMaterial?.name}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e?.target?.value }))}
              placeholder="Nombre del material..."
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Cantidad</label>
            <Input
              type="number"
              value={newMaterial?.quantity}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: parseInt(e?.target?.value) || 1 }))}
              min="1"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Precio Unitario</label>
            <Input
              type="number"
              value={newMaterial?.unitPrice}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, unitPrice: parseFloat(e?.target?.value) || 0 }))}
              min="0"
              step="0.01"
              className="text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddMaterial}
              iconName="Plus"
              iconPosition="left"
              size="sm"
              className="w-full"
              disabled={!newMaterial?.name || !newMaterial?.quantity || !newMaterial?.unitPrice}
            >
              Agregar
            </Button>
          </div>
        </div>
      </div>
      {/* Materials Table */}
      <div className="space-y-4">
        <h4 className="font-medium">Lista de Materiales Identificados</h4>
        
        {materials?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Material</th>
                  <th className="text-center p-3 font-medium">Fuente</th>
                  <th className="text-center p-3 font-medium">Cantidad</th>
                  <th className="text-right p-3 font-medium">Precio Unit.</th>
                  <th className="text-right p-3 font-medium">Total</th>
                  <th className="text-center p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials?.map((material) => (
                  <tr key={material?.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <Input
                        value={material?.name}
                        onChange={(e) => handleMaterialChange(material?.id, 'name', e?.target?.value)}
                        className="text-sm border-none bg-transparent"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Icon 
                          name={material?.source === 'catalog' ? 'Book' : 'FileText'} 
                          size={14} 
                          className={material?.source === 'catalog' ? 'text-green-600' : 'text-blue-600'} 
                        />
                        <span className="text-xs">
                          {material?.source === 'catalog' ? 'Catálogo' : 'Planos'}
                        </span>
                        {material?.confidence && (
                          <span className="text-xs text-gray-500">({material?.confidence}%)</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={material?.quantity}
                        onChange={(e) => handleMaterialChange(material?.id, 'quantity', parseInt(e?.target?.value) || 1)}
                        className="text-sm text-center w-20 mx-auto"
                        min="1"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={material?.unitPrice}
                        onChange={(e) => handleMaterialChange(material?.id, 'unitPrice', parseFloat(e?.target?.value) || 0)}
                        className="text-sm text-right w-24 ml-auto"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-3 text-right font-medium">
                      ${material?.total?.toLocaleString('es-MX')}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Trash2"
                        onClick={() => handleRemoveMaterial(material?.id)}
                        className="text-red-600 hover:text-red-800"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="4" className="p-3 text-right font-medium">Total de Materiales:</td>
                  <td className="p-3 text-right font-bold text-lg">
                    ${getTotalValue()?.toLocaleString('es-MX')}
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Icon name="Package" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materiales identificados</h3>
            <p className="text-gray-600 mb-4">
              {quotation?.hasCatalog 
                ? "Agregue materiales desde el catálogo del cliente" :"Use la identificación automática o agregue materiales manualmente"
              }
            </p>
            {!quotation?.hasCatalog && (
              <Button
                onClick={handleAutoIdentify}
                disabled={isAnalyzing}
                iconName={isAnalyzing ? "Loader2" : "Search"}
                iconPosition="left"
              >
                {isAnalyzing ? 'Analizando planos...' : 'Iniciar Identificación Automática'}
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Integration with Inventory */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Link" size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Integración con Sistema de Inventario</p>
            <p>Los materiales identificados se pueden sincronizar automáticamente con el inventario para verificar disponibilidad y actualizar precios en tiempo real.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialIdentification;