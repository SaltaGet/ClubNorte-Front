import { useState, useEffect } from "react"
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import useUserStore from "@/store/useUserStore"

export default function Home() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  
  // Solo usamos lo que necesitamos del store
  const { 
    login, 
    isAuthenticated, 
    isLoading, 
    error,
    fetchCurrentUser 
  } = useUserStore()

  // Verificar si ya está autenticado al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        // Si el estado dice que está autenticado, verificar con fetchCurrentUser
        await fetchCurrentUser()
        
        // Después de fetchCurrentUser, revisar si sigue autenticado
        const currentAuthState = useUserStore.getState().isAuthenticated
        
        if (currentAuthState) {
          // Si sigue siendo true, navegar a admin
          navigate("/admin")
        }
        // Si cambió a false, no hacemos nada (se queda en login)
      }
    }
    
    checkAuth()
  }, [isAuthenticated, fetchCurrentUser, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    // Validación básica del lado cliente
    if (!email || !password) {
      return // El store manejará este error si es necesario
    }
    
    try {
      await login(email, password)
      // Si el login es exitoso, isAuthenticated se actualizará automáticamente
      // y el useEffect se encargará de redirigir
    } catch (error) {
      // Los errores ya están manejados en el store
      console.error("Error en login:", error)
    }
  }

  // Mostrar loading mientras verifica autenticación inicial o durante login
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>
            {isAuthenticated ? "Verificando sesión..." : "Iniciando sesión..."}
          </span>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar nada (el useEffect redirige)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Bienvenido</h1>
        <p className="text-center text-slate-300 mb-8">
          Inicia sesión para continuar
        </p>

        {/* Mensaje de error del store */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@ejemplo.com"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Extra */}
        <p className="text-center text-slate-400 text-sm mt-6">
          <a 
            href="#" 
            className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              if (isLoading) {
                e.preventDefault()
              } else {
                e.preventDefault()
                // Aquí podrías abrir un modal o navegar a la página de recuperación
                console.log("Recuperar contraseña")
              }
            }}
          >
          </a>
        </p>
      </div>
    </div>
  )
}