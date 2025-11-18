import { ref, onBeforeUnmount } from 'vue'

/**
 * WebSocket Composable with auto-reconnect
 * @param {Object} options - Configuration options
 * @param {number} [options.maxReconnectAttempts=5] - Maximum reconnection attempts
 * @param {number} [options.reconnectDelay=1000] - Initial reconnect delay (ms)
 * @param {number} [options.maxReconnectDelay=30000] - Maximum reconnect delay (ms)
 * @returns {Object} WebSocket state and methods
 */
export function useWebSocket(options = {}) {
  const {
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    maxReconnectDelay = 30000,
  } = options

  const ws = ref(null)
  const status = ref('disconnected') // 'connecting' | 'connected' | 'disconnected' | 'error'
  const reconnectAttempts = ref(0)
  const reconnectTimer = ref(null)

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket URL
   * @param {Object} callbacks - Event callbacks
   * @param {Function} callbacks.onOpen - On connection opened
   * @param {Function} callbacks.onMessage - On message received
   * @param {Function} callbacks.onError - On error occurred
   * @param {Function} callbacks.onClose - On connection closed
   */
  const connect = (url, callbacks = {}) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected')
      return
    }

    try {
      status.value = 'connecting'
      console.log(`[WebSocket] Connecting to ${url}...`)

      ws.value = new WebSocket(url)

      ws.value.onopen = (event) => {
        status.value = 'connected'
        reconnectAttempts.value = 0
        console.log('[WebSocket] ✅ Connected successfully')

        if (callbacks.onOpen) {
          callbacks.onOpen(event)
        }
      }

      ws.value.onmessage = (event) => {
        if (callbacks.onMessage) {
          callbacks.onMessage(event)
        }
      }

      ws.value.onerror = (error) => {
        status.value = 'error'
        console.error('[WebSocket] ❌ Error occurred:', error)

        if (callbacks.onError) {
          callbacks.onError(error)
        }
      }

      ws.value.onclose = (event) => {
        const wasClean = event.wasClean
        const code = event.code
        const reason = event.reason

        console.log(`[WebSocket] 🔌 Connection closed - Code: ${code}, Clean: ${wasClean}, Reason: ${reason}`)

        status.value = 'disconnected'

        if (callbacks.onClose) {
          callbacks.onClose(event)
        }

        // Attempt to reconnect if not a clean close and attempts remain
        if (!wasClean && reconnectAttempts.value < maxReconnectAttempts) {
          attemptReconnect(url, callbacks)
        } else if (reconnectAttempts.value >= maxReconnectAttempts) {
          console.error('[WebSocket] ❌ Max reconnection attempts reached')
        }
      }
    } catch (error) {
      console.error('[WebSocket] ❌ Failed to create connection:', error)
      status.value = 'error'
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   * @param {string} url - WebSocket URL
   * @param {Object} callbacks - Event callbacks
   */
  const attemptReconnect = (url, callbacks) => {
    reconnectAttempts.value++

    // Calculate delay with exponential backoff
    const delay = Math.min(
      reconnectDelay * Math.pow(2, reconnectAttempts.value - 1),
      maxReconnectDelay
    )

    console.log(
      `[WebSocket] 🔄 Reconnecting in ${delay}ms (Attempt ${reconnectAttempts.value}/${maxReconnectAttempts})...`
    )

    reconnectTimer.value = setTimeout(() => {
      connect(url, callbacks)
    }, delay)
  }

  /**
   * Disconnect from WebSocket server
   * @param {number} [code=1000] - Close code
   * @param {string} [reason='Client disconnect'] - Close reason
   */
  const disconnect = (code = 1000, reason = 'Client disconnect') => {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }

    if (ws.value) {
      console.log('[WebSocket] Disconnecting...')
      ws.value.close(code, reason)
      ws.value = null
    }

    status.value = 'disconnected'
    reconnectAttempts.value = 0
  }

  /**
   * Send message to WebSocket server
   * @param {any} data - Data to send
   */
  const send = (data) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      ws.value.send(message)
    } else {
      console.warn('[WebSocket] Cannot send message, connection not open')
    }
  }

  // Cleanup on component unmount
  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    ws,
    status,
    reconnectAttempts,
    connect,
    disconnect,
    send,
  }
}
