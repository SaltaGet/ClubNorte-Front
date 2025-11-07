import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, DollarSign, Trash2 } from "lucide-react"
import useUserStore from "@/store/useUserStore"
import IncomeSportCourtDetailCard from "./IncomeSportCourtDetailCard"
import IncomeSportCourtConfirmPayment from "./IncomeSportCourtConfirmPayment"
import DeleteIncomeSportCourt from "./DeleteIncomeSportCourt"
import { useGetIncomeSportCourtById } from "@/hooks/pointSale/IncomeSportCourt/useGetIncomeSportCourtById"
import SuccessMessage from "@/components/generic/SuccessMessage"

type IncomeSportCourtActionsProps = {
  id: number
}

const IncomeSportCourtActions: React.FC<IncomeSportCourtActionsProps> = ({ id }) => {
  const { isUserAdmin, getUserRole } = useUserStore()
  const { incomeSportCourt } = useGetIncomeSportCourtById(id)

  // Chequeo de permisos
  const isAdmin = isUserAdmin() || getUserRole() === "admin"
  const isVendedor = getUserRole() === "vendedor"
  const canConfirmPayment = isAdmin || isVendedor

  // Verificar si el pago está completo
  const isPaymentComplete = incomeSportCourt?.date_rest_pay !== null

  // Determinar cantidad de tabs según permisos
  const getGridCols = () => {
    if (isAdmin) return "grid-cols-3" // Admin ve los 3 tabs
    if (isVendedor) return "grid-cols-2" // Vendedor ve detalle y confirmar pago
    return "grid-cols-1" // Usuario normal solo ve detalle
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6">
        <Tabs defaultValue="detalle" className="w-full">
          <TabsList
            className={`grid w-full ${getGridCols()} bg-slate-800/50 rounded-xl mb-6 border border-slate-700`}
          >
            <TabsTrigger
              value="detalle"
              className="text-slate-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Detalle
            </TabsTrigger>

            {canConfirmPayment && (
              <TabsTrigger
                value="confirmar-pago"
                className="text-slate-300 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Confirmar Pago
              </TabsTrigger>
            )}

            {isAdmin && (
              <TabsTrigger
                value="eliminar"
                className="text-slate-300 data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="detalle">
            <IncomeSportCourtDetailCard id={id} />
          </TabsContent>

          {canConfirmPayment && (
            <TabsContent value="confirmar-pago">
              {isPaymentComplete ? (
                <SuccessMessage
                  title="Pago Completado"
                  description="El pago restante ya fue abonado."
                  primaryButton={{
                    text: "Ver Detalle",
                    onClick: () => {
                      // Cambiar al tab de detalle
                      const detalleTab = document.querySelector('[value="detalle"]') as HTMLButtonElement;
                      detalleTab?.click();
                    },
                    variant: "indigo"
                  }}
                />
              ) : (
                <IncomeSportCourtConfirmPayment id={id} />
              )}
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="eliminar">
              <DeleteIncomeSportCourt incomeSportCourtId={id} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default IncomeSportCourtActions