import { useRef, useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Product } from '@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale';

interface SelectedItem {
  index: number;
  product: Product;
  currentQuantity: number;
}

interface QuantityEditModalProps {
  selectedItem: SelectedItem | null;
  onClose: () => void;
  onConfirm: (index: number, delta: number) => void;
}

export default function QuantityEditModal({
  selectedItem,
  onClose,
  onConfirm
}: QuantityEditModalProps) {
  const [tempQuantity, setTempQuantity] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset temp quantity when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      setTempQuantity(selectedItem.currentQuantity.toString());
    } else {
      setTempQuantity('');
    }
  }, [selectedItem]);

  const handleQuantityChange = () => {
    if (!selectedItem) return;
    
    const newQuantity = parseInt(tempQuantity) || 1;
    const maxStock = selectedItem.product.stock || 999;
    
    // Validar stock antes de continuar
    if (newQuantity > maxStock) {
      return;
    }
    
    const finalQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    const delta = finalQuantity - selectedItem.currentQuantity;
    onConfirm(selectedItem.index, delta);
    
    onClose();
  };

  // Sumar cantidad rápida
  const addQuickAmount = (amount: number) => {
    if (!selectedItem) return;
    
    const current = parseInt(tempQuantity) || 0;
    const newValue = current + amount;
    const maxStock = selectedItem.product.stock || 999;
    const finalValue = Math.min(newValue, maxStock);
    
    setTempQuantity(finalValue.toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentValue = parseInt(tempQuantity) || 0;
      const maxStock = selectedItem?.product.stock || 999;
      const hasError = currentValue > maxStock || currentValue < 1;
      
      if (!hasError) {
        handleQuantityChange();
      }
    }
  };

  if (!selectedItem) return null;

  const currentValue = parseInt(tempQuantity) || 0;
  const maxStock = selectedItem.product.stock || 999;
  const isOverStock = currentValue > maxStock;
  const isUnderMin = currentValue < 1;
  const hasError = isOverStock || isUnderMin;

  // Botones rápidos - solo mostrar los que no excedan el stock
  const quickButtons = [1, 3, 5, 10].filter(amount => currentValue + amount <= maxStock);

  return (
    <Dialog open={!!selectedItem} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-white">
            Cambiar cantidad
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Info del producto */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm truncate">
              {selectedItem.product.name}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Stock disponible: {selectedItem.product.stock || 0}
            </p>
            <p className="text-xs text-slate-400">
              Precio: ${selectedItem.product.price?.toFixed(2) || '0.00'}
            </p>
          </div>

          {/* Input cantidad con react-number-format */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 block">
              Cantidad actual:
            </label>
            <NumericFormat
              getInputRef={inputRef}
              value={tempQuantity}
              onValueChange={(values) => {
                setTempQuantity(values.value);
              }}
              onKeyPress={handleKeyPress}
              allowNegative={false}
              decimalScale={0}
              thousandSeparator={false}
              isAllowed={(values) => {
                const { floatValue } = values;
                return floatValue === undefined || (floatValue >= 0 && floatValue <= 99999);
              }}
              className={`w-full px-3 py-2 text-white border rounded-lg focus:ring-2 text-center text-lg font-medium transition-colors ${
                hasError 
                  ? 'bg-red-900/30 border-red-500 focus:ring-red-500' 
                  : 'bg-slate-700 border-slate-600 focus:ring-indigo-500'
              }`}
              placeholder="Cantidad"
            />
            
            {/* Mensajes de error/advertencia */}
            {isOverStock && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Stock insuficiente. Máximo: {maxStock}</span>
              </div>
            )}
            
            {isUnderMin && (
              <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-lg p-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>La cantidad mínima es 1</span>
              </div>
            )}
          </div>

          {/* Botones rápidos para sumar */}
          {quickButtons.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-slate-300 block">
                Sumar rápido:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {quickButtons.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => addQuickAmount(amount)}
                    className="flex items-center justify-center gap-1 px-3 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition-colors active:scale-95 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {amount}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controles */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleQuantityChange}
              disabled={hasError}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                hasError
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Confirmar
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            {hasError ? 'Corrige el error para continuar' : 'Usa los botones o escribe la cantidad'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}