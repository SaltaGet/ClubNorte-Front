import { useState } from "react";
import {
  Package,
  History,
  ShoppingCart,
  FileText,
  ChevronLeft,
  Boxes
} from "lucide-react";

import TableMovements from "./MovementStock/TableMovements";
import FormCreateExpenseBuy from "./MovementStock/FormCreateExpenseBuy";
import TableExpenseBuys from "./MovementStock/TableExpenseBuys";
import TableReponerStock from "./MovementStock/table/TableReponerStock";
import BulkMovementTable from "./MovementStock/table/bulk/BulkMovementTable";

interface SectionLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}

const SectionLayout = ({
  title,
  description,
  icon,
  onBack,
  children
}: SectionLayoutProps) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 rounded-lg p-2">{icon}</div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
          <p className="text-slate-300 text-xs sm:text-sm">{description}</p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 text-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver
      </button>
    </div>

    <div className="overflow-x-auto rounded-xl">{children}</div>
  </div>
);

const MovementStockAdmin = () => {
  const [activeView, setActiveView] = useState<
    | "selection"
    | "administrar"
    | "masivos"
    | "historial"
    | "compras"
    | "historial-compras"
  >("selection");

  const handleBack = () => setActiveView("selection");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-8">

      {/* VISTA SELECCIÓN */}
      {activeView === "selection" && (
        <div className="space-y-6 sm:space-y-8">

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Gestión de Stock
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Selecciona la acción que deseas realizar
            </p>
          </div>

          {/* ADMINISTRACIÓN DE STOCK */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Package className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Administración de Stock
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

              {/* Administrar Stock */}
              <button
                onClick={() => setActiveView("administrar")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 sm:p-8 hover:border-indigo-500 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md"></div>
                    <div className="relative bg-indigo-600 rounded-full p-4 sm:p-5 group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                      Administrar Stock
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Mover inventario entre ubicaciones
                    </p>
                  </div>
                </div>
              </button>

              {/* NUEVO: Movimientos Masivos */}
              <button
                onClick={() => setActiveView("masivos")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 sm:p-8 hover:border-purple-500 transition-all duration-300 shadow-xl hover:shadow-purple-500/20"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-md"></div>
                    <div className="relative bg-purple-600 rounded-full p-4 sm:p-5 group-hover:scale-110 transition-transform duration-300">
                      <Boxes className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                      Movimientos Masivos
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Distribuir stock a múltiples puntos
                    </p>
                  </div>
                </div>
              </button>

              {/* Historial de Movimientos */}
              <button
                onClick={() => setActiveView("historial")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 sm:p-8 hover:border-indigo-500 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md"></div>
                    <div className="relative bg-indigo-600 rounded-full p-4 sm:p-5 group-hover:scale-110 transition-transform duration-300">
                      <History className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                      Historial de Movimientos
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Consulta movimientos de stock
                    </p>
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* GESTIÓN DE COMPRAS */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Gestión de Compras
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

              {/* Registrar Compra */}
              <button
                onClick={() => setActiveView("compras")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 sm:p-8 hover:border-emerald-500 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-md"></div>
                    <div className="relative bg-emerald-500 rounded-full p-4 sm:p-5 group-hover:scale-110 transition-transform duration-300">
                      <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                      Registrar Compra
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Añade nuevas compras al inventario
                    </p>
                  </div>
                </div>
              </button>

              {/* Historial de Compras */}
              <button
                onClick={() => setActiveView("historial-compras")}
                className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 sm:p-8 hover:border-emerald-500 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
              >
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-md"></div>
                    <div className="relative bg-emerald-500 rounded-full p-4 sm:p-5 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                      Historial de Compras
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Revisa todas las compras registradas
                    </p>
                  </div>
                </div>
              </button>

            </div>
          </div>

        </div>
      )}

      {/* ADMINISTRAR */}
      {activeView === "administrar" && (
        <SectionLayout
          title="Administrar Stock"
          description="Gestiona el inventario entre ubicaciones"
          icon={<Package className="w-6 h-6 text-white" />}
          onBack={handleBack}
        >
          <TableReponerStock />
        </SectionLayout>
      )}

      {/* NUEVO: MOVIMIENTOS MASIVOS */}
      {activeView === "masivos" && (
        <SectionLayout
          title="Movimientos Masivos"
          description="Distribuye stock desde depósito a múltiples puntos de venta"
          icon={<Boxes className="w-6 h-6 text-white" />}
          onBack={handleBack}
        >
          <BulkMovementTable />
        </SectionLayout>
      )}

      {/* HISTORIAL MOVIMIENTOS */}
      {activeView === "historial" && (
        <SectionLayout
          title="Historial de Movimientos"
          description="Consulta los movimientos realizados"
          icon={<History className="w-6 h-6 text-white" />}
          onBack={handleBack}
        >
          <TableMovements />
        </SectionLayout>
      )}

      {/* COMPRAS */}
      {activeView === "compras" && (
        <SectionLayout
          title="Registrar Compra"
          description="Agrega compras al sistema"
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          onBack={handleBack}
        >
          <FormCreateExpenseBuy />
        </SectionLayout>
      )}

      {/* HISTORIAL COMPRAS */}
      {activeView === "historial-compras" && (
        <SectionLayout
          title="Historial de Compras"
          description="Revisa todas las compras registradas"
          icon={<FileText className="w-6 h-6 text-white" />}
          onBack={handleBack}
        >
          <TableExpenseBuys />
        </SectionLayout>
      )}

    </div>
  );
};

export default MovementStockAdmin;