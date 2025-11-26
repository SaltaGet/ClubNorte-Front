import { useEffect, useRef, useState, useCallback } from 'react';

export interface StockProduct {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
  notifier: boolean;
  min_amount: number;
}

export interface ProductNotification {
  id: string;
  productId: number;
  code: string;
  name: string;
  stock: number;
  min_amount: number;
  price: number;
  timestamp: string;
  read: boolean;
  hasChanged: boolean; // Indica si hubo cambio en el stock
}

export const useSSENotifications = (enabled: boolean = true) => {
  const [notifications, setNotifications] = useState<ProductNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectDelayRef = useRef(1000);

  const processProductList = useCallback((products: StockProduct[], timestamp: string) => {
    setNotifications(prev => {
      const updatedList = [...prev];
      const processedProductIds = new Set<number>();

      products.forEach(product => {
        processedProductIds.add(product.id);
        
        // Buscar si el producto ya existe en las notificaciones
        const existingIndex = updatedList.findIndex(n => n.productId === product.id);

        if (existingIndex !== -1) {
          // Producto existe, verificar si cambió el stock
          const existing = updatedList[existingIndex];
          const stockChanged = existing.stock !== product.stock;

          if (stockChanged) {
            // El stock cambió, reactivar la notificación
            const updated: ProductNotification = {
              ...existing,
              stock: product.stock,
              price: product.price,
              min_amount: product.min_amount,
              timestamp,
              read: false, // Marcar como NO LEÍDA porque cambió
              hasChanged: true
            };

            // Mover al inicio de la lista
            updatedList.splice(existingIndex, 1);
            updatedList.unshift(updated);
          } else {
            // El stock NO cambió, solo actualizar datos pero mantener estado de lectura
            updatedList[existingIndex] = {
              ...existing,
              price: product.price,
              min_amount: product.min_amount,
              timestamp,
              hasChanged: false
            };
          }
        } else {
          // Producto NUEVO, crear notificación
          const newNotification: ProductNotification = {
            id: `${product.id}-${timestamp}`,
            productId: product.id,
            code: product.code,
            name: product.name,
            stock: product.stock,
            min_amount: product.min_amount,
            price: product.price,
            timestamp,
            read: false,
            hasChanged: true // Es nuevo, marcarlo como cambio
          };

          // Agregar al inicio
          updatedList.unshift(newNotification);
        }
      });

      // Limitar a 50 notificaciones
      return updatedList.slice(0, 50);
    });
  }, []);

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
          
          const products = data.body?.response?.data || [];
          const timestamp = data.body?.response?.datetime || new Date().toISOString();

          if (products.length > 0) {
            processProductList(products, timestamp);
          }
        } catch (err) {
          console.error('Error parsing notification:', err, event.data);
        }
      };

      eventSource.addEventListener('stock-notification', (event) => {
        try {
          console.log('Evento stock-notification recibido:', event.data);
          const data = JSON.parse(event.data);
          
          if (data.body?.event === 'alert-stock') {
            const products = data.body?.response?.data || [];
            const timestamp = data.body?.response?.datetime || new Date().toISOString();

            if (products.length > 0) {
              processProductList(products, timestamp);
            }
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
  }, [enabled, processProductList, clearReconnectTimeout]);

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
      prev.map(n => n.id === id ? { ...n, read: true, hasChanged: false } : n)
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
    reconnectAttempts: reconnectAttemptsRef.current
  };
};