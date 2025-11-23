import { useState } from "react";
import { Users, UserPlus, ChevronLeft } from "lucide-react";
import FormCreateUser from "./User/FromCreateUser";
import TableUsers from "./User/TableUser";

const UserAdmin = () => {
  const [activeView, setActiveView] = useState<
    "selection" | "listar" | "crear"
  >("selection");

  const handleBack = () => setActiveView("selection");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-8">

      {/* SELECCIÓN */}
      {activeView === "selection" && (
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Gestión de Usuarios
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Selecciona la acción que deseas realizar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

            {/* LISTAR */}
            <button
              onClick={() => setActiveView("listar")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 sm:p-8 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md"></div>
                  <div className="relative bg-indigo-600 rounded-full p-4 sm:p-5 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                    Listar Usuarios
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Consulta, edita y administra todos los usuarios
                  </p>
                </div>
              </div>
            </button>

            {/* CREAR */}
            <button
              onClick={() => setActiveView("crear")}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6 sm:p-8 hover:border-emerald-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-emerald-500/20"
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-md"></div>
                  <div className="relative bg-emerald-500 rounded-full p-4 sm:p-5 group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
                    Crear Usuario
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Añade un nuevo usuario al sistema
                  </p>
                </div>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* LISTAR */}
      {activeView === "listar" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">

            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Listar Usuarios
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Administra todos los usuarios del sistema
                </p>
              </div>
            </div>

            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl">
            <TableUsers />
          </div>
        </div>
      )}

      {/* CREAR */}
      {activeView === "crear" && (
        <div className="space-y-4">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">

            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-lg p-2">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Crear Usuario
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Añade un nuevo usuario al sistema
                </p>
              </div>
            </div>

            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>
          </div>

          <FormCreateUser />
        </div>
      )}

    </div>
  );
};

export default UserAdmin;
