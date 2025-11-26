import { useEffect, useRef, useState, useCallback } from 'react';

export interface StockProduct {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  min_amount: number;
}

export interface Notification {
  id: string;
  type: 'stock-alert';
  message: string;
  products: StockProduct[];
  timestamp: string;
  read: boolean;
}

export const useSSENotifications = (enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectDelayRef = useRef(1000);

  const generateMessageHash = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const content = {
      type: notification.type,
      message: notification.message,
      products: notification.products
        ?.map(p => ({ 
          id: p.id, 
          code: p.code, 
          name: p.name, 
          stock: p.stock, 
          min_amount: p.min_amount 
        }))
        .sort((a, b) => a.id - b.id)
    };
    return JSON.stringify(content);
  }, []);

  const addOrUpdateNotification = useCallback((newNotification: Notification) => {
    const messageHash = generateMessageHash(newNotification);
    
    setNotifications(prev => {
      const existingIndex = prev.findIndex(notification => {
        const existingHash = generateMessageHash(notification);
        return existingHash === messageHash;
      });

      if (existingIndex !== -1) {
        const updatedNotifications = [...prev];
        const existingNotification = updatedNotifications[existingIndex];
        
        const updatedNotification = {
          ...existingNotification,
          timestamp: newNotification.timestamp,
          products: newNotification.products,
          read: false
        };
        
        updatedNotifications.splice(existingIndex, 1);
        updatedNotifications.unshift(updatedNotification);
        
        return updatedNotifications;
      } else {
        return [newNotification, ...prev.slice(0, 49)];
      }
    });
  }, [generateMessageHash]);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    clearReconnectTimeout();

    const sseUrl = `${import.meta.env.VITE_API_URL}api/v1/notification/alert`;

    try {
      console.log(`Intentando conectar SSE (intento ${reconnectAttemptsRef.current + 1})...`);
      const eventSource = new EventSource(sseUrl, { 
        withCredentials: true 
      });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE conectado exitosamente');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        reconnectDelayRef.current = 1000;
      };

      eventSource.onmessage = (event) => {
        try {
          console.log('Mensaje SSE recibido:', event.data);
          const data = JSON.parse(event.data);
          
          const notification: Notification = {
            id: `${Date.now()}-${Math.random()}`,
            type: 'stock-alert',
            message: data.message || 'Alerta de stock bajo',
            products: data.body?.response?.products || data.products || [],
            timestamp: data.body?.response?.datetime || data.datetime || new Date().toISOString(),
            read: false
          };

          addOrUpdateNotification(notification);
        } catch (err) {
          console.error('Error parsing notification:', err, event.data);
        }
      };

      eventSource.addEventListener('stock-notification', (event) => {
        try {
          console.log('Evento stock-notification recibido:', event.data);
          const data = JSON.parse(event.data);
          
          if (data.body?.event === 'alert-stock' || data.event === 'alert-stock') {
            const notification: Notification = {
              id: `${Date.now()}-${Math.random()}`,
              type: 'stock-alert',
              message: data.message || 'Alerta de stock bajo',
              products: data.body?.response?.products || data.products || [],
              timestamp: data.body?.response?.datetime || data.datetime || new Date().toISOString(),
              read: false
            };

            addOrUpdateNotification(notification);
          }
        } catch (err) {
          console.error('Error parsing stock-notification:', err);
        }
      });

      eventSource.onerror = (error) => {
        console.log('Error en conexión SSE:', error);
        setIsConnected(false);
        
        eventSource.close();
        eventSourceRef.current = null;

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          
          const currentDelay = Math.min(reconnectDelayRef.current, 30000);
          setError(`Conexión perdida. Reintentando en ${Math.round(currentDelay / 1000)}s... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reintentando conexión SSE (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
            connect();
          }, currentDelay);
          
          reconnectDelayRef.current = Math.min(currentDelay * 1.5, 30000);
        } else {
          setError(`No se pudo restablecer la conexión después de ${maxReconnectAttempts} intentos`);
          console.error('Máximo de intentos de reconexión alcanzado');
        }
      };

    } catch (err) {
      setError('Error al inicializar conexión');
      console.error('Error al conectar:', err);
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelayRef.current);
      }
    }
  }, [enabled, addOrUpdateNotification, clearReconnectTimeout]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    reconnectDelayRef.current = 1000;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          console.log('Página visible y conexión cerrada, reconectando...');
          reconnect();
        }
      }
    };

    const healthCheck = setInterval(() => {
      if (enabled && (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED)) {
        console.log('Health check: conexión cerrada, intentando reconectar...');
        reconnect();
      }
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(healthCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearReconnectTimeout();
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, connect, reconnect, clearReconnectTimeout]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    isConnected,
    error,
    markAsRead,
    removeNotification,
    clearAll,
    reconnect,
    unreadCount: notifications.filter(n => !n.read).length,
    lowStockProducts: notifications.flatMap(n => n.products),
    reconnectAttempts: reconnectAttemptsRef.current
  };
};