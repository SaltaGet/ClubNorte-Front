import { useGetExistOpenRegister } from '@/hooks/admin/Register/useGetExistOpenRegister';
import { useRegisterMutations } from '@/hooks/admin/Register/useRegisterMutation';
import { getApiError } from '@/utils/apiError';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

interface AmountForm {
  amount: number;
}

const RegisterPointSale = () => {
  const { existOpen, isLoading, error } = useGetExistOpenRegister();
  const { 
    openRegister, 
    closeRegister, 
    isOpening, 
    isClosing,
    openError,
    closeError,
    resetOpenState,
    resetCloseState,
    isOpened,
    isClosed
  } = useRegisterMutations();
  
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [openErrorMessage, setOpenErrorMessage] = useState<string | null>(null);
  const [closeErrorMessage, setCloseErrorMessage] = useState<string | null>(null);
  const [openSuccessMessage, setOpenSuccessMessage] = useState<string | null>(null);
  const [closeSuccessMessage, setCloseSuccessMessage] = useState<string | null>(null);
  
  const openForm = useForm<AmountForm>();
  const closeForm = useForm<AmountForm>();

  // Efecto para manejar errores de abrir caja
  useEffect(() => {
    if (openError) {
      const apiError = getApiError(openError);
      setOpenErrorMessage(apiError?.message || 'Error al abrir la caja');
    }
  }, [openError]);

  // Efecto para manejar errores de cerrar caja
  useEffect(() => {
    if (closeError) {
      const apiError = getApiError(closeError);
      setCloseErrorMessage(apiError?.message || 'Error al cerrar la caja');
    }
  }, [closeError]);

  // Efecto para manejar éxito al abrir caja
  useEffect(() => {
    if (isOpened) {
      setOpenSuccessMessage('Caja abierta exitosamente');
      setTimeout(() => {
        setOpenSuccessMessage(null);
        resetOpenState();
      }, 3000);
    }
  }, [isOpened, resetOpenState]);

  // Efecto para manejar éxito al cerrar caja
  useEffect(() => {
    if (isClosed) {
      setCloseSuccessMessage('Caja cerrada exitosamente');
      setTimeout(() => {
        setCloseSuccessMessage(null);
        resetCloseState();
      }, 3000);
    }
  }, [isClosed, resetCloseState]);

  const handleOpenRegister = (data: AmountForm) => {
    // Limpiar mensajes previos
    setOpenErrorMessage(null);
    setOpenSuccessMessage(null);
    resetOpenState();
    
    openRegister({ open_amount: data.amount });
    setShowOpenForm(false);
    openForm.reset();
  };

  const handleCloseRegister = (data: AmountForm) => {
    // Limpiar mensajes previos
    setCloseErrorMessage(null);
    setCloseSuccessMessage(null);
    resetCloseState();
    
    closeRegister({ close_amount: data.amount });
    setShowCloseForm(false);
    closeForm.reset();
  };

  const handleCancelOpenForm = () => {
    setShowOpenForm(false);
    setOpenErrorMessage(null);
    openForm.reset();
    resetOpenState();
  };

  const handleCancelCloseForm = () => {
    setShowCloseForm(false);
    setCloseErrorMessage(null);
    closeForm.reset();
    resetCloseState();
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-white mt-4 text-center">Verificando estado de caja...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full  bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
          <p className="text-red-400 text-center">Error al verificar el estado de la caja</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full  bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Punto de Venta
          </h1>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-2xl inline-block">
            <p className="text-slate-200 text-lg">
              Estado de caja: 
              <span className={`ml-2 font-semibold ${existOpen ? 'text-emerald-500' : 'text-slate-400'}`}>
                {existOpen ? 'ABIERTA' : 'CERRADA'}
              </span>
            </p>
          </div>
        </div>

        {/* Mensajes de éxito y error */}
        <div className="max-w-3xl mx-auto mb-8 space-y-4">
          {openSuccessMessage && (
            <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 shadow-xl">
              <p className="text-emerald-400 text-center font-medium">{openSuccessMessage}</p>
            </div>
          )}
          
          {closeSuccessMessage && (
            <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-4 shadow-xl">
              <p className="text-indigo-400 text-center font-medium">{closeSuccessMessage}</p>
            </div>
          )}
          
          {openErrorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 shadow-xl">
              <p className="text-red-400 text-center font-medium">{openErrorMessage}</p>
              <button
                onClick={() => setOpenErrorMessage(null)}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline block mx-auto"
              >
                Cerrar mensaje
              </button>
            </div>
          )}
          
          {closeErrorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 shadow-xl">
              <p className="text-red-400 text-center font-medium">{closeErrorMessage}</p>
              <button
                onClick={() => setCloseErrorMessage(null)}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline block mx-auto"
              >
                Cerrar mensaje
              </button>
            </div>
          )}
        </div>

        {/* Botones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Botón Abrir Caja */}
          <button
            disabled={existOpen || isOpening}
            onClick={() => setShowOpenForm(true)}
            className={`
              h-32 rounded-2xl shadow-2xl border transition-all duration-300 transform
              ${existOpen || isOpening
                ? 'bg-slate-700/50 border-slate-600 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-white hover:scale-105 active:scale-95'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center h-full">
              {isOpening ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                  <span className="text-xl font-bold">ABRIENDO...</span>
                </>
              ) : (
                <>
                  <svg 
                    className={`w-12 h-12 mb-3 ${existOpen ? 'text-slate-500' : 'text-white'}`} 
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
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 11V7a4 4 0 118 0v4" 
                    />
                  </svg>
                  <span className="text-2xl font-bold">ABRIR CAJA</span>
                  {existOpen && (
                    <span className="text-sm mt-1 text-slate-400">Caja ya está abierta</span>
                  )}
                </>
              )}
            </div>
          </button>

          {/* Botón Cerrar Caja */}
          <button
            disabled={!existOpen || isClosing}
            onClick={() => setShowCloseForm(true)}
            className={`
              h-32 rounded-2xl shadow-2xl border transition-all duration-300 transform
              ${!existOpen || isClosing
                ? 'bg-slate-700/50 border-slate-600 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white hover:scale-105 active:scale-95'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center h-full">
              {isClosing ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                  <span className="text-xl font-bold">CERRANDO...</span>
                </>
              ) : (
                <>
                  <svg 
                    className={`w-12 h-12 mb-3 ${!existOpen ? 'text-slate-500' : 'text-white'}`} 
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
                  <span className="text-2xl font-bold">CERRAR CAJA</span>
                  {!existOpen && (
                    <span className="text-sm mt-1 text-slate-400">No hay caja abierta</span>
                  )}
                </>
              )}
            </div>
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Instrucciones</h2>
            <div className="space-y-2 text-slate-300">
              <p>• Abra la caja al iniciar el turno de trabajo</p>
              <p>• Cierre la caja al finalizar el turno</p>
              <p>• Solo puede haber una caja abierta a la vez</p>
            </div>
          </div>
        </div>

        {/* Modal para Abrir Caja */}
        {showOpenForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Abrir Caja</h3>
              <form onSubmit={openForm.handleSubmit(handleOpenRegister)} className="space-y-6">
                <div>
                  <label className="block text-slate-200 text-sm font-medium mb-2">
                    Monto inicial
                  </label>
                  <Controller
                    name="amount"
                    control={openForm.control}
                    rules={{ 
                      required: 'El monto es requerido',
                      min: { value: 0, message: 'El monto debe ser mayor a 0' }
                    }}
                    render={({ field: { onChange, value } }) => (
                      <NumericFormat
                        value={value}
                        onValueChange={(values) => onChange(values.floatValue)}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        decimalScale={0}
                        allowNegative={false}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                        placeholder="$0"
                        autoFocus
                      />
                    )}
                  />
                  {openForm.formState.errors.amount && (
                    <p className="text-red-400 text-sm mt-1">
                      {openForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancelOpenForm}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isOpening}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600/50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {isOpening ? 'Abriendo...' : 'Abrir Caja'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para Cerrar Caja */}
        {showCloseForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Cerrar Caja</h3>
              <form onSubmit={closeForm.handleSubmit(handleCloseRegister)} className="space-y-6">
                <div>
                  <label className="block text-slate-200 text-sm font-medium mb-2">
                    Monto final
                  </label>
                  <Controller
                    name="amount"
                    control={closeForm.control}
                    rules={{ 
                      required: 'El monto es requerido',
                      min: { value: 0, message: 'El monto debe ser mayor a 0' }
                    }}
                    render={({ field: { onChange, value } }) => (
                      <NumericFormat
                        value={value}
                        onValueChange={(values) => onChange(values.floatValue)}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$"
                        decimalScale={0}
                        allowNegative={false}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                        placeholder="$0"
                        autoFocus
                      />
                    )}
                  />
                  {closeForm.formState.errors.amount && (
                    <p className="text-red-400 text-sm mt-1">
                      {closeForm.formState.errors.amount.message}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancelCloseForm}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isClosing}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {isClosing ? 'Cerrando...' : 'Cerrar Caja'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPointSale;