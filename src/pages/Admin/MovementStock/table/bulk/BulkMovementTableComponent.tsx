import {
  Package,
  Store,
  Zap,
  Divide,
  Edit,
} from "lucide-react";
import type { Product } from "@/hooks/admin/Product/productType";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumericFormat, type NumberFormatValues } from "react-number-format";

interface ProductMovements {
  [productId: number]: {
    [pointSaleId: number]: number;
  };
}

interface PointSale {
  id: number;
  name: string;
}

interface BulkMovementTableProps {
  products: Product[];
  pointSalesList: PointSale[];
  productMovements: ProductMovements;
  ignoreStock: boolean;
  isCreatingBulk: boolean;
  updateAmount: (productId: number, pointSaleId: number, amount: number) => void;
  distributeEqually: (productId: number) => void;
  assignAllToPoint: (productId: number, pointSaleId: number) => void;
  getTotalMovements: (productId: number) => number;
  getDepositStock: (product: Product) => number;
  getPointSaleStock: (product: Product, pointSaleId: number) => number;
  handleOpenModal: (product: Product) => void;
}

const BulkMovementTableComponent = ({
  products,
  pointSalesList,
  productMovements,
  ignoreStock,
  isCreatingBulk,
  updateAmount,
  distributeEqually,
  assignAllToPoint,
  getTotalMovements,
  getDepositStock,
  getPointSaleStock,
  handleOpenModal,
}: BulkMovementTableProps) => {
  if (products.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
        <p className="text-slate-400">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <>
     {/* Vista Cards para móvil y tablet (< lg) */}
      <div className="lg:hidden space-y-4">
        {products.map((product) => {
          const movements = productMovements[product.id] || {};
          const depositStock = getDepositStock(product);
          const totalToMove = getTotalMovements(product.id);
          const hasError = totalToMove > depositStock && !ignoreStock;
          const remainingStock = depositStock - totalToMove;

          return (
            <div
              key={product.id}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg"
            >
              {/* Header del producto - Mejorado */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-3 sm:p-4 border-b border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm sm:text-base leading-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      {product.code}
                    </p>
                  </div>
                </div>

                {/* Stock y acciones en fila */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      Stock Depósito:
                    </span>
                    <Badge
                      className={`font-bold text-xs sm:text-sm ${
                        depositStock > 0
                          ? "bg-emerald-600 hover:bg-emerald-600"
                          : "bg-red-600 hover:bg-red-600"
                      }`}
                    >
                      {depositStock}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="p-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-all active:scale-95"
                    title="Editar stock"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <Button
                    onClick={() => distributeEqually(product.id)}
                    disabled={
                      isCreatingBulk || (depositStock <= 0 && !ignoreStock)
                    }
                    size="sm"
                    className="h-9 px-3 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600"
                  >
                    <Divide className="w-3.5 h-3.5 mr-1.5" />
                    Distribuir
                  </Button>
                </div>
              </div>

              {/* Lista de puntos de venta - Grid optimizado */}
              <div className="p-3 sm:p-4 bg-slate-900/30">
                <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
                  {pointSalesList.map((pointSale) => {
                    const amount = movements[pointSale.id] || 0;
                    const currentStock = getPointSaleStock(
                      product,
                      pointSale.id
                    );

                    return (
                      <div
                        key={pointSale.id}
                        className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-indigo-500/50 transition-colors"
                      >
                        {/* Header del punto de venta */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 bg-indigo-500/20 rounded">
                            <Store className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm leading-tight truncate">
                              {pointSale.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Stock:{" "}
                              <span className="text-emerald-400 font-semibold">
                                {currentStock}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Input y botón */}
                        <div className="space-y-2">
                          <NumericFormat
                            value={amount || ""}
                            onValueChange={(values: NumberFormatValues) => {
                              updateAmount(
                                product.id,
                                pointSale.id,
                                values.floatValue || 0
                              );
                            }}
                            thousandSeparator={false}
                            decimalScale={0}
                            allowNegative={false}
                            placeholder="0"
                            disabled={isCreatingBulk}
                            className="w-full h-11 text-base sm:text-sm bg-slate-900 border-2 border-slate-600 text-white text-center rounded-lg px-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                          />
                          <Button
                            onClick={() =>
                              assignAllToPoint(product.id, pointSale.id)
                            }
                            disabled={
                              isCreatingBulk ||
                              (depositStock <= 0 && !ignoreStock)
                            }
                            size="sm"
                            className="w-full h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-0 active:scale-95 transition-all"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Asignar todo
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer con total - Mejorado */}
              {totalToMove > 0 && (
                <div className="bg-slate-900 px-3 sm:px-4 py-3 border-t border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-300 text-sm font-medium">
                      Total a mover:
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge
                        className={`font-bold text-sm ${
                          hasError
                            ? "bg-red-600 hover:bg-red-600"
                            : "bg-indigo-600 hover:bg-indigo-600"
                        }`}
                      >
                        {totalToMove}
                      </Badge>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">
                          Resta:
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            remainingStock < 0
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {remainingStock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default BulkMovementTableComponent;