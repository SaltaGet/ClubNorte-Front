import React, { useState } from "react";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";
import { useGetProductById } from "@/hooks/admin/Product/useGetProductById";
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import { Package, Warehouse, Store, ArrowLeftRight, Lock, AlertCircle } from "lucide-react";
import { useMovementStockMutations } from "@/hooks/admin/MovementStock/useMovementStockMutations";
import DepositToPointSale from "./DepositToPointSale";
import PointSaleToPointSale from "./PointSaleToPointSale";
import AdjustDepositStock from "./AdjustDepositStock";
import useUserStore from "@/store/useUserStore";

interface FormMovementStockProps {
  productId: number;
}

type ActiveMethod = "selection" | "deposit" | "points" | "adjust";

const FormMovementStock: React.FC<FormMovementStockProps> = ({ productId }) => {
  const { pointSales, isLoading: isLoadingPoints } = usePointSaleGetAll();
  const {
    product,
    isLoading: isLoadingProduct,
    isError,
  } = useGetProductById(productId);

  const {
    createMovementStock,
    isCreating,
    isCreated,
    createError,
    resetCreateState
  } = useMovementStockMutations();

  const role = useUserStore((state) => state.getUserRole());
  const isAdmin = useUserStore((state) => state.isUserAdmin());
  
  const canAdjustStock = isAdmin || role === "admin" || role === "repositor";

  const [activeMethod, setActiveMethod] = useState<ActiveMethod>("selection");

  const mutationApiError = getApiError(createError);

  const resetAllStates = () => {
    setActiveMethod("selection");
  };

  if (isCreated) {
    return (
      <SuccessMessage
        title="¡Movimiento Realizado!"
        description="El movimiento de stock ha sido realizado exitosamente. Los inventarios han sido actualizados."
        primaryButton={{
          text: "Realizar Otro Movimiento",
          onClick: () => {
            resetCreateState();
            resetAllStates();
          },
          variant: 'indigo'
        }}
      />
    );
  }

  if (isLoadingPoints || isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
          <Package className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Cargando información del producto...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="bg-red-500/10 rounded-full p-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-red-400 font-semibold">Error al cargar el producto</p>
          <p className="text-slate-400 text-sm">Por favor, intenta nuevamente o contacta al administrador</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mutationApiError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-red-300 text-sm font-medium">
                {mutationApiError.message}
              </p>
              <button
                type="button"
                onClick={() => resetCreateState()}
                className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
              >
                Cerrar mensaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla de selección de método */}
      {activeMethod === "selection" && (
        <div className="space-y-4">
          {/* Info del producto */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Producto seleccionado</p>
                <p className="text-white font-semibold">{product?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Stock Depósito</p>
                <p className="text-2xl font-bold text-indigo-400">{product?.stock_deposit?.stock ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Grid de opciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Opción 1: Depósito → Puntos de Venta */}
            <button
              onClick={() => setActiveMethod("deposit")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-indigo-900/30 to-slate-800/50 p-4 hover:border-indigo-500 hover:from-indigo-900/50 hover:to-slate-800/70 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative bg-indigo-600 rounded-full p-3 group-hover:bg-indigo-500 transition-colors">
                    <Warehouse className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Depósito → Puntos
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Distribuir stock desde depósito
                  </p>
                </div>

                <div className="w-full px-3 py-1.5 bg-slate-700/50 rounded-md group-hover:bg-slate-700/70 transition-colors">
                  <p className="text-slate-300 text-xs flex items-center justify-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-indigo-400">{product?.stock_deposit?.stock ?? 0}</span>
                    <span className="text-slate-500">unidades</span>
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Opción 2: Entre Puntos de Venta */}
            <button
              onClick={() => setActiveMethod("points")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-emerald-900/30 to-slate-800/50 p-4 hover:border-emerald-500 hover:from-emerald-900/50 hover:to-slate-800/70 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                  <div className="relative bg-emerald-600 rounded-full p-3 group-hover:bg-emerald-500 transition-colors">
                    <ArrowLeftRight className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Entre Puntos
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Transferir entre puntos o depósito
                  </p>
                </div>

                <div className="w-full px-3 py-1.5 bg-slate-700/50 rounded-md group-hover:bg-slate-700/70 transition-colors">
                  <p className="text-slate-300 text-xs flex items-center justify-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">{pointSales.length}</span>
                    <span className="text-slate-500">puntos</span>
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Opción 3: Ajustar Stock Depósito */}
            {canAdjustStock ? (
              <button
                onClick={() => setActiveMethod("adjust")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-amber-900/30 to-slate-800/50 p-4 hover:border-amber-500 hover:from-amber-900/50 hover:to-slate-800/70 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                    <div className="relative bg-amber-600 rounded-full p-3 group-hover:bg-amber-500 transition-colors">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-1">
                      Ajustar Depósito
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Actualizar inventario del depósito
                    </p>
                  </div>

                  <div className="w-full px-3 py-1.5 bg-slate-700/50 rounded-md group-hover:bg-slate-700/70 transition-colors">
                    <p className="text-slate-300 text-xs flex items-center justify-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-500">Actual:</span>
                      <span className="font-semibold text-amber-400">{product?.stock_deposit?.stock ?? 0}</span>
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ) : (
              <div className="relative overflow-hidden rounded-xl border-2 border-slate-700/50 bg-gradient-to-br from-slate-900/30 to-slate-800/30 p-4 cursor-not-allowed">
                <div className="flex flex-col items-center gap-3 text-center opacity-50">
                  <div className="relative">
                    <div className="bg-slate-700 rounded-full p-3">
                      <Lock className="w-7 h-7 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-400 mb-1">
                      Ajustar Depósito
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Solo administradores y repositores
                    </p>
                  </div>

                  <div className="w-full px-3 py-1.5 bg-slate-700/30 rounded-md">
                    <p className="text-slate-500 text-xs flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Sin permisos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ayuda contextual */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs leading-relaxed">
              💡 <span className="font-medium text-slate-300">Tip:</span> Selecciona el tipo de movimiento que deseas realizar. Los cambios se reflejarán inmediatamente en el inventario.
            </p>
          </div>
        </div>
      )}

      {/* Módulo 1: Depósito → Puntos de Venta */}
      {activeMethod === "deposit" && (
        <DepositToPointSale
          product={product}
          pointSales={pointSales}
          isCreating={isCreating}
          createMovementStock={createMovementStock}
          onBack={() => setActiveMethod("selection")}
          onSuccess={resetAllStates}
        />
      )}

      {/* Módulo 2: Entre Puntos de Venta */}
      {activeMethod === "points" && (
        <PointSaleToPointSale
          product={product}
          pointSales={pointSales}
          isCreating={isCreating}
          createMovementStock={createMovementStock}
          onBack={() => setActiveMethod("selection")}
          onSuccess={resetAllStates}
        />
      )}

      {/* Módulo 3: Ajustar Stock Depósito */}
      {activeMethod === "adjust" && canAdjustStock && (
        <AdjustDepositStock
          productId={productId}
          onBack={() => setActiveMethod("selection")}
        />
      )}
    </div>
  );
};

export default FormMovementStock