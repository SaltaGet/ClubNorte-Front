import { useState, useEffect } from "react";
import { User, X, Circle, Menu, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import usePointSaleStore from "@/store/usePointSaleStore";
import useUserStore from "@/store/useUserStore";

// Importar módulos
import { pointSaleConfig, getAllActions } from "./pointSaleConfig";
import Sidebar from "./Sidebar";

const PointSale = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    login,
    logout,
    isAuthenticated,
    isLoading,
    error,
  } = usePointSaleStore();

  // Obtener información del usuario del store
  const { 
    user, 
    getUserFullName, 
    getUserRole,
    fetchCurrentUser,
    isAuthenticated: userIsAuthenticated
  } = useUserStore();

  // Estados locales
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [disclosuresOpen, setDisclosuresOpen] = useState<
    Record<string, boolean>
  >({});

  // Login automático cuando hay un ID en los params
  useEffect(() => {
    if (id) {
      login(Number(id), "");
    }
  }, [id, login]);

  // Intentar obtener datos del usuario si no los tenemos
  useEffect(() => {
    if (!user && userIsAuthenticated) {
      fetchCurrentUser();
    }
  }, [user, userIsAuthenticated, fetchCurrentUser]);

  // Debug - para ver qué datos tenemos
  useEffect(() => {
    console.log('User data:', { user, userIsAuthenticated, fullName: getUserFullName(), role: getUserRole() });
  }, [user, userIsAuthenticated, getUserFullName, getUserRole]);

  // Obtener todas las acciones y la acción seleccionada
  const allActions = getAllActions(pointSaleConfig);
  const selectedAction = allActions.find((a) => a.id === selectedActionId);

  // Inicialización: seleccionar primera acción y abrir primer disclosure
  useEffect(() => {
    if (allActions.length > 0) {
      setSelectedActionId(allActions[0].id);
      const firstModelId = pointSaleConfig.sections[0]?.models[0]?.id;
      if (firstModelId) {
        setDisclosuresOpen({ [firstModelId]: true });
      }
    }
  }, []);

  // Handlers
  const toggleDisclosure = (modelId: string) => {
    setDisclosuresOpen((prev) => ({
      ...prev,
      [modelId]: !prev[modelId],
    }));
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedActionId(actionId);
    // Cerrar sidebar en móvil/tablet
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  // Estados de carga y error - Mejorados
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-6 px-4">
          <div className="relative inline-block">
            {/* Spinner principal */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-600 border-t-transparent"></div>
            {/* Efecto glow */}
            <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-2xl animate-pulse"></div>
            {/* Spinner secundario */}
            <div className="absolute inset-2 animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-bold">Cargando punto de venta</p>
            <p className="text-slate-400 text-sm">Preparando tu espacio de trabajo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative mb-6 inline-block">
            <div className="bg-red-500/10 rounded-2xl p-5 backdrop-blur-sm">
              <X className="w-12 h-12 text-red-400" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-2xl -z-10"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Error de conexión</h3>
          <p className="mb-8 text-red-300 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95"
          >
            Volver al Admin
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative mb-6 inline-block">
            <div className="bg-yellow-500/10 rounded-2xl p-5 backdrop-blur-sm">
              <User className="w-12 h-12 text-yellow-400" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-2xl -z-10"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Acceso denegado</h3>
          <p className="mb-8 text-slate-300 text-sm leading-relaxed">No se pudo iniciar sesión en el punto de venta.</p>
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95"
          >
            Volver al Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <Sidebar
        config={pointSaleConfig}
        selectedActionId={selectedActionId}
        sidebarOpen={sidebarOpen}
        disclosuresOpen={disclosuresOpen}
        onActionSelect={handleActionSelect}
        onToggleDisclosure={toggleDisclosure}
        onToggleSidebar={handleToggleSidebar}
        onLogout={handleLogout}
        selectedAction={selectedAction}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header mejorado y responsivo */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-30">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Botón hamburguesa + Breadcrumb */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {/* Botón hamburguesa solo en móvil/tablet */}
                <button
                  onClick={handleToggleSidebar}
                  className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white transition-all duration-200 active:scale-95 flex-shrink-0"
                  aria-label="Toggle menu"
                >
                  <Menu size={18} />
                </button>

                {/* Breadcrumb mejorado */}
                <div className="min-w-0 flex-1">
                  {selectedAction ? (
                    <div className="space-y-1">
                      {/* Breadcrumb - ocultar en móvil pequeño */}
                      <div className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400">
                        <span className="truncate">{selectedAction.sectionName}</span>
                        <ChevronRight size={12} className="flex-shrink-0" />
                        <span className="truncate">{selectedAction.modelName}</span>
                      </div>
                      {/* Título */}
                      <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-white truncate">
                        {selectedAction.name}
                      </h2>
                    </div>
                  ) : (
                    <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-white">
                      Panel de Control
                    </h2>
                  )}
                </div>
              </div>
              
              {/* Sección derecha - Usuario + Estado */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                {/* Indicador de estado - adaptativo */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500/10 backdrop-blur-lg rounded-full px-2 sm:px-3 py-1 sm:py-1.5 border border-emerald-500/20">
                  <Circle className="h-1.5 w-1.5 sm:h-2 sm:w-2 fill-emerald-400 text-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="hidden xs:inline text-[10px] sm:text-xs font-medium text-emerald-400">En línea</span>
                </div>
                
                {/* Card del usuario mejorada y responsiva */}
                {user ? (
                  <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/10 backdrop-blur-lg rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 hover:bg-white/15 transition-all duration-200">
                    <div className="relative flex-shrink-0">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-1.5 sm:p-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-3 sm:w-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="hidden md:block text-right min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">
                        {getUserFullName() || 'Usuario'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                        {getUserRole() || 'Sin rol'}
                      </p>
                    </div>
                  </div>
                ) : userIsAuthenticated ? (
                  <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/10 backdrop-blur-lg rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-yellow-500/20">
                    <div className="bg-yellow-500/20 rounded-full p-1.5 sm:p-2 animate-pulse flex-shrink-0">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        Cargando...
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400">
                        Obteniendo datos
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/10 backdrop-blur-lg rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 opacity-60">
                    <div className="bg-slate-600/50 rounded-full p-1.5 sm:p-2 flex-shrink-0">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-xs sm:text-sm font-semibold text-slate-300">
                        No autenticado
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400">
                        Sin sesión
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Panel de contenido mejorado y responsivo */}
        <main className="flex-1 overflow-hidden p-2 sm:p-4 lg:p-6">
          {selectedAction ? (
            <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="h-full overflow-y-auto">
                <selectedAction.component />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
                  {/* Icono con efecto glow */}
                  <div className="relative mb-6 inline-block">
                    <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl lg:rounded-3xl p-6 sm:p-8">
                      <User className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl lg:rounded-3xl blur-2xl"></div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Bienvenido al Panel
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 mb-6 sm:mb-8">
                    Selecciona una acción del menú lateral para comenzar
                  </p>
                  
                  {/* Botón para móvil/tablet */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden w-full px-6 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95 text-sm sm:text-base"
                  >
                    Abrir Menú
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PointSale;