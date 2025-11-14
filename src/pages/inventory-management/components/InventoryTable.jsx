import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const InventoryTable = ({ 
  items, 
  onViewDetails, 
  onUpdateStock, 
  onCreatePO,
  onAddItem,
  onGenerateReport
}) => {
  const [sortField, setSortField] = useState('itemCode');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedItems = [...items]?.sort((a, b) => {
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue?.localeCompare(bValue)
        : bValue?.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Paginación
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const handleChangePageSize = (e) => {
    const v = Number(e?.target?.value) || PAGE_SIZE_OPTIONS[0];
    setPageSize(v);
    setCurrentPage(1);
  };

  const goToPage = (n) => setCurrentPage(Math.min(Math.max(1, n), totalPages));
  const prevPage = () => goToPage(currentPage - 1);
  const nextPage = () => goToPage(currentPage + 1);

  const getStockStatus = (current, reorderPoint) => {
    if (current === 0) return { status: 'out-of-stock', label: 'Agotado', color: 'text-error' };
    if (current <= reorderPoint) return { status: 'low-stock', label: 'Stock Bajo', color: 'text-warning' };
    return { status: 'in-stock', label: 'En Stock', color: 'text-success' };
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />;
    return <Icon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={16} className="text-foreground" />;
  };

  return (
    <div className="space-y-4">
      {/* Quick Functions */}


      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-3 lg:p-4">
                <button
                  onClick={() => handleSort('itemCode')}
                  className="flex items-center space-x-2 font-medium text-sm text-foreground hover:text-primary transition-smooth"
                >
                  <span>Código</span>
                  <SortIcon field="itemCode" />
                </button>
              </th>
              <th className="text-left p-3 lg:p-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 font-medium text-sm text-foreground hover:text-primary transition-smooth"
                >
                  <span>Nombre</span>
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left p-3 lg:p-4">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center space-x-2 font-medium text-sm text-foreground hover:text-primary transition-smooth"
                >
                  <span>Descripción</span>
                  <SortIcon field="description" />
                </button>
              </th>
              <th className="text-left p-3 lg:p-4 hidden lg:table-cell">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-2 font-medium text-sm text-foreground hover:text-primary transition-smooth"
                >
                  <span>Categoría</span>
                  <SortIcon field="category" />
                </button>
              </th>
              <th className="text-left p-3 lg:p-4">
                <button
                  onClick={() => handleSort('currentStock')}
                  className="flex items-center space-x-2 font-medium text-sm text-foreground hover:text-primary transition-smooth"
                >
                  <span>Stock</span>
                  <SortIcon field="currentStock" />
                </button>
              </th>
              <th className="text-left p-3 lg:p-4 hidden xl:table-cell">
                <span className="font-medium text-sm text-foreground">Proveedor</span>
              </th>
              <th className="text-left p-3 lg:p-4">
                <span className="font-medium text-sm text-foreground">Estado</span>
              </th>
              <th className="text-right p-3 lg:p-4">
                <span className="font-medium text-sm text-foreground">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems?.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <Icon name="Package" size={48} className="text-muted-foreground/50" />
                    <p className="text-lg font-medium">No hay artículos disponibles</p>
                    <p className="text-sm">Los artículos que agregues aparecerán aquí</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems?.map((item) => {
              const stockStatus = getStockStatus(item?.currentStock, item?.reorderPoint);
              return (
                <tr key={item?.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                  <td className="p-3 lg:p-4">
                    <span className="font-mono text-sm text-foreground">{item?.itemCode}</span>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div className="font-medium text-sm text-foreground">{item?.name}</div>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div className="font-medium text-sm text-foreground">{item?.description}</div>
                  </td>
                  <td className="p-3 lg:p-4 hidden lg:table-cell">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                      {item?.category}
                    </span>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div>
                      <div className="font-medium text-sm text-foreground">{item?.currentStock} {item?.unit}</div>
                      <div className="text-xs text-muted-foreground lg:hidden">Punto: {item?.reorderPoint}</div>
                    </div>
                  </td>
                  <td className="p-3 lg:p-4 hidden xl:table-cell">
                    <div className="text-sm font-medium text-foreground truncate max-w-32">{item?.supplier?.name}</div>
                  </td>
                  <td className="p-3 lg:p-4">
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium ${stockStatus?.color}`}>
                      <div className={`w-2 h-2 rounded-full ${
                        stockStatus?.status === 'out-of-stock' ? 'bg-error' :
                        stockStatus?.status === 'low-stock' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <span className="hidden sm:inline">{stockStatus?.label}</span>
                    </span>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(item)}
                        iconName="Eye"
                        iconSize={14}
                        className="text-xs px-2 py-1"
                      >
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateStock(item)}
                        iconName="Edit"
                        iconSize={14}
                        className="text-xs px-2 py-1"
                      >
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      {stockStatus?.status !== 'in-stock' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCreatePO(item)}
                          iconName="ShoppingCart"
                          iconSize={14}
                          className="text-xs px-2 py-1 hidden lg:inline-flex"
                        >
                          <span className="hidden xl:inline">Ordenar</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>

        {/* Paginación Desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-border px-4 py-3 gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Mostrar</label>
            <select
              value={pageSize}
              onChange={handleChangePageSize}
              className="text-sm px-2 py-1 border border-border rounded bg-background text-foreground"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">por página</span>
            <span className="text-xs text-muted-foreground ml-3">
              Mostrando <span className="font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span>-<span className="font-medium">{endIndex}</span> de <span className="font-medium">{totalItems}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => goToPage(1)} disabled={currentPage === 1} iconName="ChevronsLeft" />
            <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1} iconName="ChevronLeft" />
            <span className="px-2 text-sm text-foreground">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages} iconName="ChevronRight" />
            <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} iconName="ChevronsRight" />
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3 p-3 sm:p-4 sm:space-y-4">
        {paginatedItems?.length === 0 ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Icon name="Package" size={48} className="text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-lg font-medium text-foreground mb-1">No hay artículos disponibles</p>
              <p className="text-sm text-muted-foreground">Los artículos que agregues aparecerán aquí</p>
            </div>
          </div>
        ) : (
          paginatedItems?.map((item) => {
          const stockStatus = getStockStatus(item?.currentStock, item?.reorderPoint);
          return (
            <div key={item?.id} className="bg-background border border-border rounded-lg p-3 sm:p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-mono text-sm text-muted-foreground mb-1">{item?.itemCode}</div>
                  <div className="font-medium text-foreground mb-1">{item?.description}</div>
                  <div className="text-xs text-muted-foreground">{item?.specifications}</div>
                </div>
                <span className={`inline-flex items-center space-x-1 text-xs font-medium ${stockStatus?.color}`}>
                  <div className={`w-2 h-2 rounded-full ${
                    stockStatus?.status === 'out-of-stock' ? 'bg-error' :
                    stockStatus?.status === 'low-stock' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <span>{stockStatus?.label}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Stock Actual</div>
                  <div className="font-medium text-sm text-foreground">{item?.currentStock} {item?.unit}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Punto Reorden</div>
                  <div className="text-sm text-foreground">{item?.reorderPoint} {item?.unit}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Categoría</div>
                  <div className="text-sm text-foreground">{item?.category}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Proveedor</div>
                  <div className="text-sm font-medium text-foreground truncate">{item?.supplier?.name}</div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(item)}
                  iconName="Eye"
                  iconSize={16}
                  className="flex-1 text-xs sm:text-sm"
                >
                  Ver
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateStock(item)}
                  iconName="Edit"
                  iconSize={16}
                  className="flex-1 text-xs sm:text-sm"
                >
                  Editar
                </Button>
                {stockStatus?.status !== 'in-stock' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCreatePO(item)}
                    iconName="ShoppingCart"
                    iconSize={16}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Ordenar
                  </Button>
                )}
              </div>
            </div>
          );
        })
        )}

        {/* Paginación Mobile */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Mostrar</label>
            <select
              value={pageSize}
              onChange={handleChangePageSize}
              className="text-sm px-2 py-1 border border-border rounded bg-background text-foreground"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">por página</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {totalItems === 0 ? '0 de 0' : `${startIndex + 1}-${endIndex} de ${totalItems}`}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => goToPage(1)} disabled={currentPage === 1} iconName="ChevronsLeft" />
              <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1} iconName="ChevronLeft" />
              <span className="px-2 text-sm text-foreground">{currentPage}/{totalPages}</span>
              <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages} iconName="ChevronRight" />
              <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} iconName="ChevronsRight" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default InventoryTable;