import apiClubNorte from "@/api/apiClubNorte";
import { useQuery } from "@tanstack/react-query";
import { getApiError } from "@/utils/apiError";

//import MKDay from "@/mockup/Report1Day.json";

// ============================================
// TYPES
// ============================================
export interface ApiSuccessResponse<T> {
  status: boolean;
  message: string;
  body: T;
}

export interface DayMovement {
  balance: number;
  fecha: string; // ISO 8601 con timezone: "2025-10-08T00:00:00-03:00"
  point_sale_id: number;
  point_sale_name: string;
  total_canchas: number;
  total_egresos: number;
  total_ingresos: number;
}

export interface DayData {
  fecha: string; // Formato: "YYYY-MM-DD"
  movimiento: DayMovement[];
}

export type DayReportBody = DayData[];

export interface GetDayReportParams {
  from_date: string; // Formato: "YYYY-MM-DD"
  to_date: string; // Formato: "YYYY-MM-DD"
}

// ============================================
// VALIDATION
// ============================================
const isValidDateFormat = (date: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(date);

// ============================================
// API CALL
// ============================================
const getDayReport = async (
  params: GetDayReportParams
): Promise<ApiSuccessResponse<DayReportBody>> => {
  const response = await apiClubNorte.post<ApiSuccessResponse<DayReportBody>>(
    `/api/v1/report/get_by_date?form=day`,
    params,
    { withCredentials: true }
  );
  return response.data;
};

// ============================================
// CUSTOM HOOK
// ============================================
export const useGetDayReport = (params: GetDayReportParams) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getDayReport", params.from_date, params.to_date],
    queryFn: () => getDayReport(params),
    enabled:
      !!params.from_date &&
      !!params.to_date &&
      isValidDateFormat(params.from_date) &&
      isValidDateFormat(params.to_date),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const apiError = getApiError(error);

  return {
    dayReportData: data?.body ?? ([] as DayReportBody),
    //dayReportData: MKDay ?? ([] as DayReportBody),
    isLoading,
    isError,
    error: apiError,
    status: data?.status,
    message: data?.message,
  };
};