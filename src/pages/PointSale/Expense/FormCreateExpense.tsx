import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Banknote, CreditCard, ShoppingCart, Smartphone } from "lucide-react";
import { useExpenseMutations } from "@/hooks/pointSale/Expense/useExpenseMutations";
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import type { ExpenseCreateData } from "@/hooks/pointSale/Expense/ExpenseTypes";

export default function FormCreateExpense() {
  const { createExpense, isCreating, createError, isCreated, resetCreateState } =
    useExpenseMutations();

  const { register, handleSubmit, reset, control } = useForm<ExpenseCreateData>({
    defaultValues: {
      description: "",
      payment_method: "efectivo",
      total: 0,
    },
  });

  const resetForm = useCallback(() => {
    reset();
  }, [reset]);

  const onSubmit = useCallback(
    (data: ExpenseCreateData) => {
      createExpense(data, {
        onSuccess: () => {
          resetForm();
        },
      });
    },
    [createExpense, resetForm]
  );

  const mutationApiError = getApiError(createError);

  if (isCreated) {
    return (
      <SuccessMessage
        title="¡Egreso Creado!"
        description="El egreso ha sido registrado exitosamente."
        primaryButton={{
          text: "Crear Otro",
          onClick: () => {
            resetCreateState();
            resetForm();
          },
          variant: "indigo",
        }}
      />
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600/20 to-orange-500/20 px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Crear Egreso</h1>
                <p className="text-slate-300 text-sm">
                  Registra un nuevo egreso o gasto
                </p>
              </div>
              <ShoppingCart className="w-5 h-5 text-slate-300" />
            </div>
          </div>

          <div className="p-6">
            {mutationApiError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6">
                <p className="text-red-400 text-center">
                  {mutationApiError.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Descripción del egreso
                </label>
                <textarea
                  {...register("description", { required: true })}
                  disabled={isCreating}
                  className="w-full px-4 py-3 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ej: Compra de materiales, pago de servicios, etc..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Monto del egreso
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    $
                  </span>
                  <Controller
                    name="total"
                    control={control}
                    rules={{
                      required: "El monto es requerido",
                      validate: (value) => value > 0 || "El monto debe ser mayor a 0"
                    }}
                    render={({ field: { onChange, value } }) => (
                      <NumericFormat
                        value={value}
                        onValueChange={(values) => {
                          onChange(values.floatValue || 0);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={0}
                        allowNegative={false}
                        disabled={isCreating}
                        className="w-full pl-10 pr-4 py-4 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0"
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Método de pago
                </label>
                <div className="flex flex-wrap gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
                  {[
                    { value: "efectivo", label: "Efectivo", Icon: Banknote },
                    { value: "tarjeta", label: "Tarjeta", Icon: CreditCard },
                    { value: "transferencia", label: "Transferencia", Icon: Smartphone },
                  ].map(({ value, label, Icon }) => (
                    <label key={value} className="cursor-pointer flex-1 min-w-[100px]">
                      <input
                        type="radio"
                        {...register("payment_method")}
                        value={value}
                        className="sr-only peer"
                        disabled={isCreating}
                      />
                      <div className="flex items-center justify-center gap-1 py-3 px-2 rounded-md text-center transition-all peer-checked:bg-red-600 peer-checked:text-white text-slate-400 hover:text-slate-300 peer-checked:shadow-md peer-disabled:opacity-50 peer-disabled:cursor-not-allowed min-h-[48px]">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
                          {label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-[1.01] disabled:hover:scale-100 disabled:opacity-60 text-lg shadow-lg"
                  >
                    {isCreating ? "Creando egreso..." : "Crear Egreso"}
                  </button>

                  {createError && (
                    <button
                      type="button"
                      onClick={() => resetCreateState()}
                      className="px-6 bg-slate-600 hover:bg-slate-500 text-white font-medium py-4 rounded-xl text-sm transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}