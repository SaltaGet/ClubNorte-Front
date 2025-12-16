import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";
import type { ProductSummary } from "./ReportsType";

//import MKPorfitableProducts from "@/mockup/Report2.json"

// Tipo genérico para manejar la respuesta de la API
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

// Datos que se envían en el POST
export interface GetReportProfitableProductsParams {
  from_date: string; // Formato: "YYYY-MM-DD"
  to_date: string; // Formato: "YYYY-MM-DD"
}

// La API devuelve el array directamente en body
type ProfitableProductsResponse = ProductSummary[];

// Llamada a la API para obtener el reporte de productos rentables
const getReportProfitableProducts = async (
  params: GetReportProfitableProductsParams
): Promise<ApiSuccessResponse<ProfitableProductsResponse>> => {
  const response = await apiClubNorte.post<ApiSuccessResponse<ProfitableProductsResponse>>(
    `/api/v1/report/get_profitable_products`,
    params,
    { withCredentials: true }
  );
  return response.data;
};

// Custom hook para usar en componentes
export const useGetReportProfitableProducts = (
  params: GetReportProfitableProductsParams
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getReportProfitableProducts", params],
    queryFn: () => getReportProfitableProducts(params),
    enabled: !!params.from_date && !!params.to_date,
  });

  const apiError = getApiError(error);

  return {
    productsData: {
      products: data?.body ?? [], // Ahora body ES el array
      //products: MKPorfitableProducts ?? [], // Ahora body ES el array
    },
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};