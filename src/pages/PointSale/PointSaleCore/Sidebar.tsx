import { type ReactNode } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import usePointSaleStore from "@/store/usePointSaleStore";
import useUserStore from "@/store/useUserStore";
import type { PointSaleConfig } from "./pointSaleConfig";
import { usePointSaleById } from "@/hooks/pointSale/usePointSaleById";
import { filterConfigByRole } from "./pointSaleConfig";

interface MenuButtonProps {
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
  variant?: "model" | "action" | "utility";
}

interface SidebarProps {
  config: PointSaleConfig;
  selectedActionId: string | null;
  sidebarOpen: boolean;
  disclosuresOpen: Record<string, boolean>;
  onActionSelect: (actionId: string) => void;
  onToggleDisclosure: (modelId: string) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  selectedAction?: {
    id: string;
    name: string;
    modelName: string;
    sectionName: string;
  } | null;
}

const MenuButton = ({
  onClick,
  children,
  active = false,
  className = "",
  variant = "action",
}: MenuButtonProps) => {
  const baseClasses = "flex items-center w-full font-medium rounded-lg transition-all duration-200";
  
  const variantClasses = {
    model: active
      ? "px-3 py-2.5 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30"
      : "px-3 py-2.5 text-slate-300 hover:bg-white/10 hover:text-white active:scale-95",
    action: active
      ? "px-3 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
      : "px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 active:scale-95",
    utility: "px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white active:scale-95"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Sidebar = ({
  config,
  selectedActionId,
  sidebarOpen,
  disclosuresOpen,
  onActionSelect,
  onToggleDisclosure,
  onToggleSidebar,
  onLogout,
  selectedAction,
}: SidebarProps) => {
  const { currentPointSaleId } = usePointSaleStore();
  
  const role = useUserStore((state) => state.getUserRole());
  const isSuperAdmin = useUserStore((state) => state.isUserAdmin());
  
  const {
    pointSale,
    isLoading: isPointSaleLoading,
  } = usePointSaleById(currentPointSaleId || 0);

  const filteredConfig = (isSuperAdmin || role === "admin") ? config : filterConfigByRole(config, role ?? undefined);

  const handleActionSelect = (actionId: string) => {
    onActionSelect(actionId);
    // Cerrar sidebar en móvil/tablet después de seleccionar una acción
    if (window.innerWidth < 1024) {
      onToggleSidebar();
    }
  };

  const getDisplayTitle = () => {
    if (isPointSaleLoading) {
      return "Cargando...";
    }
    return pointSale?.name || "Punto de venta";
  };

  return (
    <>
      {/* Botón de menú hamburguesa - Mejorado */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/60 active:scale-90 transition-all duration-200"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay oscuro para móvil/tablet */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 animate-in fade-in duration-200"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } 
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-80 bg-slate-900/95 lg:bg-white/10 backdrop-blur-xl border-r border-white/20 text-slate-300 flex flex-col transition-transform duration-300 ease-out shadow-2xl`}
      >
        {/* Header del sidebar - Compacto */}
        <div className="p-4 border-b border-white/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
          <div className="flex items-center gap-2 mb-1">
            {isPointSaleLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-400 border-t-transparent"></div>
            )}
            <h1 className="text-lg lg:text-xl font-bold text-white truncate">
              {getDisplayTitle()}
            </h1>
          </div>
          <p className="text-xs text-slate-400">Gestión de punto de venta</p>
        </div>

        {/* Navegación con scroll */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {filteredConfig.sections.map((section) => (
            <div key={section.id} className="space-y-2">
              {/* Título de sección - Más compacto */}
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent flex-1"></div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {section.name}
                </h2>
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent flex-1"></div>
              </div>

              {section.models.map((model) => (
                <div key={model.id} className="space-y-1">
                  {/* Botón de modelo */}
                  <MenuButton
                    onClick={() => onToggleDisclosure(model.id)}
                    active={selectedAction?.modelName === model.name}
                    variant="model"
                    className="justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors flex-shrink-0">
                        <model.icon className={`h-4 w-4 ${model.color || "text-slate-400"}`} />
                      </div>
                      <span className="font-semibold text-sm truncate">{model.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 flex-shrink-0 ${
                        disclosuresOpen[model.id] ? "rotate-180" : ""
                      }`}
                    />
                  </MenuButton>

                  {/* Acciones del modelo */}
                  {disclosuresOpen[model.id] && (
                    <div className="ml-2 pl-3 border-l-2 border-indigo-500/30 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                      {model.actions.map((action) => (
                        <MenuButton
                          key={action.id}
                          onClick={() => handleActionSelect(action.id)}
                          active={selectedActionId === action.id}
                          variant="action"
                          className="group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors flex-shrink-0">
                              <action.icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-normal truncate">{action.name}</span>
                          </div>
                        </MenuButton>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer - Solo botón de salir */}
        <div className="p-3 border-t border-white/20 bg-slate-900/50">
          <MenuButton 
            onClick={onLogout} 
            variant="utility"
            className="group hover:bg-red-500/10 hover:text-red-400"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="h-4 w-4 text-red-400" />
              </div>
              <span className="font-medium">Cerrar Sesión</span>
            </div>
          </MenuButton>
        </div>
      </div>
    </>
  );
};

export default Sidebar;