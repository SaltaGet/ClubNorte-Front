import TableProductPointSale from './TableProductPointSale'
import MovementStockAdmin from '@/pages/Admin/MovementStockAdmin'
import useUserStore from '@/store/useUserStore'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, Package } from "lucide-react"
import { useState } from "react"

const ViewProductPointSale = () => {
  const { isUserAdmin, getUserRole } = useUserStore()
  const [isOpen, setIsOpen] = useState(false)
  
  // Verificar si el usuario tiene permisos
  const userRole = getUserRole()
  const hasPermission = isUserAdmin() || userRole === "admin" || userRole === "repositor"

  return (
    <div className="space-y-8">
      {/* Sección principal de productos */}
      <TableProductPointSale />
      
      {/* Sección de administración de stock (solo con permisos) */}
      {hasPermission && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-6 py-4 rounded-xl border-2 border-slate-700 bg-slate-800/80 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20 group">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-lg p-2 group-hover:scale-110 transition-all duration-300">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">Administrar Stock</h3>
                <p className="text-slate-300 text-sm">Gestiona los movimientos de inventario</p>
              </div>
            </div>
            <ChevronDown
              className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 animate-in fade-in-50 slide-in-from-top-2 duration-300">
              <MovementStockAdmin />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}

export default ViewProductPointSale