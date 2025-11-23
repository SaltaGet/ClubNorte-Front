import { useState, useMemo, useCallback } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { Banknote, CreditCard, ShoppingCart, Smartphone } from "lucide-react";
import type { Product } from "@/hooks/pointSale/ProductPointSale/useGetAllProductsPointSale";
import ProductSearchInput from "./ProductLogic/ProductSearchInput/ProductSearchInput";
import { useIncomeMutations } from "@/hooks/pointSale/Income/useIncomeMutations";
import type { IncomeCreateData } from "@/hooks/pointSale/Income/incomeTypes";
import SuccessMessage from "@/components/generic/SuccessMessage";
import { getApiError } from "@/utils/apiError";
import SelectedProductsList from "./ProductLogic/ProductSelected/SelectedProductsList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useScrollOnLoad } from "@/hooks/generic/useScrollOnLoad";

interface FormData extends IncomeCreateData {
  product_search?: string;
}

export default function FormCreateIncome() {
  const [selectedProducts, setSelectedProducts] = useState<Map<number, Product>>(new Map());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const { createIncome, isCreating, createError, isCreated, resetCreateState } = useIncomeMutations();

  // Ref para scroll automático al input de búsqueda
  const searchInputRef = useScrollOnLoad<HTMLDivElement>(!isCreating, {
    shouldScroll: true,
    behavior: 'smooth',
    block: 'center',
    delay: 150
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      description: "",
      items: [],
      payment_method: "efectivo",
      product_search: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });

  // Detectar si es móvil o tablet
  useState(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  });

  const total = useMemo(() => {
    return watchedItems.reduce((sum, item) => {
      const product = selectedProducts.get(item.product_id);
      return sum + (product ? product.price * (item.quantity || 0) : 0);
    }, 0);
  }, [watchedItems, selectedProducts]);

  const addProduct = useCallback(
    (product: Product) => {
      if (product.stock <= 0) {
        alert("Este producto no tiene stock disponible");
        return;
      }

      const existingIndex = fields.findIndex(
        (field) => field.product_id === product.id
      );

      setSelectedProducts((prev) => new Map(prev).set(product.id, product));

      if (existingIndex >= 0) {
        const currentQuantity = watchedItems[existingIndex]?.quantity || 0;
        const newQuantity = currentQuantity + 1;

        if (newQuantity > product.stock) {
          alert(
            `No puedes agregar más unidades. Stock disponible: ${product.stock}`
          );
          return;
        }

        setValue(`items.${existingIndex}.quantity`, newQuantity);
        clearErrors(`items.${existingIndex}.quantity`);
      } else {
        append({ product_id: product.id, quantity: 1 });
      }
    },
    [fields, watchedItems, setValue, append, clearErrors]
  );

  const updateQuantity = useCallback(
    (index: number, delta: number) => {
      const currentQuantity = watchedItems[index]?.quantity || 0;
      const newQuantity = Math.max(1, currentQuantity + delta);
      const productId = fields[index]?.product_id;
      const product = selectedProducts.get(productId);

      if (product && newQuantity > product.stock) {
        alert(`Stock máximo: ${product.stock}`);
        return;
      }

      setValue(`items.${index}.quantity`, newQuantity);
      clearErrors(`items.${index}.quantity`);
    },
    [watchedItems, fields, selectedProducts, setValue, clearErrors]
  );

  const removeProduct = useCallback(
    (index: number, productId: number) => {
      setSelectedProducts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(productId);
        return newMap;
      });
      remove(index);
    },
    [remove]
  );

  const resetForm = useCallback(() => {
    reset();
    setSelectedProducts(new Map());
  }, [reset]);

  const onSubmit = useCallback(
    (data: FormData) => {
      let hasStockErrors = false;

      data.items.forEach((item, index) => {
        const product = selectedProducts.get(item.product_id);
        if (product && item.quantity > product.stock) {
          setError(`items.${index}.quantity`, {
            type: "manual",
            message: `Stock máximo: ${product.stock}`,
          });
          hasStockErrors = true;
        }
      });

      if (hasStockErrors) {
        alert("Por favor corrige los errores de stock antes de continuar");
        return;
      }

      // Guardar datos y mostrar confirmación
      setPendingFormData(data);
      setShowConfirmDialog(true);
    },
    [selectedProducts, setError]
  );

  const handleConfirmSubmit = useCallback(() => {
    if (!pendingFormData) return;

    const { product_search, ...submitData } = pendingFormData
    void product_search
    createIncome(submitData, {
      onSuccess: () => {
        resetForm();
        setShowConfirmDialog(false);
        setPendingFormData(null);
      },
    });
  }, [pendingFormData, createIncome, resetForm]);

  const mutationApiError = getApiError(createError);

  if (isCreated) {
    return (
      <SuccessMessage
        title="¡Ingreso Creado!"
        description="El ingreso ha sido registrado exitosamente y el inventario ha sido actualizado."
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4 pb-24 md:pb-4">
        
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-xl md:rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600/20 to-emerald-500/20 px-3 sm:px-6 py-3 sm:py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Crear Ingreso</h1>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Registra un nuevo ingreso con productos
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="text-xs sm:text-sm">{fields.length}</span>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-6">
              {mutationApiError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-red-400 text-center text-sm">
                    {mutationApiError.message}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Layout Grid optimizado para tablets */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                  {/* Sidebar izquierdo - Pago y Total */}
                  <div className="md:col-span-4 lg:col-span-3 space-y-4">
                    {/* Método de pago compacto */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-2">
                        Método de pago
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-800 rounded-lg p-1.5 border border-slate-700">
                        {[
                          {
                            value: "efectivo",
                            label: "Efectivo",
                            Icon: Banknote,
                          },
                          {
                            value: "tarjeta",
                            label: "Tarjeta",
                            Icon: CreditCard,
                          },
                          {
                            value: "transferencia",
                            label: "Transfer.",
                            Icon: Smartphone,
                          },
                        ].map(({ value, label, Icon }) => (
                          <label
                            key={value}
                            className="cursor-pointer"
                          >
                            <input
                              type="radio"
                              {...register("payment_method")}
                              value={value}
                              className="sr-only peer"
                              disabled={isCreating}
                            />
                            <div
                              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md text-center transition-all 
                            peer-checked:bg-indigo-600 peer-checked:text-white 
                            text-slate-400 hover:text-slate-300 
                            peer-checked:shadow-md peer-disabled:opacity-50 
                            peer-disabled:cursor-not-allowed"
                            >
                              <Icon className="w-4 h-4" />
                              <span className="font-medium text-[10px] sm:text-xs leading-tight">
                                {label}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Total compacto */}
                    <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-lg p-3 sm:p-4 border border-emerald-500/30">
                      <div className="text-center">
                        <div className="text-slate-300 text-xs mb-0.5">
                          Total a pagar
                        </div>
                        <div className="text-6xl sm:text-3xl font-bold text-emerald-400">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(total)}
                        </div>

                        {fields.length > 0 && (
                          <div className="text-slate-400 text-[10px] sm:text-xs mt-0.5">
                            {fields.length} producto{fields.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descripción compacta para tablet */}
                    {(isTablet || isMobile) && (
                      <div className="pt-2">
                        <details className="group">
                          <summary className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white transition-colors py-1.5">
                            <span className="text-xs font-medium">
                              Descripción (opcional)
                            </span>
                            <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>
                          <div className="pt-2">
                            <textarea
                              {...register("description")}
                              disabled={isCreating}
                              className="w-full px-3 py-2 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="Descripción del ingreso..."
                              rows={2}
                            />
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Botón crear ingreso para móvil/tablet */}
                    {(isTablet || isMobile) && (
                      <button
                        type="submit"
                        disabled={fields.length === 0 || isCreating}
                        className="w-full py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg disabled:opacity-60 text-sm sm:text-base"
                      >
                        {isCreating
                          ? "Creando..."
                          : fields.length === 0
                          ? "Agrega productos"
                          : `Crear Ingreso • ${new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(total)}`}
                      </button>
                    )}
                  </div>

                  {/* Área principal - Productos */}
                  <div className="md:col-span-8 lg:col-span-9">
                    <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-2">
                      Productos
                    </label>

                    <div className="mb-3" ref={searchInputRef}>
                      <Controller
                        name="product_search"
                        control={control}
                        render={({ field }) => (
                          <ProductSearchInput
                            value={field.value || ""}
                            onChange={field.onChange}
                            onProductSelect={addProduct}
                            selectedProducts={Array.from(
                              selectedProducts.values()
                            )}
                            placeholder="Buscar productos..."
                            disabled={isCreating}
                          />
                        )}
                      />
                    </div>

                    <SelectedProductsList
                      fields={fields}
                      selectedProducts={selectedProducts}
                      watchedItems={watchedItems}
                      updateQuantity={updateQuantity}
                      removeProduct={removeProduct}
                      register={register}
                      isCreating={isCreating}
                    />
                  </div>
                </div>

                {/* Botón desktop normal */}
                {!isMobile && !isTablet && (
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={fields.length === 0 || isCreating}
                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-[1.01] disabled:hover:scale-100 disabled:opacity-60 text-lg shadow-lg"
                      >
                        {isCreating
                          ? "Creando ingreso..."
                          : fields.length === 0
                          ? "Agrega productos para continuar"
                          : `Crear Ingreso • ${new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(total)}`}
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
                )}

                {/* Descripción para desktop */}
                {!isMobile && !isTablet && (
                  <div className="pt-4 border-t border-white/5">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white transition-colors py-2">
                        <span className="text-sm font-medium">
                          Descripción (opcional)
                        </span>
                        <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="pt-3">
                        <textarea
                          {...register("description")}
                          disabled={isCreating}
                          className="w-full px-4 py-3 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Descripción del ingreso (opcional)..."
                          rows={3}
                        />
                      </div>
                    </details>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">
              Confirmar creación de ingreso
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-3">
              <div>
                Estás por crear un ingreso con {fields.length} producto{fields.length !== 1 ? 's' : ''}.
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">Total:</span>
                  <span className="text-emerald-400 font-bold text-xl">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Método de pago:</span>
                  <span className="text-white font-medium capitalize">
                    {pendingFormData?.payment_method}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                ¿Deseas continuar con la creación del ingreso?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
              disabled={isCreating}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              disabled={isCreating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {isCreating ? "Creando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}