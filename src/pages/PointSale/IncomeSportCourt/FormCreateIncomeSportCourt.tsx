import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { Banknote, CreditCard, Smartphone, CalendarDays, Clock, MapPin } from "lucide-react";
import { NumericFormat } from "react-number-format";
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import { useIncomeSportCourtMutations } from "@/hooks/pointSale/IncomeSportCourt/useIncomeSportCourtMutations";
import type { IncomeSportCourtCreateData } from "@/hooks/pointSale/IncomeSportCourt/IncomeSportCourtTypes";

import { format } from 'date-fns';
import { useGetSportCourtByPointSale } from "@/hooks/pointSale/SportCourt/getSportCourtByPointSale";

type FormData = IncomeSportCourtCreateData;

export default function FormCreateIncomeSportCourt() {
  // Hook de mutaciones
  const { createIncomeSportCourt, isCreating, createError, isCreated, resetCreateState } =
    useIncomeSportCourtMutations();

  // Hook para obtener canchas deportivas
  const { sportCourts, isLoading: isLoadingSportCourts, isError: isSportCourtsError, error: sportCourtsError } = 
    useGetSportCourtByPointSale();

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      date_play: "",
      partial_pay: 0,
      partial_payment_method: "efectivo",
      price: 0,
      shift: "mañana",
      sports_court_id: 0,
    },
  });

  // Observar el precio para validar la seña
  const watchedPrice = watch("price");

  // Función para resetear todo el formulario
  const resetForm = useCallback(() => {
    reset();
  }, [reset]);

  // Submit
  const onSubmit = useCallback(
    (data: FormData) => {
      // Las validaciones principales ahora se manejan en las reglas del formulario
      // pero mantenemos algunas como respaldo por seguridad
      if (data.sports_court_id === 0) {
        alert("Por favor selecciona una cancha deportiva");
        return;
      }
      if (data.price <= 0) {
        alert("El precio debe ser mayor a 0");
        return;
      }
      if (data.partial_pay > data.price) {
        alert("El pago parcial no puede ser mayor al precio total");
        return;
      }
      // Validación adicional de fecha
      if (data.date_play) {
        const selectedDate = new Date(data.date_play);
        const currentDate = new Date();
        if (selectedDate <= currentDate) {
          alert("La fecha debe ser posterior a la actual");
          return;
        }
      }

      // Formatear fecha a ISO antes de enviar
      const formattedData = {
        ...data,
        date_play: format(new Date(data.date_play), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      };

      createIncomeSportCourt(formattedData, {
        onSuccess: () => {
          resetForm();
        },
      });
    },
    [createIncomeSportCourt, resetForm]
  );

  // Obtener mensaje de error de la mutación
  const mutationApiError = getApiError(createError);
  const sportCourtsApiError = getApiError(sportCourtsError);

  // Si el ingreso fue creado exitosamente, mostrar mensaje de éxito
  if (isCreated) {
    return (
      <SuccessMessage
        title="¡Reserva Creada!"
        description="La reserva de cancha deportiva ha sido registrada exitosamente."
        primaryButton={{
          text: "Crear Otra",
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
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Crear Reserva</h1>
                <p className="text-slate-300 text-sm">
                  Registra una nueva reserva de cancha deportiva
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Cancha Deportiva</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Mostrar error de mutación si existe */}
            {mutationApiError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6">
                <p className="text-red-400 text-center">
                  {mutationApiError.message}
                </p>
              </div>
            )}

            {/* Mostrar error de carga de canchas si existe */}
            {sportCourtsApiError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6">
                <p className="text-red-400 text-center">
                  Error al cargar canchas: {sportCourtsApiError.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="space-y-5">
                  {/* Selección de cancha */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Cancha Deportiva
                    </label>
                    <select
                      {...register("sports_court_id", {
                        required: "Selecciona una cancha",
                        valueAsNumber: true,
                        validate: (value) => {
                          if (value === 0) {
                            return "Debes seleccionar una cancha deportiva";
                          }
                          return true;
                        },
                      })}
                      disabled={isCreating || isLoadingSportCourts}
                      className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value={0}>
                        {isLoadingSportCourts ? "Cargando canchas..." : "Selecciona una cancha..."}
                      </option>
                      {sportCourts.map((court) => (
                        <option key={court.id} value={court.id}>
                          {court.name}
                        </option>
                      ))}
                    </select>
                    {errors.sports_court_id && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.sports_court_id.message}
                      </p>
                    )}
                    {isSportCourtsError && (
                      <p className="text-red-400 text-sm mt-1">
                        Error al cargar las canchas deportivas
                      </p>
                    )}
                  </div>

                  {/* Fecha y hora */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      <CalendarDays className="inline w-4 h-4 mr-1" />
                      Fecha y hora de juego
                    </label>
                    <input
                      type="datetime-local"
                      {...register("date_play", {
                        required: "La fecha es requerida",
                        validate: (value) => {
                          if (!value) return "La fecha es requerida";
                          
                          const selectedDate = new Date(value);
                          const currentDate = new Date();
                          
                          if (selectedDate <= currentDate) {
                            return "La fecha debe ser posterior a la actual";
                          }
                          
                          return true;
                        },
                      })}
                      disabled={isCreating}
                      min={new Date(new Date().getTime() + 60000).toISOString().slice(0, 16)} // Mínimo 1 minuto en el futuro
                      className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.date_play && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.date_play.message}
                      </p>
                    )}
                  </div>

                  {/* Turno */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Turno
                    </label>
                    <div className="flex gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
                      {[
                        { value: "mañana", label: "Mañana" },
                        { value: "tarde", label: "Tarde" },
                        { value: "noche", label: "Noche" },
                      ].map(({ value, label }) => (
                        <label key={value} className="cursor-pointer flex-1">
                          <input
                            type="radio"
                            {...register("shift")}
                            value={value}
                            className="sr-only peer"
                            disabled={isCreating}
                          />
                          <div className="flex items-center justify-center py-3 px-2 rounded-md text-center transition-all peer-checked:bg-indigo-600 peer-checked:text-white text-slate-400 hover:text-slate-300 peer-checked:shadow-md peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
                            <span className="font-medium text-sm">{label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-5">
                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      Precio Total
                    </label>
                    <Controller
                      name="price"
                      control={control}
                      rules={{
                        required: "El precio es requerido",
                        min: { value: 1, message: "El precio debe ser mayor a 0" },
                      }}
                      render={({ field: { onChange, value, ...field } }) => (
                        <NumericFormat
                          {...field}
                          value={value}
                          onValueChange={(values) => {
                            onChange(values.floatValue || 0);
                          }}
                          thousandSeparator=","
                          decimalSeparator="."
                          decimalScale={0}
                          allowNegative={false}
                          prefix="$"
                          placeholder="$0"
                          disabled={isCreating}
                          className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}
                    />
                    {errors.price && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Pago parcial */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      Pago Parcial (Seña)
                    </label>
                    <Controller
                      name="partial_pay"
                      control={control}
                      rules={{
                        required: "El pago parcial es requerido",
                        min: { value: 0, message: "El pago parcial no puede ser negativo" },
                        validate: (value) => {
                          if (value > watchedPrice) {
                            return "El pago parcial no puede ser mayor al precio total";
                          }
                          return true;
                        },
                      }}
                      render={({ field: { onChange, value, ...field } }) => (
                        <NumericFormat
                          {...field}
                          value={value}
                          onValueChange={(values) => {
                            onChange(values.floatValue || 0);
                          }}
                          thousandSeparator=","
                          decimalSeparator="."
                          decimalScale={0}
                          allowNegative={false}
                          prefix="$"
                          placeholder="$0"
                          disabled={isCreating}
                          className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}
                    />
                    {errors.partial_pay && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.partial_pay.message}
                      </p>
                    )}
                  </div>

                  {/* Método de pago */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      Método de Pago
                    </label>
                    <div className="flex flex-col gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
                      {[
                        { value: "efectivo", label: "Efectivo", Icon: Banknote },
                        { value: "tarjeta", label: "Tarjeta", Icon: CreditCard },
                        { value: "transferencia", label: "Transferencia", Icon: Smartphone },
                      ].map(({ value, label, Icon }) => (
                        <label key={value} className="cursor-pointer">
                          <input
                            type="radio"
                            {...register("partial_payment_method")}
                            value={value}
                            className="sr-only peer"
                            disabled={isCreating}
                          />
                          <div className="flex items-center gap-3 py-3 px-4 rounded-md transition-all peer-checked:bg-indigo-600 peer-checked:text-white text-slate-400 hover:text-slate-300 peer-checked:shadow-md peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isCreating || isLoadingSportCourts || isSportCourtsError}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-[1.01] disabled:hover:scale-100 disabled:opacity-60 text-lg shadow-lg"
                  >
                    {isCreating ? "Creando reserva..." : "Crear Reserva"}
                  </button>

                  {/* Botón para limpiar estado si hay error */}
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