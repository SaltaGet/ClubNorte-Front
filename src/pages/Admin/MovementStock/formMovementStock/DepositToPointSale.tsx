import React, { useState } from "react";
import { Package, Warehouse, ArrowRight, ChevronLeft, Zap, BarChart3 } from "lucide-react";
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

interface DepositToPointSaleProps {
  product: Product;
  pointSales: PointSale[];
  isCreating: boolean;
  createMovementStock: (data: MovementStockCreateData, options?: MovementStockOptions) => void;
  createMovementStockBulk: (data: MovementStockBulkData[]) => void;
  isCreatingBulk: boolean;
  onBack: () => void;
  onSuccess: () => void;
}

const DepositToPointSale: React.FC<DepositToPointSaleProps> = ({
  product,
  pointSales,
  isCreating,
  createMovementStockBulk,
  isCreatingBulk,
  onBack,
}) => {
  const [selectedPoints, setSelectedPoints] = useState<{ id: number; amount: number }[]>([]);
  const [ignoreStockDeposit, setIgnoreStockDeposit] = useState(false);

  const depositStock = product?.stock_deposit?.stock ?? 0;

  const handleCheckboxChange = (pointId: number) => {
    setSelectedPoints((prev) => {
      const exists = prev.find((p) => p.id === pointId);
      if (exists) return prev.filter((p) => p.id !== pointId);
      return [...prev, { id: pointId, amount: 0 }];
    });
  };

  const handleAmountChange = (pointId: number, amount: number) => {
    setSelectedPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, amount: amount >= 0 ? amount : 0 } : p))
    );
  };

  // Asignar todo el stock a un solo punto de venta
  const assignAllToOne = (pointId: number) => {
    setSelectedPoints([{ id: pointId, amount: depositStock }]);
  };

  // Distribuir equitativamente entre puntos seleccionados
  const distributeEqually = () => {
    if (selectedPoints.length === 0) return;
    
    const amountPerPoint = Math.floor(depositStock / selectedPoints.length);
    const remainder = depositStock % selectedPoints.length;
    
    setSelectedPoints((prev) =>
      prev.map((p, index) => ({
        ...p,
        amount: amountPerPoint + (index < remainder ? 1 : 0)
      }))
    );
  };

  const handleMoveFromDeposit = async () => {
    const total = selectedPoints.reduce((sum, p) => sum + p.amount, 0);

    if (total === 0) {
      alert("Debes asignar al menos una cantidad mayor a 0.");
      return;
    }

    if (!ignoreStockDeposit && total > depositStock) {
      alert("No puedes mover más stock del disponible en depósito.");
      return;
    }

    // Filtrar solo los puntos con cantidad > 0
    const validMovements = selectedPoints.filter(point => point.amount > 0);

    if (validMovements.length === 0) return;

    // Preparar la estructura que espera el endpoint bulk
    const bulkData: MovementStockBulkData[] = [{
      product_id: product.id,
      movement_stock_item: validMovements.map(point => ({
        amount: point.amount,
        from_id: 1,
        from_type: "deposit" as const,
        ignore_stock: ignoreStockDeposit,
        to_id: point.id,
        to_type: "point_sale" as const,
      }))
    }];

    // Enviar todos los movimientos de una sola vez
    createMovementStockBulk(bulkData);
  };

  const getStockForPointSale = (pointSaleId: number): number => {
    return product?.stock_point_sales?.find((ps) => ps.id === pointSaleId)?.stock ?? 0;
  };

  const totalAssigned = selectedPoints.reduce((sum, p) => sum + p.amount, 0);
  const hasSelections = selectedPoints.length > 0;
  const isProcessing = isCreating || isCreatingBulk;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 rounded-lg p-2 sm:p-3">
            <Warehouse className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Depósito → Puntos de Venta</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Distribuir stock desde el depósito</p>
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

      {/* Stock disponible */}
      <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-slate-300 flex items-center gap-2 text-sm sm:text-base">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            Stock disponible:
            <span className="font-bold text-emerald-400 text-lg sm:text-xl">
              {depositStock}
            </span>
          </p>
          {totalAssigned > 0 && (
            <p className="text-slate-400 text-sm">
              Asignado: <span className={`font-bold ${totalAssigned > depositStock && !ignoreStockDeposit ? 'text-red-400' : 'text-indigo-400'}`}>{totalAssigned}</span>
            </p>
          )}
        </div>
      </div>

      {/* Botones de distribución rápida */}
      {hasSelections && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-lg p-3 sm:p-4 space-y-3">
          <p className="text-indigo-300 text-xs sm:text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Distribución rápida:
          </p>
          <button
            onClick={distributeEqually}
            disabled={isProcessing}
            className="w-full py-2 sm:py-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <BarChart3 className="w-4 h-4" />
            Distribuir equitativamente entre seleccionados
          </button>
        </div>
      )}

      {/* Lista de puntos de venta */}
      <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
        {pointSales.map((point) => {
          const isSelected = !!selectedPoints.find((p) => p.id === point.id);
          const currentAmount = selectedPoints.find((p) => p.id === point.id)?.amount || 0;
          
          return (
            <div
              key={point.id}
              className={`border rounded-lg p-3 sm:p-4 transition ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-600/10' 
                  : 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
              }`}
            >
              {/* Mobile/Tablet Layout */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(point.id)}
                    disabled={isProcessing}
                    className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-200 font-medium text-sm sm:text-base block truncate">
                      {point.name}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Package className="w-3 h-3" />
                      Stock actual: {getStockForPointSale(point.id)}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 disabled:opacity-50 font-medium text-sm sm:text-base"
                        disabled={isProcessing}
                        value={currentAmount || ""}
                        onChange={(e) => handleAmountChange(point.id, Number(e.target.value))}
                        placeholder="Cantidad"
                      />
                      <button
                        onClick={() => assignAllToOne(point.id)}
                        disabled={isProcessing}
                        className="px-3 sm:px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg font-medium text-xs sm:text-sm disabled:opacity-50 transition active:scale-95 whitespace-nowrap"
                      >
                        Todo aquí
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkbox ignorar stock */}
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 sm:p-4">
        <input
          type="checkbox"
          checked={ignoreStockDeposit}
          onChange={(e) => setIgnoreStockDeposit(e.target.checked)}
          disabled={isProcessing}
          className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
        />
        <label className="text-amber-300 text-xs sm:text-sm">
          Ignorar validación de stock (permitir stock negativo en depósito)
        </label>
      </div>

      {/* Botón de mover */}
      <button
        onClick={handleMoveFromDeposit}
        disabled={isProcessing || !hasSelections}
        className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm sm:text-lg disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
      >
        <Warehouse className="w-5 h-5 sm:w-6 sm:h-6" />
        {isProcessing ? "Procesando..." : "Mover desde Depósito"}
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default DepositToPointSale;