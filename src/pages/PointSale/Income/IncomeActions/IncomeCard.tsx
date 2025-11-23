// src/components/admin/Income/IncomeCard.tsx
import { useGetIncomeById } from "@/hooks/pointSale/Income/useGetIncomeById";
import { Loader2, AlertCircle, CreditCard, Calendar, User, Package, DollarSign, FileText } from "lucide-react";

interface IncomeCardProps {
  id: number;
}

export const IncomeCard = ({ id }: IncomeCardProps) => {
  const { income, isLoading, isError, error } = useGetIncomeById(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="text-sm text-slate-400">Cargando ingreso...</span>
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="flex items-center gap-3 p-4 text-red-400 bg-red-500/10 rounded-lg border border-red-500/30">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{error.message}</span>
      </div>
    );
  }

  if (!income) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <AlertCircle className="w-10 h-10 text-slate-400" />
        <span className="text-sm text-slate-400">No se encontró el ingreso</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header con ID y Total destacado */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-xs font-medium mb-1">Ingreso</p>
            <p className="text-white text-2xl font-bold">#{income.id}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-xs font-medium mb-1">Total</p>
            <p className="text-white text-3xl font-bold">${income.total.toLocaleString('es-AR')}</p>
          </div>
        </div>
      </div>

      {/* Info Grid - 2 columnas en móvil, 3 en tablet+ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {/* Usuario */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-400">Usuario</p>
          </div>
          <p className="text-sm text-white font-medium truncate">
            {income.user.first_name} {income.user.last_name}
          </p>
        </div>

        {/* Método de pago */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-slate-400">Pago</p>
          </div>
          <p className="text-sm text-white font-medium capitalize">
            {income.payment_method}
          </p>
        </div>

        {/* Fecha */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-slate-400">Fecha</p>
          </div>
          <p className="text-sm text-white font-medium">
            {new Date(income.created_at).toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* Descripción (si existe) */}
      {income.description && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-400 font-medium">Descripción</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{income.description}</p>
        </div>
      )}

      {/* Productos */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            <p className="text-sm text-white font-semibold">Productos</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
            {income.items.length} {income.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Lista de productos - Compacta y con scroll si es necesario */}
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {income.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-slate-700/30 rounded-md hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm text-white font-medium truncate">{item.product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">Cant: {item.quantity}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">${item.product.price.toLocaleString('es-AR')} c/u</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                  {item.subtotal.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen final */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/20 rounded-full p-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm text-slate-300 font-medium">Total del Ingreso</span>
          </div>
          <span className="text-2xl font-bold text-emerald-400">
            ${income.total.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </div>
  );
};