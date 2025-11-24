import { useMutation } from "@tanstack/react-query";
import apiClubNorte from "@/api/apiClubNorte";
import { getApiError } from "@/utils/apiError";
import useInvalidateQueries from "@/utils/useInvalidateQueries";
import type { MovementStockCreateData, UpdateStockDepositData } from "./movementStockType";

// Query keys que se invalidarán después de las mutaciones
const QUERIES_TO_INVALIDATE = [
  "getAllProducts",
  "ProductGetById",
  "searchProductsByName",
  "searchProductsByCode",
  "ProductsGetByCategory",
  "getAllMovements"
];

interface ApiSuccessResponse<T> {
  status: boolean;
  body: T;
  message: string;
}

// Estructura que espera el endpoint bulk
interface MovementStockBulkItem {
  amount: number;
  from_id: number;
  from_type: "deposit" | "point_sale";
  ignore_stock: boolean;
  to_id: number;
  to_type: "deposit" | "point_sale";
}

interface MovementStockBulkData {
  product_id: number;
  movement_stock_item: MovementStockBulkItem[];
}

// Función para crear movimiento de stock (INDIVIDUAL)
const createMovementStock = async (
  formData: MovementStockCreateData
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/movement_stock/move",
    formData,
    { withCredentials: true }
  );
  return data;
};

// NUEVO: Función para crear movimientos de stock en BULK
const createMovementStockBulk = async (
  formDataList: MovementStockBulkData[]
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.post(
    "/api/v1/movement_stock/move_list",
    formDataList,
    { withCredentials: true }
  );
  return data;
};

// Función para actualizar stock en deposito (INDIVIDUAL)
const updateStockDeposit = async (
  formData: UpdateStockDepositData
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    "/api/v1/deposit/update_stock",
    formData,
    { withCredentials: true }
  );
  return data;
};

// Función para actualizar stock en deposito (BULK)
const updateStockDepositBulk = async (
  formDataList: UpdateStockDepositData[]
): Promise<ApiSuccessResponse<string>> => {
  const { data } = await apiClubNorte.put(
    "/api/v1/deposit/update_stock_bulk",
    formDataList,
    { withCredentials: true }
  );
  return data;
};

export const useMovementStockMutations = () => {
  const invalidateQueries = useInvalidateQueries();

  // Mutación para crear movimiento (INDIVIDUAL)
  const createMutation = useMutation({
    mutationFn: createMovementStock,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Movimiento de stock creado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear movimiento de stock:", errorMessage);
    },
  });

  // NUEVA: Mutación para crear movimientos (BULK)
  const createBulkMutation = useMutation({
    mutationFn: createMovementStockBulk,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Movimientos de stock creados (bulk):", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al crear movimientos de stock (bulk):", errorMessage);
    },
  });

  // Mutación para actualizar stock en deposito (INDIVIDUAL)
  const updateStockMutation = useMutation({
    mutationFn: updateStockDeposit,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Stock de deposito actualizado:", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar stock de deposito:", errorMessage);
    },
  });

  // Mutación para actualizar stock en deposito (BULK)
  const updateStockBulkMutation = useMutation({
    mutationFn: updateStockDepositBulk,
    onSuccess: async (data) => {
      await invalidateQueries(QUERIES_TO_INVALIDATE);
      console.log("Stock de deposito actualizado (bulk):", data);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      const errorMessage = apiError?.message || "Error desconocido";
      console.error("Error al actualizar stock de deposito (bulk):", errorMessage);
    },
  });

  return {
    // ===== Crear Movimiento (Individual) =====
    createMovementStock: createMutation.mutate,
    isCreating: createMutation.isPending,
    isCreated: createMutation.isSuccess,
    createError: createMutation.error,
    resetCreateState: createMutation.reset,
    createMutation,

    // ===== NUEVO: Crear Movimientos (Bulk) =====
    createMovementStockBulk: createBulkMutation.mutate,
    isCreatingBulk: createBulkMutation.isPending,
    isCreatedBulk: createBulkMutation.isSuccess,
    createBulkError: createBulkMutation.error,
    resetCreateBulkState: createBulkMutation.reset,
    createBulkMutation,

    // ===== Actualizar Stock Deposito (Individual) =====
    updateStockDeposit: updateStockMutation.mutate,
    isUpdatingStock: updateStockMutation.isPending,
    isStockUpdated: updateStockMutation.isSuccess,
    updateStockError: updateStockMutation.error,
    resetUpdateStockState: updateStockMutation.reset,
    updateStockMutation,

    // ===== Actualizar Stock Deposito (Bulk) =====
    updateStockDepositBulk: updateStockBulkMutation.mutate,
    isUpdatingStockBulk: updateStockBulkMutation.isPending,
    isStockUpdatedBulk: updateStockBulkMutation.isSuccess,
    updateStockBulkError: updateStockBulkMutation.error,
    resetUpdateStockBulkState: updateStockBulkMutation.reset,
    updateStockBulkMutation,
  };
};

// Exportar los tipos para usar en los componentes
export type { MovementStockBulkData, MovementStockBulkItem };