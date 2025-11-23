import React, { useState } from "react";
import { usePointSaleGetAll } from "@/hooks/pointSale/usePointSaleGetAll";
import { useGetProductById } from "@/hooks/admin/Product/useGetProductById";
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import { Package, Warehouse, Store, ArrowLeftRight, Lock } from "lucide-react";
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

  // Obtener role y validaciones
  const role = useUserStore((state) => state.getUserRole());
  const isAdmin = useUserStore((state) => state.isUserAdmin());
  
  // Super admin, role "admin" o "repositor" pueden ajustar stock
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
    return <div className="text-slate-300 text-center">Cargando información...</div>;
  }

  if (isError || !product) {
    return (
      <div className="text-red-500 text-center">
        Ocurrió un error. Contacte al administrador.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Mover Stock</h2>

      {mutationApiError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 mb-4">
          <p className="text-red-400 text-sm text-center">
            {mutationApiError.message}
          </p>
          <button
            type="button"
            onClick={() => resetCreateState()}
            className="mt-2 w-full px-3 bg-red-600 hover:bg-red-500 text-white font-medium py-1.5 rounded-md text-sm transition"
          >
            ✕ Cerrar Error
          </button>
        </div>
      )}

      {/* Pantalla de selección de método */}
      {activeMethod === "selection" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Opción 1: Depósito → Puntos de Venta */}
          <button
            onClick={() => setActiveMethod("deposit")}
            className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-indigo-900/30 to-slate-800/50 p-6 hover:border-indigo-500 hover:from-indigo-900/50 hover:to-slate-800/70 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"></div>
                <div className="relative bg-indigo-600 rounded-full p-5">
                  <Warehouse className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">
                  Depósito → Puntos de Venta
                </h3>
                <p className="text-slate-400 text-xs">
                  Distribuir stock desde depósito
                </p>
              </div>

              <div className="mt-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                <p className="text-slate-300 text-xs flex items-center gap-2">
                  <Package className="w-3 h-3 text-indigo-400" />
                  Stock: <span className="font-bold text-indigo-400">{product?.stock_deposit?.stock ?? 0}</span>
                </p>
              </div>
            </div>
          </button>

          {/* Opción 2: Entre Puntos de Venta */}
          <button
            onClick={() => setActiveMethod("points")}
            className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-emerald-900/30 to-slate-800/50 p-6 hover:border-emerald-500 hover:from-emerald-900/50 hover:to-slate-800/70 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"></div>
                <div className="relative bg-emerald-600 rounded-full p-5">
                  <ArrowLeftRight className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">
                  Entre Puntos de Venta
                </h3>
                <p className="text-slate-400 text-xs">
                  Transferir entre puntos o al depósito
                </p>
              </div>

              <div className="mt-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                <p className="text-slate-300 text-xs flex items-center gap-2">
                  <Store className="w-3 h-3 text-emerald-400" />
                  Puntos: <span className="font-bold text-emerald-400">{pointSales.length}</span>
                </p>
              </div>
            </div>
          </button>

          {/* Opción 3: Ajustar Stock Depósito - Admin o Repositor */}
          {canAdjustStock ? (
            <button
              onClick={() => setActiveMethod("adjust")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-amber-900/30 to-slate-800/50 p-6 hover:border-amber-500 hover:from-amber-900/50 hover:to-slate-800/70 transition-all duration-300 shadow-xl hover:shadow-amber-500/20"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl"></div>
                  <div className="relative bg-amber-600 rounded-full p-5">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Ajustar Stock Depósito
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Actualizar inventario del depósito
                  </p>
                </div>

                <div className="mt-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-300 text-xs flex items-center gap-2">
                    <Warehouse className="w-3 h-3 text-amber-400" />
                    Actual: <span className="font-bold text-amber-400">{product?.stock_deposit?.stock ?? 0}</span>
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-xl border-2 border-slate-700 bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 opacity-60">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-slate-600/20 rounded-full blur-xl"></div>
                  <div className="relative bg-slate-700 rounded-full p-5">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-400 mb-2">
                    Ajustar Stock Depósito
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Acceso restringido a administradores
                  </p>
                </div>

                <div className="mt-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-400 text-xs flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Permisos insuficientes
                  </p>
                </div>
              </div>
            </div>
          )}
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

      {/* Módulo 3: Ajustar Stock Depósito - Solo si tiene permisos */}
      {activeMethod === "adjust" && canAdjustStock && (
        <AdjustDepositStock
          productId={productId}
          onBack={() => setActiveMethod("selection")}
        />
      )}
    </div>
  );
};

export default FormMovementStock;