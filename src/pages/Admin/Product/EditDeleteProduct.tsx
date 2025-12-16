import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NumericFormat } from 'react-number-format';
import { useGetProductById } from '@/hooks/admin/Product/useGetProductById';
import { useProductMutations } from '@/hooks/admin/Product/useProductMutations';
import { useGetAllCategories } from '@/hooks/admin/Category/useGetAllCategories';
import { getApiError } from '@/utils/apiError';
import SuccessMessage from '@/components/generic/SuccessMessage';
import { editProductSchema, type EditProductFormData } from './schemas/editProductSchema';

interface EditDeleteProductProps {
  id: number;
  onClose?: () => void;
}

const EditDeleteProduct: React.FC<EditDeleteProductProps> = ({ id, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      category_id: 0,
      code: "",
      description: "",
      min_amount: 0,
      name: "",
      notifier: false,
      price: 0
    }
  });

  // Obtener categorías
  const { 
    categories, 
    isLoading: isLoadingCategories, 
    isError: isErrorCategories, 
    error: categoriesError 
  } = useGetAllCategories();

  // Obtener datos del producto
  const { 
    product, 
    isLoading: isLoadingProduct, 
    isError: isErrorProduct, 
    error: productError 
  } = useGetProductById(id);

  // Hook de mutaciones
  const {
    updateProduct,
    deleteProduct,
    isUpdating,
    isDeleting,
    isUpdated,
    isDeleted,
    updateError,
    deleteError,
    resetUpdateState,
  } = useProductMutations();

  // Cargar datos en el formulario cuando se obtenga el producto
  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('code', product.code);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('category_id', product.category.id);
      setValue('min_amount', product.min_amount);
      setValue('notifier', product.notifier);
    }
  }, [product, setValue]);

  const onSubmit = (data: EditProductFormData) => {
    updateProduct({ id, data });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este producto?');
    if (confirmDelete) {
      deleteProduct(id);
    }
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  // Procesar errores para mostrar en UI
  const mutationUpdateError = getApiError(updateError);
  const mutationDeleteError = getApiError(deleteError);

  // Pantalla de éxito para actualización
  if (isUpdated) {
    return (
      <SuccessMessage
        title="¡Producto Actualizado!"
        description="El producto ha sido actualizado exitosamente"
        primaryButton={{
          text: "Editar de nuevo",
          onClick: () => resetUpdateState(),
          variant: "slate"
        }}
        secondaryButton={onClose ? {
          text: "Volver",
          onClick: onClose,
          variant: "indigo"
        } : undefined}
      />
    );
  }

  // Si el producto fue eliminado exitosamente
  if (isDeleted) {
    return (
      <SuccessMessage
        title="¡Producto Eliminado!"
        description="El producto ha sido eliminado exitosamente"
        primaryButton={onClose ? {
          text: "Volver",
          onClick: onClose,
          variant: "indigo"
        } : undefined}
      />
    );
  }

  if (isLoadingProduct || isLoadingCategories) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            Cargando {isLoadingProduct ? 'producto' : 'categorías'}...
          </div>
        </div>
      </div>
    );
  }

  if (isErrorProduct) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
            <p className="text-red-400 text-center">
              Error al cargar el producto: {productError?.message || 'Error desconocido'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 rounded-md text-sm transition"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isErrorCategories) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
            <p className="text-red-400 text-center">
              Error al cargar categorías: {categoriesError?.message || 'Error desconocido'}
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-1.5 rounded-md text-sm transition"
              >
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Editar Producto</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mostrar errores de mutación */}
        {mutationUpdateError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              {mutationUpdateError.message}
            </p>
          </div>
        )}

        {mutationDeleteError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 mb-4">
            <p className="text-red-400 text-sm text-center">
              Error al eliminar: {mutationDeleteError.message}
            </p>
          </div>
        )}

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }} 
          className="space-y-4"
        >
          {/* Nombre y Código */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-200 mb-1">Nombre</label>
              <input
                type="text"
                {...register('name')}
                className={inputClass}
                placeholder="Nombre del producto"
                disabled={isUpdating || isDeleting}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-200 mb-1">Código</label>
              <input
                type="text"
                {...register('code')}
                className={inputClass}
                placeholder="Código del producto"
                disabled={isUpdating || isDeleting}
              />
              {errors.code && (
                <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Descripción</label>
            <textarea
              {...register('description')}
              className={`${inputClass} min-h-[60px] resize-none`}
              placeholder="Descripción del producto"
              disabled={isUpdating || isDeleting}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Precio y Stock Mínimo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-200 mb-1">Precio</label>
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
                    fixedDecimalScale={true}
                    allowNegative={false}
                    className={inputClass}
                    placeholder="$0,00"
                    disabled={isUpdating || isDeleting}
                  />
                )}
              />
              {errors.price && (
                <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-200 mb-1">Stock Mínimo</label>
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
                    disabled={isUpdating || isDeleting}
                  />
                )}
              />
              {errors.min_amount && (
                <p className="text-red-400 text-xs mt-1">{errors.min_amount.message}</p>
              )}
            </div>
          </div>

          {/* Select de Categoría */}
          <div>
            <label className="block text-xs text-slate-200 mb-1">Categoría</label>
            <Controller
              name="category_id"
              control={control}
              render={({ field: { onChange, value } }) => (
                <select
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                  className={inputClass}
                  disabled={isUpdating || isDeleting}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.category_id && (
              <p className="text-red-400 text-xs mt-1">{errors.category_id.message}</p>
            )}
          </div>

          {/* Notificador */}
          <div>
            <label className="flex items-center space-x-2 text-xs text-slate-200">
              <input
                type="checkbox"
                {...register('notifier')}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 rounded focus:ring-indigo-500 focus:ring-2"
                disabled={isUpdating || isDeleting}
              />
              <span>Notificar cuando el stock sea menor al mínimo</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
              disabled={isUpdating || isDeleting}
            >
              {isUpdating ? "Actualizando..." : "Actualizar"}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-1.5 rounded-md text-sm transition disabled:opacity-50"
              disabled={isUpdating || isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <p>ID: {product?.id}</p>
            <p>Categoría: {product?.category.name}</p>
            <p>Stock mínimo: {product?.min_amount}</p>
            <p>Notificaciones: {product?.notifier ? 'Activadas' : 'Desactivadas'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDeleteProduct;