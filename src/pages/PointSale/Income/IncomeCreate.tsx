import { useGetExistOpenRegister } from '@/hooks/admin/Register/useGetExistOpenRegister';
import FormCreateIncome from './FormCreateIncome';
import TableProductPointSale from '../ProductPoinSale/TableProductPointSale';

const IncomeCreate = () => {
  const { existOpen, isLoading, error } = useGetExistOpenRegister();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-white mt-4 text-center">Verificando estado de caja...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md">
          <div className="text-center">
            <svg 
              className="w-16 h-16 text-red-400 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
            <p className="text-red-400 text-center mb-2">{error.message}</p>
            {error.body && (
              <p className="text-red-300 text-sm">{error.body}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!existOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md text-center">
          <div className="mb-6">
            <svg 
              className="w-16 sm:w-20 h-16 sm:h-20 text-amber-400 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Caja Cerrada</h2>
            <p className="text-slate-300 text-base sm:text-lg mb-4">
              Para registrar ingresos, primero debe abrir la caja registradora
            </p>
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 sm:p-4">
              <p className="text-amber-200 text-sm">
                💡 Diríjase al módulo de "Caja" para abrir la caja
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Register open - Layout vertical: Formulario arriba, tabla abajo
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 lg:gap-6">
            {/* Formulario arriba */}
            <div className="w-full">
              <FormCreateIncome />
            </div>
            
            {/* Tabla abajo */}
            <div className="w-full">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl">
                <TableProductPointSale />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeCreate;