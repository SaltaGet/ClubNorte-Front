import { useState } from "react";
import useUserStore from "@/store/useUserStore";
import {
  Loader2,
  Package,
  FolderTree,
  Users,
  Box,
  Mail,
  Briefcase,
  Shield,
  Building2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PointSaleCard from "./Cards/PointSaleCard";
import ProductAdmin from "./ProductAdmin";
import CategoryAdmin from "./CategoryAdmin";
import UserAdmin from "./UserAdmin";
import MovementStockAdmin from "./MovementStockAdmin";
import { TooltipInfo } from "@/components/generic/TooltipInfo";
import ModalWelcome from "@/components/generic/ModalWelcome";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const isLoading = useUserStore((state) => state.isLoading);
  const user = useUserStore((state) => state.user);
  const getUserFullName = useUserStore((state) => state.getUserFullName);
  const role = useUserStore((state) => state.getUserRole());
  const isAdmin = useUserStore((state) => state.isUserAdmin());
  const userPointSales = useUserStore((state) => state.getPointSales());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const canAccessAdmin = isAdmin || role === "admin";
  const canAccessStock = isAdmin || role === "admin" || role === "repositor";
  const canAccessProductsAndCategories = isAdmin || role === "admin" || role === "repositor";

  // Scroll al inicio cuando cambia el tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Building2,
      visible: true,
      color: "indigo",
    },
    {
      id: "productos",
      label: "Productos",
      icon: Package,
      visible: canAccessProductsAndCategories,
      color: "indigo",
    },
    {
      id: "categorias",
      label: "Categorías",
      icon: FolderTree,
      visible: canAccessProductsAndCategories,
      color: "indigo",
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: Users,
      visible: canAccessAdmin,
      color: "indigo",
    },
    {
      id: "stock",
      label: "Stock",
      icon: Box,
      visible: canAccessStock,
      color: "emerald",
    },
  ].filter((tab) => tab.visible);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-slate-800/50 border border-slate-700 inline-flex w-auto min-w-full">
              <TabsTrigger
                value="dashboard"
                className="text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
              >
                <Building2 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              {canAccessProductsAndCategories && (
                <TabsTrigger
                  value="productos"
                  className="text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
                >
                  <Package className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Productos</span>
                </TabsTrigger>
              )}
              {canAccessProductsAndCategories && (
                <TabsTrigger
                  value="categorias"
                  className="text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
                >
                  <FolderTree className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Categorías</span>
                </TabsTrigger>
              )}
              {canAccessAdmin && (
                <TabsTrigger
                  value="usuarios"
                  className="text-slate-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
                >
                  <Users className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Usuarios</span>
                </TabsTrigger>
              )}
              {canAccessStock && (
                <TabsTrigger
                  value="stock"
                  className="text-slate-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-white whitespace-nowrap flex-shrink-0"
                >
                  <Box className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Stock</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8">
            {/* HEADER - Bienvenida */}
            <div className="relative bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-transparent backdrop-blur-md rounded-2xl shadow-2xl border-2 border-indigo-500/30 p-6 md:p-8 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 md:w-48 md:h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>

              <div className="relative flex flex-col md:flex-row items-start gap-4 md:gap-6">
                {/* Icono */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 md:p-5 shadow-xl flex-shrink-0">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>

                {/* Texto */}
                <div className="flex-1 w-full">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2 leading-tight">
                    ¡Hola, {getUserFullName()}!
                  </h2>
                  <ModalWelcome />

                  <p className="text-indigo-200 text-base md:text-lg mb-4 md:mb-6">
                    Panel de gestión y control de Puntos de Venta
                  </p>

                  {/* Cards info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                      <Mail className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Email</p>
                        <p className="text-white font-medium text-sm break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                      <Briefcase className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Rol</p>
                        <p className="text-white font-medium text-sm">
                          {user.role?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                      <Shield
                        className={`w-5 h-5 ${
                          user.isAdmin ? "text-yellow-400" : "text-slate-400"
                        }`}
                      />
                      <div>
                        <p className="text-slate-400 text-xs">Admin</p>
                        <p className="text-white font-medium text-sm">
                          {user.isAdmin ? "Sí" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PUNTOS DE VENTA */}
            <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent backdrop-blur-md rounded-2xl shadow-xl border border-emerald-500/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-emerald-600 rounded-xl p-4 shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Puntos de Venta
                  </h3>{" "}
                  <TooltipInfo item="pointSalesAdmin" />
                  <p className="text-emerald-300 text-sm">
                    {userPointSales.length}{" "}
                    {userPointSales.length === 1
                      ? "ubicación asignada"
                      : "ubicaciones asignadas"}
                  </p>
                </div>
              </div>

              {userPointSales.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPointSales.map((pointSale) => (
                    <PointSaleCard key={pointSale.id} pointSale={pointSale} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-800/30 rounded-xl border-2 border-dashed border-emerald-500/30">
                  <Building2 className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg font-medium mb-2">
                    Sin puntos de venta asignados
                  </p>
                  <p className="text-slate-400 text-sm">
                    Contacta al administrador para obtener acceso
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {canAccessProductsAndCategories && (
            <TabsContent value="productos">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-600 rounded-lg p-2">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Productos</h3>{" "}
                    <TooltipInfo item="productAdmin" />
                    <p className="text-slate-300 text-sm">Catálogo completo</p>
                  </div>
                </div>
                <ProductAdmin />
              </div>
            </TabsContent>
          )}

          {canAccessProductsAndCategories && (
            <TabsContent value="categorias">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-600 rounded-lg p-2">
                    <FolderTree className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Categorías
                    </h3>{" "}
                    <TooltipInfo item="categoryAdmin" />
                    <p className="text-slate-300 text-sm">Organización</p>
                  </div>
                </div>
                <CategoryAdmin />
              </div>
            </TabsContent>
          )}

          {canAccessAdmin && (
            <TabsContent value="usuarios">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-600 rounded-lg p-2">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Usuarios</h3>{" "}
                    <TooltipInfo item="userAdmin" />
                    <p className="text-slate-300 text-sm">Accesos y permisos</p>
                  </div>
                </div>
                <UserAdmin />
              </div>
            </TabsContent>
          )}

          {canAccessStock && (
            <TabsContent value="stock">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-500 rounded-lg p-2">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Stock</h3>{" "}
                    <TooltipInfo item="stockAdmin" />
                    <p className="text-slate-300 text-sm">
                      Inventario y movimientos
                    </p>
                  </div>
                </div>
                <MovementStockAdmin />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Tabs flotantes con solo iconos */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const bgColor =
            tab.color === "emerald" ? "bg-emerald-500" : "bg-indigo-600";

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`p-3 rounded-lg shadow-lg transition-all ${
                isActive
                  ? `${bgColor} text-white scale-110`
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;