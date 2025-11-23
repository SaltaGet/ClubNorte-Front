import { LogOut, User, Loader2, Settings, FileText, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useUserStore from "@/store/useUserStore";
import NotificationDropdown from "../generic/NotificationDropdown";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados del store
  const { logout, isLoading, user, getUserFullName, isUserAdmin, getUserRole } = useUserStore();

  // Si está en "/" (login) o en rutas que empiecen con "/point-sale/", no mostrar el header
  if (location.pathname === "/" || location.pathname.startsWith("/point-sale/"))
    return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error en logout:", error);
      navigate("/");
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleReports = () => {
    navigate("/reports");
  };

  const handleHome = () => {
    navigate("/");
  };

  // Verificar si el usuario es administrador
  const isAdmin = isUserAdmin() || getUserRole()?.toLowerCase() === "admin";

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-xl border-b border-white/20 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          {/* Logo/Título con info del usuario - Mejorado */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 lg:flex-none">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <User className="text-white" size={18} />
            </div>
            <div className="min-w-0 flex-1 lg:flex-none">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-white truncate">
                Panel de Control
              </h1>
              {user && (
                <p className="text-[10px] sm:text-xs text-slate-300 truncate">
                  {getUserFullName()} • <span className="text-emerald-400">{user.role?.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción - Responsivo */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Botón de Inicio - Compacto en móvil */}
            {location.pathname !== "/" && (
              <Button
                onClick={handleHome}
                size="sm"
                className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 px-2 sm:px-3"
              >
                <Home size={16} className="sm:mr-1.5" />
                <span className="hidden sm:inline text-xs sm:text-sm">Inicio</span>
              </Button>
            )}

            {/* Botón de Informes - Solo admins, compacto en móvil */}
            {isAdmin && (
              <Button
                onClick={handleReports}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-blue-500/50 hover:border-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 active:scale-95 px-2 sm:px-3"
              >
                <FileText size={16} className="sm:mr-1.5" />
                <span className="hidden sm:inline text-xs sm:text-sm">Informes</span>
              </Button>
            )}

            {/* Notificaciones */}
            <NotificationDropdown />

            {/* Dropdown de Configuración - Mejorado */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 p-2"
                >
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl mt-2 animate-in slide-in-from-top-2 duration-200"
              >
                {/* Info del usuario en el dropdown */}
                <div className="px-3 py-2.5 border-b border-white/10">
                  <p className="text-sm font-semibold text-white truncate">
                    {getUserFullName()}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <DropdownMenuItem
                  onClick={handleChangePassword}
                  className="text-slate-200 hover:bg-white/10 hover:text-white cursor-pointer transition-colors duration-150 my-1 mx-1 rounded-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20">
                      <Settings className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="font-medium">Cambiar Contraseña</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10 my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer transition-colors duration-150 my-1 mx-1 rounded-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-red-500/20">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 text-red-400 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <span className="font-medium">
                      {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;