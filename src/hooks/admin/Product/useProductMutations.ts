import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { ProductUpdateData, ProductCreateData, BulkPriceUpdate } from "./productType";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllProducts",
  "ProductGetById", 
  "searchProductsByName",
  "searchProductsByCode",
  "ProductsGetByCategory",
];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Función para crear producto
const createProduct = async (formData: ProductCreateData): Promise<ApiSuccessResponse<number>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/product/create",
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para actualizar producto
const updateProduct = async (id: number, formData: ProductUpdateData): Promise<ApiSuccessResponse<number>> => {
  const { data } = await apiClubNorte.put(
    `/api/v1/product/update`,
    {
      id: id,
      category_id: formData.category_id,
      code: formData.code,
      description: formData.description,
      name: formData.name,
      price: formData.price,
      min_amount: formData.min_amount,
      notifier: formData.notifier
    },
    { withCredentials: true }
  );
  return data;
};

// Función para actualizar precios masivamente
const bulkUpdatePrices = async (bulkData: BulkPriceUpdate): Promise<ApiSuccessResponse<number>> => {
  const { data } = await apiClubNorte.put(
    `/api/v1/product/list_price`,
    bulkData,
    { withCredentials: true }
  );
  return data;
};

// Función para eliminar producto
const deleteProduct = async (id: number): Promise<void> => {
  await apiClubNorte.delete(
    `/api/v1/product/delete/${id}`,
    { withCredentials: true }
  );
};

export const useProductMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Producto creado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear producto:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdateData }) =>
      updateProduct(id, data),
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Producto actualizado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar producto:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  // Mutación para actualización masiva de precios
  const bulkUpdatePricesMutation = useMutation({
    mutationFn: bulkUpdatePrices,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Precios actualizados masivamente:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar precios:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Producto eliminado");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al eliminar producto:", errorMessage);
      alert(`❌ ${errorMessage}`);
    },
  });

  return {
    // Funciones de mutación
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    bulkUpdatePrices: bulkUpdatePricesMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    
    // Estados de loading
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isBulkUpdatingPrices: bulkUpdatePricesMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Estados de éxito
    isCreated: createMutation.isSuccess,
    isUpdated: updateMutation.isSuccess,
    isBulkPricesUpdated: bulkUpdatePricesMutation.isSuccess,
    isDeleted: deleteMutation.isSuccess,
    
    // Errores
    createError: createMutation.error,
    updateError: updateMutation.error,
    bulkUpdatePricesError: bulkUpdatePricesMutation.error,
    deleteError: deleteMutation.error,
    
    // Funciones de reset (para limpiar estados)
    resetCreateState: createMutation.reset,
    resetUpdateState: updateMutation.reset,
    resetBulkUpdatePricesState: bulkUpdatePricesMutation.reset,
    resetDeleteState: deleteMutation.reset,
    
    // Mutaciones completas (por si necesitas más control)
    createMutation,
    updateMutation,
    bulkUpdatePricesMutation,
    deleteMutation,
  };
};