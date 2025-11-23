import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ScanBarcode, Loader2, CheckCircle2, XCircle, AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';
import { useSearchProductsPointSaleByCode } from '@/hooks/pointSale/ProductPointSale/useSearchProductsPointSaleByCode';

interface ProductSearchByCodeProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProducts?: Product[];
  placeholder?: string;
  className?: string;
  debounceDelay?: number;
}

type ScannerState = 
  | { type: 'idle' }
  | { type: 'scanning' }
  | { type: 'success'; productName: string }
  | { type: 'error'; reason: 'not_found' | 'no_stock' }
  | { type: 'duplicate'; productName: string };

export default function ProductSearchByCode({
  value,
  onChange,
  onProductSelect,
  selectedProducts = [],
  className = "",
  debounceDelay = 50
}: ProductSearchByCodeProps) {
  const [scannerState, setScannerState] = useState<ScannerState>({ type: 'idle' });
  const [debouncedCode, setDebouncedCode] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const stateResetTimer = useRef<NodeJS.Timeout | null>(null);
  const processedProductRef = useRef<string | number | null>(null);
  const isShowingFeedback = useRef(false);

  // Resetear al estado idle después de mostrar feedback
  const resetToIdle = useCallback(() => {
    if (stateResetTimer.current) {
      clearTimeout(stateResetTimer.current);
    }
    
    stateResetTimer.current = setTimeout(() => {
      setScannerState({ type: 'idle' });
      processedProductRef.current = null;
      isShowingFeedback.current = false;
    }, 2500);
  }, []);

  // Debounce del código escaneado
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setDebouncedCode('');
      if (!isShowingFeedback.current) {
        setScannerState({ type: 'idle' });
      }
      return;
    }

    if (!isShowingFeedback.current) {
      setScannerState({ type: 'scanning' });
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedCode(value.trim());
    }, debounceDelay);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, debounceDelay]);

  // Hook de búsqueda
  const { 
    productsData, 
    isLoading, 
    isError
  } = useSearchProductsPointSaleByCode(debouncedCode);

  const searchResults = useMemo(() => {
    return productsData.products || [];
  }, [productsData.products]);

  // Validar si ya está seleccionado
  const isProductAlreadySelected = useCallback((product: Product) => {
    return selectedProducts.some(selected => selected.id === product.id);
  }, [selectedProducts]);

  // Procesar resultado de búsqueda
  useEffect(() => {
    if (!debouncedCode || isLoading) return;

    // Error de red
    if (isError) {
      isShowingFeedback.current = true;
      setScannerState({ type: 'error', reason: 'not_found' });
      
      // Toast de error de red
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold">Producto no encontrado</p>
          <p className="text-sm">Intenta nuevamente o Verifique que hay stock en este punto de venta</p>
        </div>,
        {
          duration: 1000,
          className: "text-base p-4",
        }
      );
      
      onChange('');
      resetToIdle();
      return;
    }

    // No encontrado
    if (searchResults.length === 0) {
      isShowingFeedback.current = true;
      setScannerState({ type: 'error', reason: 'not_found' });
      
      // Toast de producto no encontrado
      toast.error(
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold">Producto no encontrado</p>
          <p className="text-sm">Verifica el código</p>
        </div>,
        {
          duration: 500,
          className: "text-base p-4",
        }
      );
      
      onChange('');
      resetToIdle();
      return;
    }

    // Producto encontrado
    const product = searchResults[0];

    // Si ya procesamos este producto en este ciclo, no hacer nada
    if (processedProductRef.current === product.id) {
      return;
    }

    // Sin stock
    if (product.stock <= 0) {
      isShowingFeedback.current = true;
      setScannerState({ type: 'error', reason: 'no_stock' });
      
      // Toast de error sin stock
      toast.error(
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold">Sin stock disponible</p>
          <p className="text-base">{product.name}</p>
        </div>,
        {
          duration: 500,
          className: "text-base p-4",
        }
      );
      
      onChange('');
      resetToIdle();
      return;
    }

    // Duplicado - verificar ANTES de agregar
    if (isProductAlreadySelected(product)) {
      isShowingFeedback.current = true;
      setScannerState({ type: 'duplicate', productName: product.name });
      
      // Toast de duplicado
      toast.warning(
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold">Ya está en la lista</p>
          <p className="text-base">{product.name}</p>
        </div>,
        {
          duration: 500,
          className: "text-base p-4",
        }
      );
      
      onChange('');
      resetToIdle();
      return;
    }

    // Marcar como procesado ANTES de agregar
    processedProductRef.current = product.id;

    // Éxito - Mostrar toast con Sonner
    isShowingFeedback.current = true;
    setScannerState({ type: 'success', productName: product.name });
    
    // Toast grande con Sonner
    toast.success(
      <div className="flex flex-col gap-2">
        <p className="text-xl font-bold">{product.name}</p>
        <p className="text-3xl font-bold text-emerald-600">
          ${product.price.toFixed(2)}
        </p>
        {product.stock && (
          <p className="text-sm text-muted-foreground">
            Stock: {product.stock} unidades
          </p>
        )}
      </div>,
      {
        duration: 2000,
        className: "text-lg p-6",
      }
    );

    onProductSelect(product);
    onChange('');
    resetToIdle();

  }, [debouncedCode, searchResults, isLoading, isError, onProductSelect, isProductAlreadySelected, resetToIdle, onChange]);

  // Capturar input del escáner
  const handleScannerInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Manejar Enter del escáner
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  // Auto-focus inteligente
  useEffect(() => {
    const hasOpenModal = () => {
      return document.querySelector('[role="dialog"]') !== null ||
             document.querySelector('.modal') !== null ||
             document.querySelector('[data-state="open"]') !== null;
    };

    const focusInput = () => {
      if (inputRef.current && !hasOpenModal()) {
        const activeElement = document.activeElement;
        if (!activeElement || activeElement === document.body) {
          inputRef.current.focus();
        }
      }
    };

    focusInput();

    const focusInterval = setInterval(focusInput, 500);

    return () => clearInterval(focusInterval);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (stateResetTimer.current) clearTimeout(stateResetTimer.current);
    };
  }, []);

  // Renderizar indicador según estado
  const renderIndicator = () => {
    switch (scannerState.type) {
      case 'idle':
        return (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-indigo-600 rounded-xl p-3">
                <ScanBarcode className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-xl animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Listo para escanear</h3>
              <p className="text-slate-300 text-sm">Apunta el escáner al código de barras</p>
            </div>
          </div>
        );

      case 'scanning':
        return (
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-xl p-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Buscando producto...</h3>
              <p className="text-slate-300 text-sm">Verificando en el inventario</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-emerald-500 rounded-xl p-3">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-emerald-500/30 blur-lg rounded-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-emerald-400">✓ Producto agregado</h3>
              <p className="text-emerald-300 text-sm font-medium">{scannerState.productName}</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-red-600 rounded-xl p-3">
                {scannerState.reason === 'no_stock' ? (
                  <Package className="w-8 h-8 text-white" />
                ) : (
                  <XCircle className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="absolute inset-0 bg-red-500/30 blur-lg rounded-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-400">
                {scannerState.reason === 'not_found' 
                  ? '✗ Producto no encontrado' 
                  : '✗ Sin stock disponible'}
              </h3>
              <p className="text-red-300 text-sm">
                {scannerState.reason === 'not_found'
                  ? 'Verifica el código e intenta nuevamente'
                  : 'El producto no tiene unidades disponibles'}
              </p>
            </div>
          </div>
        );

      case 'duplicate':
        return (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-orange-500 rounded-xl p-3">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-orange-500/30 blur-lg rounded-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-400">⚠ Ya está en la lista</h3>
              <p className="text-orange-300 text-sm font-medium">{scannerState.productName}</p>
            </div>
          </div>
        );
    }
  };

  const getContainerStyles = () => {
    switch (scannerState.type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/50 shadow-red-500/20';
      case 'duplicate':
        return 'bg-orange-500/10 border-orange-500/50 shadow-orange-500/20';
      case 'scanning':
        return 'bg-blue-500/10 border-blue-500/50 shadow-blue-500/20';
      default:
        return 'bg-slate-800/50 border-slate-700 shadow-xl';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Input oculto para capturar escáner */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleScannerInput}
        onKeyDown={handleKeyDown}
        className="sr-only"
        aria-hidden="true"
        autoComplete="off"
        autoFocus
      />

      {/* Indicador visual */}
      <div className={`p-6 rounded-xl border-2 transition-all duration-300 shadow-2xl ${getContainerStyles()}`}>
        {renderIndicator()}
      </div>
    </div>
  );
}