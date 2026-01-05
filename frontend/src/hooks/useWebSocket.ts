import { useEffect, useRef, useState, useCallback } from 'react';

interface SeatStatusUpdate {
  seatId: string;
  status: 'available' | 'reserved' | 'sold' | 'held';
}

interface UseWebSocketOptions {
  url?: string;
  onSeatUpdate?: (update: SeatStatusUpdate) => void;
  enabled?: boolean;
}

export function useWebSocket({ 
  url = 'ws://localhost:3001', 
  onSeatUpdate,
  enabled = false // Changed to false by default since no server is running
}: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    // Stop trying after max attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('WebSocket: Max reconnection attempts reached. WebSocket disabled.');
      return;
    }

    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset on successful connection
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'seat-update' && onSeatUpdate) {
            onSeatUpdate(data.payload);
          }
        } catch (error) {
          console.error('WebSocket: Error parsing message:', error);
        }
      };

      ws.onerror = () => {
        // Silent on error - only log on close
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        
        reconnectAttemptsRef.current += 1;
        
        if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          const delay = Math.min(2000 * Math.pow(2, reconnectAttemptsRef.current - 1), 32000);
          
          if (reconnectAttemptsRef.current === 1) {
            console.log('ℹ️ WebSocket server not available. Live updates disabled.');
          }
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket: Failed to create connection:', error);
    }
  }, [url, onSeatUpdate, enabled]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, enabled]);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, sendMessage };
}

