import React, { useState } from "react";
import { Package, Store, ArrowRight, ArrowLeftRight, ChevronLeft, Zap } from "lucide-react";
import type { MovementStockCreateData } from "@/hooks/admin/MovementStock/movementStockType";
import type { MovementStockBulkData } from "@/hooks/admin/MovementStock/useMovementStockMutations";

// Tipos locales para este componente
interface StockPointSale {
  id: number;
  name: string;
  stock: number;
}

interface StockDeposit {
  stock: number;
}

interface Product {
  id: number;
  stock_deposit?: StockDeposit | null;
  stock_point_sales?: StockPointSale[] | null;
}

interface PointSale {
  id: number;
  name: string;
}

interface MovementStockOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface PointSaleToPointSaleProps {
  product: Product;
  pointSales: PointSale[];
  isCreating: boolean;
  createMovementStock: (data: MovementStockCreateData, options?: MovementStockOptions) => void;
  createMovementStockBulk: (data: MovementStockBulkData[]) => void;
  isCreatingBulk: boolean;
  onBack: () => void;
  onSuccess: () => void;
}

const PointSaleToPointSale: React.FC<PointSaleToPointSaleProps> = ({
  product,
  pointSales,
  isCreating,
  createMovementStockBulk,
  isCreatingBulk,
  onBack,
}) => {
  const [fromPointId, setFromPointId] = useState<number | "">("");
  const [toPointId, setToPointId] = useState<number | "">("");
  const [moveAmount, setMoveAmount] = useState<number>(0);
  const [ignoreStockPoints, setIgnoreStockPoints] = useState(false);

  const handleMoveBetweenPoints = () => {
    if (!fromPointId || toPointId === "") {
      alert("Debes seleccionar un punto de venta de origen y destino.");
      return;
    }

    if (fromPointId === toPointId) {
      alert("El origen y destino no pueden ser el mismo.");
      return;
    }

    const fromStock =
      product?.stock_point_sales?.find((p) => p.id === fromPointId)?.stock ?? 0;

    if (moveAmount <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    if (moveAmount > fromStock && !ignoreStockPoints) {
      alert("No puedes mover más stock del disponible en el punto de venta de origen.");
      return;
    }

    // Preparar la estructura que espera el endpoint bulk
    const bulkData: MovementStockBulkData[] = [{
      product_id: product.id,
      movement_stock_item: [{
        amount: moveAmount,
        from_id: fromPointId,
        from_type: "point_sale" as const,
        ignore_stock: ignoreStockPoints,
        to_id: toPointId === 0 ? 1 : toPointId,
        to_type: toPointId === 0 ? "deposit" : "point_sale" as const,
      }]
    }];

    // Enviar como array (bulk) aunque sea un solo elemento
    createMovementStockBulk(bulkData);
  };

  const getStockForPointSale = (pointSaleId: number): number => {
    return product?.stock_point_sales?.find((ps) => ps.id === pointSaleId)?.stock ?? 0;
  };

  // Transferir todo el stock disponible
  const transferAll = () => {
    if (fromPointId) {
      const fromStock = product?.stock_point_sales?.find((p) => p.id === fromPointId)?.stock ?? 0;
      setMoveAmount(fromStock);
    }
  };

  // Stock del punto de origen seleccionado
  const originStock = fromPointId 
    ? product?.stock_point_sales?.find((p) => p.id === fromPointId)?.stock ?? 0 
    : 0;

  const hasError = moveAmount > originStock && !ignoreStockPoints;
  const isFormValid = fromPointId && toPointId !== "" && moveAmount > 0 && fromPointId !== toPointId;
  const isProcessing = isCreating || isCreatingBulk;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 rounded-lg p-2 sm:p-3">
            <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Entre Puntos de Venta</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Transferir stock entre ubicaciones</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      <div className="space-y-4">
        {/* Origen */}
        <div>
          <label className="block text-slate-300 font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
            <Store className="w-4 h-4 text-emerald-400" />
            Punto de Origen
          </label>
          <select
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700 text-white border border-slate-600 disabled:opacity-50 font-medium text-sm sm:text-base"
            value={fromPointId}
            onChange={(e) => {
              setFromPointId(Number(e.target.value));
              setMoveAmount(0); // Reset amount when changing origin
            }}
            disabled={isProcessing}
          >
            <option value="">Seleccione punto de origen</option>
            {product?.stock_point_sales?.map((ps) => (
              <option key={ps.id} value={ps.id}>
                {ps.name} (Stock: {ps.stock})
              </option>
            ))}
          </select>
        </div>

        {/* Stock disponible en origen */}
        {fromPointId && (
          <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-lg p-3">
            <p className="text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Stock disponible en origen:
              <span className="font-bold text-base sm:text-lg">{originStock}</span>
            </p>
          </div>
        )}

        {/* Destino */}
        <div>
          <label className="block text-slate-300 font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
            <Store className="w-4 h-4 text-indigo-400" />
            Punto de Destino
          </label>
          <select
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700 text-white border border-slate-600 disabled:opacity-50 font-medium text-sm sm:text-base"
            value={toPointId}
            onChange={(e) => setToPointId(Number(e.target.value))}
            disabled={isProcessing}
          >
            <option value="">Seleccione punto de destino</option>
            <option value={0}>
              🏢 Depósito (Stock: {product?.stock_deposit?.stock ?? 0})
            </option>
            {pointSales.map((ps) => (
              <option
                key={ps.id}
                value={ps.id}
                disabled={ps.id === fromPointId}
              >
                {ps.name} (Stock: {getStockForPointSale(ps.id)})
              </option>
            ))}
          </select>
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-slate-300 font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
            <Package className="w-4 h-4 text-slate-400" />
            Cantidad a Transferir
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={moveAmount || ""}
              onChange={(e) => setMoveAmount(Number(e.target.value))}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700 text-white border disabled:opacity-50 font-medium text-base sm:text-lg transition-colors ${
                hasError 
                  ? 'border-red-500 bg-red-900/20' 
                  : 'border-slate-600'
              }`}
              disabled={isProcessing || !fromPointId}
              placeholder="0"
            />
            {fromPointId && originStock > 0 && (
              <button
                type="button"
                onClick={transferAll}
                disabled={isProcessing}
                className="px-3 sm:px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg font-medium text-xs sm:text-sm disabled:opacity-50 transition active:scale-95 whitespace-nowrap flex items-center gap-1"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Transferir</span> Todo
              </button>
            )}
          </div>
          
          {/* Mensaje de error */}
          {hasError && (
            <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm bg-red-500/10 rounded-lg p-2 mt-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Stock insuficiente. Disponible: {originStock}</span>
            </div>
          )}
        </div>

        {/* Checkbox ignorar stock */}
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 sm:p-4">
          <input
            type="checkbox"
            checked={ignoreStockPoints}
            onChange={(e) => setIgnoreStockPoints(e.target.checked)}
            disabled={isProcessing}
            className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
          />
          <label className="text-amber-300 text-xs sm:text-sm">
            Ignorar validación de stock (permitir stock negativo en origen)
          </label>
        </div>
      </div>

      {/* Resumen de la transferencia */}
      {isFormValid && (
        <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 space-y-2">
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Resumen:</p>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-300">
              {product?.stock_point_sales?.find((p) => p.id === fromPointId)?.name || 'Origen'}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300">
              {toPointId === 0 
                ? 'Depósito' 
                : pointSales.find((p) => p.id === toPointId)?.name || 'Destino'}
            </span>
          </div>
          <p className="text-center text-indigo-400 font-bold text-base sm:text-lg">
            {moveAmount} unidades
          </p>
        </div>
      )}

      {/* Botón de transferir */}
      <button
        onClick={handleMoveBetweenPoints}
        disabled={isProcessing || !isFormValid}
        className="w-full py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm sm:text-lg disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
      >
        <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6" />
        {isProcessing ? "Procesando..." : "Realizar Transferencia"}
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default PointSaleToPointSale;