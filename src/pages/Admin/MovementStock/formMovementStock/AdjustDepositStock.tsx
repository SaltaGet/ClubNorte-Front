/**
 * Componente para ajustar el stock de un producto en el depósito
 * Trae automáticamente los datos del producto usando useGetProductById
 */
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { Plus, Minus, Target, ChevronLeft, Package } from 'lucide-react';
import type { UpdateStockDepositData } from '@/hooks/admin/MovementStock/movementStockType';
import { useMovementStockMutations } from '@/hooks/admin/MovementStock/useMovementStockMutations';
import { useGetProductById } from '@/hooks/admin/Product/useGetProductById';
import SuccessMessage from '@/components/generic/SuccessMessage';

interface AdjustDepositStockProps {
  productId: number;
  onBack: () => void;
  onSuccess?: () => void;
}

const AdjustDepositStock: React.FC<AdjustDepositStockProps> = ({
  productId,
  onBack,
  onSuccess
}) => {
  const { product, isLoading: isLoadingProduct, isError: isErrorProduct } = useGetProductById(productId);
  const productName = product?.name || 'Producto';
  const currentStock = product?.stock_deposit?.stock || 0;
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<UpdateStockDepositData>({
    defaultValues: {
      method: 'add',
      product_id: productId,
      stock: undefined
    }
  });

  const { updateStockDeposit, isUpdatingStock, updateStockError, isStockUpdated, resetUpdateStockState } = useMovementStockMutations();
  const [showSuccess, setShowSuccess] = useState(false);

  const method = watch('method');
  const stockValue = watch('stock');

  const onSubmit = (data: UpdateStockDepositData) => {
    const stock = parseInt(String(data.stock || '0').replace(/,/g, '')) || 0;
    
    if (stock === 0) {
      return;
    }
    
    updateStockDeposit({
      ...data,
      stock
    } as UpdateStockDepositData);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetUpdateStockState();
    reset();
    onSuccess?.();
  };

  React.useEffect(() => {
    if (isStockUpdated) {
      setShowSuccess(true);
    }
  }, [isStockUpdated]);

  if (isLoadingProduct) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 rounded-lg p-2 md:p-3">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">Ajustar Stock Depósito</h3>
              <p className="text-slate-400 text-xs md:text-sm">Actualizar inventario del depósito</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isErrorProduct) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 rounded-lg p-2 md:p-3">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">Ajustar Stock Depósito</h3>
              <p className="text-slate-400 text-xs md:text-sm">Actualizar inventario del depósito</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>
        <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs md:text-sm">Error al cargar el producto</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="p-4">
        <SuccessMessage
          title="Stock Actualizado"
          description={`El stock del producto ${productName} se ha actualizado correctamente.`}
          primaryButton={{
            text: 'Aceptar',
            onClick: handleSuccessClose,
            variant: 'indigo'
          }}
        />
      </div>
    );
  }

  const getMethodIcon = (m: string) => {
    switch (m) {
      case 'add':
        return <Plus className="w-4 h-4 md:w-5 md:h-5" />;
      case 'subtract':
        return <Minus className="w-4 h-4 md:w-5 md:h-5" />;
      case 'set':
        return <Target className="w-4 h-4 md:w-5 md:h-5" />;
      default:
        return null;
    }
  };

  const calculateNewStock = () => {
    const value = typeof stockValue === 'string' 
      ? parseInt(stockValue.replace(/,/g, '')) || 0 
      : stockValue || 0;
    
    switch (method) {
      case 'add':
        return currentStock + value;
      case 'subtract':
        return Math.max(0, currentStock - value);
      case 'set':
        return value;
      default:
        return currentStock;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 rounded-lg p-2 md:p-3">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white">Ajustar Stock Depósito</h3>
            <p className="text-slate-400 text-xs md:text-sm">Actualizar inventario del depósito</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
        {/* Botón Submit - ARRIBA para no perderse con teclado virtual */}
        <button
          type="submit"
          disabled={isUpdatingStock || !stockValue || stockValue === 0}
          className="w-full py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
        >
          {isUpdatingStock ? (
            <>
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Actualizando...</span>
            </>
          ) : (
            <>
              <Target className="w-4 h-4 md:w-5 md:h-5" />
              <span>Actualizar Stock del Depósito</span>
            </>
          )}
        </button>

        {/* Campo de Cantidad - PRIMERO */}
        <div>
          <label className="text-slate-200 text-sm md:text-base font-semibold mb-2 block">
            Cantidad a modificar
          </label>
          <Controller
            control={control}
            name="stock"
            rules={{
              required: 'La cantidad es requerida',
              validate: (value) => {
                const numValue = parseInt(String(value || '0').replace(/,/g, '')) || 0;
                if (numValue === 0) return 'La cantidad debe ser mayor a 0';
                return true;
              }
            }}
            render={({ field: { onChange, value, ...field } }) => (
              <NumericFormat
                {...field}
                value={value === undefined || value === null ? '' : value}
                onValueChange={(values) => {
                  onChange(values.value ? parseInt(values.value) : undefined);
                }}
                placeholder="0"
                allowNegative={false}
                thousandSeparator=","
                decimalSeparator="."
                isAllowed={(values) => {
                  const { floatValue } = values;
                  return floatValue === undefined || floatValue >= 0;
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
                className="w-full bg-slate-700 text-white text-xl md:text-3xl font-bold placeholder-slate-500 border-2 border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg px-4 py-4 md:py-5 transition-all text-center"
              />
            )}
          />
          {errors.stock && (
            <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1 font-medium">
              <span>⚠</span>
              {errors.stock.message}
            </p>
          )}
        </div>

        {/* Selector de Método - SEGUNDO */}
        <div>
          <label className="text-slate-200 text-sm md:text-base font-semibold mb-2 block">
            Tipo de operación
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['add', 'subtract', 'set'].map((m) => (
              <label
                key={m}
                className="relative cursor-pointer"
              >
                <input
                  type="radio"
                  value={m}
                  {...register('method')}
                  className="hidden"
                />
                <div
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                    method === m
                      ? 'border-indigo-500 bg-indigo-600/30 shadow-lg shadow-indigo-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700'
                  }`}
                >
                  <div className={method === m ? 'text-indigo-400' : 'text-slate-400'}>
                    {getMethodIcon(m)}
                  </div>
                  <span className={`text-xs md:text-sm font-bold ${method === m ? 'text-white' : 'text-slate-300'}`}>
                    {m === 'add' ? 'Agregar' : m === 'subtract' ? 'Restar' : 'Establecer'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cálculo del nuevo stock */}
        {stockValue !== undefined && stockValue !== null && stockValue !== 0 && (
          <div className="p-3 md:p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-slate-400 text-xs md:text-sm mb-1 font-medium">Resultado de la operación:</p>
            <div className="flex items-baseline gap-2 flex-wrap justify-center">
              <span className="text-slate-300 text-lg md:text-xl font-medium">{currentStock.toLocaleString('es-ES')}</span>
              <span className="text-indigo-400 text-base md:text-lg font-bold">
                {method === 'add' ? '+' : method === 'subtract' ? '−' : '→'}
              </span>
              {method !== 'set' && (
                <>
                  <span className="text-white text-lg md:text-xl font-medium">{(stockValue || 0).toLocaleString('es-ES')}</span>
                  <span className="text-indigo-400 text-base md:text-lg font-bold">=</span>
                </>
              )}
              <span className="text-emerald-400 text-2xl md:text-3xl font-bold">{calculateNewStock().toLocaleString('es-ES')}</span>
              <span className="text-slate-400 text-sm md:text-base">unidades</span>
            </div>
          </div>
        )}

        {/* Info del Stock Depósito - Destacada */}
        <div className="p-3 md:p-4 bg-emerald-600/20 border-2 border-emerald-500/50 rounded-lg">
          <p className="text-emerald-400 text-xs font-medium mb-1">Stock actual en Depósito</p>
          <p className="text-white text-base md:text-lg font-bold truncate">{productName}</p>
          <p className="text-emerald-300 text-xl md:text-2xl font-bold mt-2">{currentStock.toLocaleString('es-ES')} unidades</p>
        </div>

        {/* Info de Puntos de Venta - Compacta */}
        {product?.stock_point_sales && product.stock_point_sales.length > 0 && (
          <details className="p-2 md:p-3 bg-slate-700/30 rounded-lg border border-slate-600 text-xs cursor-pointer">
            <summary className="text-slate-400 font-medium cursor-pointer select-none hover:text-slate-300 transition-colors">
              Ver stock en otros puntos ({product.stock_point_sales.length})
            </summary>
            <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-slate-600">
              {product.stock_point_sales.map((point) => (
                <span key={point.id} className="text-blue-300 bg-slate-800/50 px-2 py-1 rounded font-medium">
                  {point.name}: {point.stock}
                </span>
              ))}
            </div>
          </details>
        )}

        {/* Error */}
        {updateStockError && (
          <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-xs md:text-sm font-medium">
              {updateStockError instanceof Error ? updateStockError.message : 'Error al actualizar el stock'}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdjustDepositStock;