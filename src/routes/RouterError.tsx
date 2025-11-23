import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import { AlertCircle, Home, ArrowLeft, Search, RefreshCcw } from "lucide-react";

const RouterError = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Determinar el tipo de error
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const errorStatus = isRouteErrorResponse(error) ? error.status : 500;
  const errorMessage = isRouteErrorResponse(error) 
    ? error.statusText || error.data 
    : error instanceof Error 
    ? error.message 
    : "Ha ocurrido un error inesperado";

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Card principal */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Icono con efecto glow */}
          <div className="relative mb-8 inline-block">
            <div className={`${
              is404 
                ? "bg-yellow-500/10" 
                : "bg-red-500/10"
            } rounded-2xl p-6 sm:p-8 backdrop-blur-sm`}>
              {is404 ? (
                <Search className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
              ) : (
                <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-400" />
              )}
            </div>
            <div className={`absolute inset-0 rounded-2xl ${
              is404 ? "bg-yellow-500/20" : "bg-red-500/20"
            } blur-2xl -z-10`}></div>
          </div>

          {/* Código de error */}
          <div className="mb-4">
            <h1 className={`text-6xl sm:text-8xl font-black ${
              is404 ? "text-yellow-400" : "text-red-400"
            } mb-2 tracking-tight`}>
              {errorStatus}
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"></div>
          </div>

          {/* Título y descripción */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {is404 ? "Página no encontrada" : "Algo salió mal"}
          </h2>
          
          <p className="text-slate-300 text-base sm:text-lg mb-2 leading-relaxed">
            {is404 
              ? "La página que buscas no existe o ha sido movida."
              : "Ocurrió un error inesperado. Por favor, intenta nuevamente."}
          </p>

          {/* Mensaje de error técnico */}
          {!is404 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-300 text-sm font-mono break-words">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {/* Botón principal - Ir al inicio */}
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95"
            >
              <Home size={20} />
              <span>Ir al Inicio</span>
            </button>

            {/* Botón secundario - Volver atrás */}
            <button
              onClick={handleGoBack}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 active:scale-95"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
          </div>

          {/* Botón terciario - Recargar (solo para errores no-404) */}
          {!is404 && (
            <button
              onClick={handleReload}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-300 active:scale-95 mt-3"
            >
              <RefreshCcw size={18} />
              <span>Recargar página</span>
            </button>
          )}
        </div>

        {/* Footer informativo */}
        <div className="text-center mt-6 text-slate-400 text-sm">
          {is404 ? (
            <p>¿Necesitas ayuda? Contacta con el soporte técnico</p>
          ) : (
            <p>Si el error persiste, por favor contacta con el administrador</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouterError;