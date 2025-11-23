import SuccessMessage from "@/components/generic/SuccessMessage";
import { useGetAllCategories } from "@/hooks/admin/Category/useGetAllCategories";
import type { ProductCreateData } from "@/hooks/admin/Product/productType";
import { useProductMutations } from "@/hooks/admin/Product/useProductMutations";
import { getApiError } from "@/utils/apiError";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { createProductSchema, type CreateProductFormData } from "./schemas/productCreateSchema";
import Modal from "@/components/generic/Modal";
import FormCreateCategory from "../Category/FormCreateCategory";
import AdjustDepositStock from "../MovementStock/formMovementStock/AdjustDepositStock";

const FormCreateProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      category_id: undefined,
      code: "",
      description: "",
      min_amount: 0,
      name: "",
      notifier: false,
      price: 0
    }
  });

  const { categories, isLoading, isError, error } = useGetAllCategories();
  
  const { 
    createProduct, 
    isCreating, 
    createError, 
    isCreated,
    resetCreateState, 
    createMutation,
  } = useProductMutations();

  const selectedCategoryId = watch("category_id");

  const onSubmit = (data: CreateProductFormData) => {
    const payload: ProductCreateData = data;
    createProduct(payload);
  };

  useEffect(() => {
    if (isCreated) {
      reset({
        category_id: selectedCategoryId,
        code: "",
        description: "",
        min_amount: 0,
        name: "",
        notifier: false,
        price: 0
      });
    }
  }, [isCreated, reset, selectedCategoryId]);

  const handleCloseSuccess = () => {
    setCreatedProductId(null);
    setIsStockModalOpen(false);
    resetCreateState();
  };

  const handleOpenStockModal = (productId: number) => {
    setCreatedProductId(productId);
    setIsStockModalOpen(true);
  };

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
  };

  // Clases responsive para inputs
  const inputClass =
    "w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-3 md:py-2 md:px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-sm transition-all duration-200";

  const mutationApiError = getApiError(createError);

  if (isCreated) {
    const responseData = createMutation?.data;
    const productId = responseData?.body;

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-md">
            <SuccessMessage
              title="¡Producto Creado!"
              description="El producto ha sido creado exitosamente y ya está disponible en el inventario."
              primaryButton={{
                text: "Crear Otro",
                onClick: handleCloseSuccess,
                variant: 'indigo'
              }}
            />
          </div>


          {/* Mostrar botón de ajustar stock solo si existe productId */}
          {productId && (
            <div className="w-full max-w-md">
              <button
                onClick={() => handleOpenStockModal(productId)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                <span>📦</span>
                <span>Ajustar Stock del Producto</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal para AdjustDepositStock */}
        {createdProductId && (
          <Modal
            isOpen={isStockModalOpen}
            onClose={handleCloseStockModal}
            size="lg"
          >
            <AdjustDepositStock
              productId={createdProductId}
              onBack={handleCloseStockModal}
              onSuccess={() => {
                handleCloseStockModal();
                handleCloseSuccess();
              }}
            />
          </Modal>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-5 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
              Crear Producto
            </h2>
            <p className="text-slate-300 text-sm md:text-base text-center">
              Completa la información del nuevo producto
            </p>
          </div>

          {/* Error de mutación */}
          {mutationApiError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 md:p-4 mb-5 md:mb-6 animate-shake">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-lg md:text-xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-400 text-sm md:text-base font-medium">
                    {mutationApiError.message}
                  </p>
                </div>
                <button
                  onClick={() => resetCreateState()}
                  className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                  aria-label="Cerrar error"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
            {/* Categoría */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm md:text-base font-medium text-slate-200">
                  Categoría <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 text-xs md:text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <span>+</span>
                  <span>Crear Categoría</span>
                </button>
              </div>
              <Controller
                name="category_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <select
                    value={value?.toString() || ""}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    disabled={isLoading || isError || isCreating}
                  >
                    <option value="">
                      {isLoading ? "Cargando categorías..." : "Selecciona una categoría"}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.category_id && (
                <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.category_id.message}
                </p>
              )}
              {isError && (
                <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {error?.message}
                </p>
              )}
            </div>

            {/* Código y Nombre - Stack en móvil, grid en tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-200 mb-2">
                  Código <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("code")}
                  className={inputClass}
                  placeholder="Ej: PROD001"
                  disabled={isCreating}
                />
                {errors.code && (
                  <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {errors.code.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-200 mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={inputClass}
                  placeholder="Nombre del producto"
                  disabled={isCreating}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm md:text-base font-medium text-slate-200 mb-2">
                Descripción
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Describe las características del producto..."
                disabled={isCreating}
              />
              {errors.description && (
                <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.description.message}
                </p>
              )}
            </div>

            {/* Precio y Stock Mínimo - Stack en móvil, grid en tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-200 mb-2">
                  Precio <span className="text-red-400">*</span>
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <NumericFormat
                      value={value}
                      onValueChange={(values) => {
                        onChange(values.floatValue || 0);
                      }}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="$"
                      decimalScale={0}
                      fixedDecimalScale={false}
                      allowNegative={false}
                      className={inputClass}
                      placeholder="$0"
                      disabled={isCreating}
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-200 mb-2">
                  Stock Mínimo <span className="text-red-400">*</span>
                </label>
                <Controller
                  name="min_amount"
                  control={control}
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
                      className={inputClass}
                      placeholder="Ej: 10"
                      disabled={isCreating}
                    />
                  )}
                />
                {errors.min_amount && (
                  <p className="text-red-400 text-xs md:text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {errors.min_amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notificador */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("notifier")}
                  className="w-5 h-5 mt-0.5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 cursor-pointer transition-all"
                  disabled={isCreating}
                />
                <div className="flex-1">
                  <span className="text-sm md:text-base text-slate-200 font-medium group-hover:text-white transition-colors">
                    Activar notificaciones de stock
                  </span>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Recibirás alertas cuando el stock sea menor al mínimo configurado
                  </p>
                </div>
              </label>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 md:py-3.5 px-6 rounded-lg text-sm md:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Crear Producto</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => reset()}
                className="sm:w-auto px-6 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-semibold py-3 md:py-3.5 rounded-lg text-sm md:text-base transition-all duration-200 disabled:opacity-50"
                disabled={isCreating}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Hint informativo */}
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-xs md:text-sm">
            Los campos marcados con <span className="text-red-400">*</span> son obligatorios
          </p>
        </div>
      </div>

      {/* Modal para crear categoría */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
      >
        <FormCreateCategory />
      </Modal>
    </div>
  );
};

export default FormCreateProduct;