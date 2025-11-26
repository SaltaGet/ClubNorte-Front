import { Bell, BellRing, Wifi, WifiOff, RefreshCw, TrendingDown, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSSENotifications } from '@/hooks/admin/Notify/useSSENotifications'

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    clearAll,
    markAsRead,
    removeNotification,
    isConnected,
    error,
    reconnect
  } = useSSENotifications()

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white relative h-9 px-3 shadow-sm transition-colors"
        >
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellRing size={18} className="text-yellow-400" />
            ) : (
              <Bell size={18} className="text-slate-300" />
            )}
            
            {isConnected ? (
              <Wifi size={14} className="text-green-400" />
            ) : (
              <WifiOff size={14} className="text-red-400" />
            )}
          </div>
          
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] flex items-center justify-center px-1 bg-red-600 hover:bg-red-600 text-white text-[10px] font-semibold border-2 border-slate-900"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[95vw] sm:w-96 max-w-md bg-slate-800 border-slate-600 shadow-xl" align="end">
        <DropdownMenuLabel className="text-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sticky top-0 bg-slate-800 z-10 pb-3 pt-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-semibold">Alertas de Stock</span>
            {isConnected ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs px-2 py-0.5 font-medium">
                En línea
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs px-2 py-0.5 font-medium">
                Desconectado
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            {!isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reconnect}
                className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 px-2 transition-colors"
                title="Reconectar"
              >
                <RefreshCw size={16} />
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 px-3 text-xs transition-colors"
              >
                Limpiar todo
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        {error && (
          <div className="p-3 mx-2 mb-2 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
                <Bell size={28} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Sin alertas</p>
                <p className="text-xs text-slate-500 mt-1">No hay productos con stock bajo</p>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-3.5 rounded-lg transition-all relative group border
                    ${notification.read 
                      ? 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-700' 
                      : 'bg-slate-700/60 hover:bg-slate-700/80 border-red-500/30 shadow-sm'
                    }
                  `}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-600/80 hover:bg-red-600 rounded-full p-1 shadow-sm"
                    title="Eliminar notificación"
                  >
                    <X size={12} className="text-white" />
                  </button>

                  <div 
                    onClick={() => markAsRead(notification.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2.5 pr-7">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {notification.hasChanged && !notification.read && (
                          <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] px-1.5 py-0 flex items-center gap-1">
                            <TrendingDown size={10} />
                            CAMBIÓ
                          </Badge>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {notification.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Código: <span className="font-mono">{notification.code}</span>
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end flex-shrink-0">
                        <Badge className="bg-red-500/90 hover:bg-red-500/90 text-white text-xs whitespace-nowrap px-2.5 py-1 shadow-sm">
                          <span className="font-bold text-base">{notification.stock}</span>
                          <span className="ml-1 opacity-90">unid.</span>
                        </Badge>
                        <span className="text-[10px] text-slate-500 mt-1">en depósito</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown