import { Package } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Información del cliente */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-lg p-2">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-white font-semibold">ClubNorte</p>
              <p className="text-slate-300 text-sm">Sistema de Gestión de Stock</p>
            </div>
          </div>

          {/* Créditos */}
          <div className="text-center md:text-right">
            <p className="text-slate-300 text-sm">
              Desarrollado por{' '}
              <a 
                href="https://saltaget.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-all duration-300"
              >
                SaltaGet
              </a>
            </p>
            <p className="text-slate-400 text-xs mt-1">
              © {new Date().getFullYear()} - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer