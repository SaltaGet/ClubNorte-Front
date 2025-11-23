import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomeCard } from "./IncomeCard"
import useUserStore from "@/store/useUserStore"
import DeleteIncomeComponent from "./DeleteIncomeComponent"
import { Eye, Trash2 } from "lucide-react"

type IncomeActionsProps = {
  id: number
  incomeName?: string
  onDeleteSuccess?: () => void
}

const IncomeActions: React.FC<IncomeActionsProps> = ({
  id,
  incomeName,
  onDeleteSuccess
}) => {
  const { isUserAdmin, getUserRole } = useUserStore()
  
  // Chequeo de permisos
  const canDelete = isUserAdmin() || getUserRole() === "admin"
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Tabs defaultValue="detalle" className="w-full">
        <TabsList
          className={`grid w-full ${
            canDelete ? "grid-cols-2" : "grid-cols-1"
          } bg-slate-800/80 rounded-lg mb-4 p-1 border border-slate-700/50`}
        >
          <TabsTrigger
            value="detalle"
            className="flex items-center justify-center gap-2 text-slate-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md transition-all text-sm font-medium py-2"
          >
            <Eye className="w-4 h-4" />
            <span>Detalle</span>
          </TabsTrigger>
          
          {canDelete && (
            <TabsTrigger
              value="eliminar"
              className="flex items-center justify-center gap-2 text-slate-300 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md transition-all text-sm font-medium py-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="detalle" className="mt-0">
          <IncomeCard id={id} />
        </TabsContent>

        {canDelete && (
          <TabsContent value="eliminar" className="mt-0">
            <DeleteIncomeComponent
              incomeId={id}
              incomeName={incomeName}
              onDeleteSuccess={onDeleteSuccess}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default IncomeActions