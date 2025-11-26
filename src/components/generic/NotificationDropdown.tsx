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
          className="bg-slate-700 border-slate-500 hover:bg-slate-600 text-white relative"
        >
          <div className="flex items-center gap-1">
            {unreadCount > 0 ? (
              <BellRing size={18} className="text-yellow-400" />
            ) : (
              <Bell size={18} />
            )}
            
            {isConnected ? (
              <Wifi size={12} className="text-green-400" />
            ) : (
              <WifiOff size={12} className="text-red-400" />
            )}
          </div>
          
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[95vw] sm:w-96 max-w-md bg-slate-800 border-slate-600">
        <DropdownMenuLabel className="text-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sticky top-0 bg-slate-800 z-10 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm sm:text-base">Stock Bajo</span>
            {isConnected ? (
              <Badge className="bg-green-600 text-white text-[10px] sm:text-xs px-2 py-0.5">
                Conectado
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white text-[10px] sm:text-xs px-2 py-0.5">
                Desconectado
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
            {!isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reconnect}
                className="text-xs text-slate-400 hover:text-white h-auto p-1.5 sm:p-1 touch-manipulation"
                title="Reconectar"
              >
                <RefreshCw size={16} className="sm:w-3.5 sm:h-3.5" />
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-white h-auto px-2 py-1.5 sm:p-1 touch-manipulation"
              >
                Limpiar
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-600" />
        
        {error && (
          <div className="p-3 mx-2 mb-2 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            <div className="flex flex-col items-center gap-2">
              <Bell size={32} className="text-slate-500" />
              <span>No hay alertas de stock</span>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-3 rounded-lg transition-all relative group
                    ${notification.read 
                      ? 'bg-slate-700/50 hover:bg-slate-700' 
                      : 'bg-slate-700 hover:bg-slate-600 border-l-2 border-red-500'
                    }
                    ${notification.hasChanged && !notification.read ? 'animate-pulse' : ''}
                  `}
                >
                  {/* Botón X para eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-600 hover:bg-red-600 rounded-full p-1"
                    title="Eliminar notificación"
                  >
                    <X size={14} className="text-white" />
                  </button>

                  <div 
                    onClick={() => markAsRead(notification.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {notification.hasChanged && !notification.read && (
                          <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 flex items-center gap-1">
                            <TrendingDown size={10} />
                            CAMBIÓ
                          </Badge>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">
                          {notification.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Código: {notification.code}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
  <Badge className="bg-red-500 text-white text-xs sm:text-sm px-2 py-1">
    <span className="opacity-90">Depósito:</span>
    <span className="text-base sm:text-lg font-bold mx-1">{notification.stock}</span>
    <span className="opacity-90">unid.</span>
  </Badge>
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