import { useState, useCallback, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import { useSearchProductsPointSaleByName } from '@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByName';

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface ProductSearchByNameProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts?: Product[];
  placeholder?: string;
  className?: string;
}

export default function ProductSearchByName({
  value,
  onChange,
  onProductSelect,
  selectedProducts = [],
  placeholder = "Buscar por nombre...",
  className = ""
}: ProductSearchByNameProps) {
  const [showResults, setShowResults] = useState(false);

  // Debounce para la búsqueda
  const debouncedSearchTerm = useDebounce(value, 300);

  // Hook de búsqueda por nombre
  const { 
    productsData: nameProductsData, 
    isLoading: isSearchingByName, 
    isError: hasNameSearchError,
    error: nameSearchError 
  } = useSearchProductsPointSaleByName(debouncedSearchTerm);

  const searchResults = nameProductsData.products || [];
  const isSearching = isSearchingByName;
  const hasSearchError = hasNameSearchError;
  const searchError = nameSearchError;

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = useCallback((inputValue: string) => {
    onChange(inputValue);
    setShowResults(inputValue.length > 0);
  }, [onChange]);

  // Validar si el producto ya está seleccionado
  const isProductAlreadySelected = useCallback((product: Product) => {
    return selectedProducts.some(selected => selected.id === product.id);
  }, [selectedProducts]);

  // Seleccionar producto
  const handleProductSelect = useCallback((product: Product) => {
    // Validación de duplicados
    if (isProductAlreadySelected(product)) {
      return;
    }

    // Validación de stock
    if (product.stock <= 0) {
      return;
    }

    onProductSelect(product);
    onChange(''); // Limpiar el input
    setShowResults(false);
  }, [onProductSelect, onChange, isProductAlreadySelected]);

  const shouldShowResults = showResults && value.length > 0 && !isSearching;

  return (
    <div className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 animate-spin" />
        ) : (
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
          placeholder={placeholder}
        />
      </div>

      {/* Dropdown de resultados */}
      {shouldShowResults && (
        <div className="absolute z-20 w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl max-h-48 sm:max-h-56 overflow-y-auto">
          {hasSearchError ? (
            <div className="p-3 sm:p-4 text-red-400 text-center text-sm">
              Error: {searchError?.message || 'Error al buscar productos'}
            </div>
          ) : searchResults.length === 0 && debouncedSearchTerm ? (
            <div className="p-3 sm:p-4 text-slate-400 text-center text-sm">
              No se encontraron productos para "{debouncedSearchTerm}"
            </div>
          ) : (
            searchResults.map((product) => {
              const isAlreadySelected = isProductAlreadySelected(product);
              const hasNoStock = product.stock <= 0;
              const isDisabled = isAlreadySelected || hasNoStock;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductSelect(product)}
                  disabled={isDisabled}
                  className={`w-full text-left px-3 sm:px-4 py-3 sm:py-2 border-b border-slate-700/50 last:border-b-0 transition-colors touch-manipulation ${
                    isDisabled
                      ? 'bg-slate-800/50 cursor-not-allowed opacity-50' 
                      : 'hover:bg-indigo-900/30 active:bg-indigo-800/40 text-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm sm:text-base truncate text-white">{product.name}</div>
                        {isAlreadySelected && (
                          <span className="px-2 py-1 text-xs bg-amber-900/50 text-amber-300 rounded-full flex-shrink-0 border border-amber-700/30">
                            Ya agregado
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs text-slate-400 mt-1 sm:mt-0">
                        <span>Código: {product.code}</span>
                        <span>Categoría: {product.category.name}</span>
                        <span className={`${hasNoStock ? 'text-red-400 font-medium' : 'text-emerald-400'}`}>
                          Stock: {product.stock} {hasNoStock ? '(Sin stock)' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-start sm:self-center">
                      <span className="text-emerald-400 font-semibold text-base sm:text-sm">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}