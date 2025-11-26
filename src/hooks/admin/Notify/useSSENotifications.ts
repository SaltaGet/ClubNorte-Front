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
  const intentionalCloseRef = useRef(false);

  // Función para generar un hash único del contenido del mensaje
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

  // Función para agregar o actualizar notificación
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

  // Limpiar timeout de reconexión
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Función de conexión mejorada con cache busting
  const connect = useCallback(() => {
    if (!enabled) {
      console.log('🔴 SSE: Conexión deshabilitada (enabled=false)');
      return;
    }

    // Limpiar conexión anterior si existe
    if (eventSourceRef.current) {
      console.log('🔄 SSE: Cerrando conexión anterior antes de reconectar');
      intentionalCloseRef.current = true;
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Limpiar timeout anterior
    clearReconnectTimeout();

    // Agregar timestamp para evitar cache y simular no-cache
    const baseUrl = `${import.meta.env.VITE_API_URL}api/v1/notification/alert`;
    const sseUrl = `${baseUrl}?t=${Date.now()}&nocache=true`;

    try {
      console.log(`🔵 SSE: Intentando conectar (intento ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
      console.log(`📡 SSE: URL: ${sseUrl}`);
      
      const eventSource = new EventSource(sseUrl, { 
        withCredentials: true 
      });
      eventSourceRef.current = eventSource;
      intentionalCloseRef.current = false;

      console.log(`⏳ SSE: Estado inicial: ${eventSource.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSED)`);

      // Timeout para detectar si la conexión no se establece
      const connectionTimeout = setTimeout(() => {
        if (eventSource.readyState !== EventSource.OPEN) {
          console.log('⏰ SSE: Timeout de conexión (10s) - La conexión no se estableció');
          console.log(`📊 SSE: Estado al timeout: ${eventSource.readyState}`);
          eventSource.close();
        }
      }, 10000);

      eventSource.onopen = () => {
        console.log('✅ SSE: Conexión establecida exitosamente');
        console.log(`📊 SSE: Estado: ${eventSource.readyState} (OPEN)`);
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setError(null);
        
        // Resetear contador de intentos y delay
        reconnectAttemptsRef.current = 0;
        reconnectDelayRef.current = 1000;
        console.log('🔄 SSE: Contador de reintentos reseteado');
      };

      eventSource.addEventListener('stock-notification', (event) => {
        console.log('📨 SSE: Mensaje recibido (stock-notification)');
        console.log('📦 SSE: Datos:', event.data);
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.body?.event === 'alert-stock') {
            console.log('🔔 SSE: Alerta de stock detectada');
            console.log('📋 SSE: Productos con stock bajo:', data.body.response?.products?.length || 0);
            
            const notification: Notification = {
              id: `${Date.now()}-${Math.random()}`,
              type: 'stock-alert',
              message: data.message || 'Alerta de stock bajo',
              products: data.body.response?.products || [],
              timestamp: data.body.response?.datetime || new Date().toISOString(),
              read: false
            };

            addOrUpdateNotification(notification);
          }
        } catch (err) {
          console.error('❌ SSE: Error parseando notificación:', err);
        }
      });

      eventSource.onerror = (error) => {
        const wasIntentional = intentionalCloseRef.current;
        const currentState = eventSource.readyState;
        
        console.group('🔴 SSE: Error en conexión');
        console.log('📊 Estado de readyState:', currentState, 
          currentState === 0 ? '(CONNECTING)' : 
          currentState === 1 ? '(OPEN)' : 
          '(CLOSED)');
        console.log('🎯 Cierre intencional:', wasIntentional);
        console.log('🔢 Intento actual:', reconnectAttemptsRef.current);
        console.log('📍 Objeto error:', error);
        
        // Detectar razones específicas del cierre
        if (currentState === EventSource.CLOSED) {
          if (wasIntentional) {
            console.log('ℹ️ Razón: Cierre intencional (reconexión programada)');
          } else {
            console.log('⚠️ Razón: Conexión cerrada por el servidor o red');
            console.log('   Posibles causas:');
            console.log('   - Servidor cerró la conexión');
            console.log('   - Timeout de red');
            console.log('   - Error HTTP (401, 403, 500, etc.)');
            console.log('   - Problema de CORS');
          }
        } else if (currentState === EventSource.CONNECTING) {
          console.log('⚠️ Razón: Error durante la conexión inicial');
          console.log('   Posibles causas:');
          console.log('   - Servidor no responde');
          console.log('   - URL incorrecta');
          console.log('   - Problema de red');
        }
        
        console.groupEnd();
        
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        
        // Cerrar la conexión actual
        eventSource.close();
        eventSourceRef.current = null;

        // Solo intentar reconectar si no fue intencional y no hemos excedido el máximo
        if (!wasIntentional && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          
          const currentDelay = Math.min(reconnectDelayRef.current, 30000);
          const message = `Conexión perdida. Reintentando en ${Math.round(currentDelay / 1000)}s... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`;
          setError(message);
          
          console.log(`⏰ SSE: ${message}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 SSE: Ejecutando reconexión programada...`);
            connect();
          }, currentDelay);
          
          // Incrementar el delay para el próximo intento (backoff exponencial)
          reconnectDelayRef.current = Math.min(currentDelay * 1.5, 30000);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          const errorMsg = `No se pudo restablecer la conexión después de ${maxReconnectAttempts} intentos`;
          setError(errorMsg);
          console.error(`❌ SSE: ${errorMsg}`);
        }
        
        intentionalCloseRef.current = false;
      };

    } catch (err) {
      console.error('❌ SSE: Error crítico al inicializar conexión:', err);
      setError('Error al inicializar conexión');
      
      // Intentar reconectar si no hemos alcanzado el máximo
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        console.log(`⏰ SSE: Programando reintento en ${reconnectDelayRef.current}ms`);
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelayRef.current);
      }
    }
  }, [enabled, addOrUpdateNotification, clearReconnectTimeout]);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    console.log('🔄 SSE: Reconexión manual solicitada');
    reconnectAttemptsRef.current = 0;
    reconnectDelayRef.current = 1000;
    connect();
  }, [connect]);

  // Efecto principal
  useEffect(() => {
    console.log('🚀 SSE: Hook inicializado, enabled:', enabled);
    connect();

    // Manejar cambios de visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ SSE: Página visible');
        // Verificar si la conexión está cerrada cuando la página vuelve a ser visible
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          console.log('🔄 SSE: Conexión cerrada detectada al volver a la página, reconectando...');
          reconnect();
        } else {
          console.log('✅ SSE: Conexión activa, no se requiere reconexión');
        }
      } else {
        console.log('👁️ SSE: Página oculta');
      }
    };

    // Verificación periódica del estado de la conexión
    const healthCheck = setInterval(() => {
      if (enabled) {
        const state = eventSourceRef.current?.readyState;
        console.log(`💓 SSE: Health check - Estado: ${state} (${
          state === 0 ? 'CONNECTING' : 
          state === 1 ? 'OPEN' : 
          state === 2 ? 'CLOSED' : 
          'NO_CONNECTION'
        })`);
        
        if (!eventSourceRef.current || state === EventSource.CLOSED) {
          console.log('⚠️ SSE: Health check detectó conexión cerrada, reconectando...');
          reconnect();
        }
      }
    }, 30000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🧹 SSE: Limpiando hook (desmontaje o dependencias cambiaron)');
      clearInterval(healthCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearReconnectTimeout();
      
      if (eventSourceRef.current) {
        console.log('🔴 SSE: Cerrando conexión (cleanup)');
        intentionalCloseRef.current = true;
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