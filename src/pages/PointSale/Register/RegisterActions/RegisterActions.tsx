import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useUserStore from "@/store/useUserStore"
import RegisterDetailCard from "./RegisterDetailCardProps"
import RegisterTransactions from "./RegisterTransactions"
import { FileText, DollarSign } from "lucide-react"

type RegisterActionsProps = {
  id: number
}

const RegisterActions: React.FC<RegisterActionsProps> = ({ id }) => {
  const { isUserAdmin, getUserRole } = useUserStore()
  
  // Chequeo de permisos
  const canViewTransactions = isUserAdmin() || getUserRole() === "admin"
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Tabs defaultValue="detalle" className="w-full">
        <TabsList
          className={`grid w-full ${
            canViewTransactions ? "grid-cols-2" : "grid-cols-1"
          } bg-slate-800/80 rounded-lg mb-4 p-1 border border-slate-700/50`}
        >
          <TabsTrigger
            value="detalle"
            className="flex items-center justify-center gap-2 text-slate-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md transition-all text-sm font-medium py-2"
          >
            <FileText className="w-4 h-4" />
            <span>Detalle</span>
          </TabsTrigger>
          
          {canViewTransactions && (
            <TabsTrigger
              value="transacciones"
              className="flex items-center justify-center gap-2 text-slate-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md transition-all text-sm font-medium py-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Transacciones</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="detalle" className="mt-0">
          <RegisterDetailCard id={id} />
        </TabsContent>

        {canViewTransactions && (
          <TabsContent value="transacciones" className="mt-0">
            <RegisterTransactions id={id} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default RegisterActions