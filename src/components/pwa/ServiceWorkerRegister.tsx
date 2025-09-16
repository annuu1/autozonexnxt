'use client'

import { useEffect } from 'react'

const SW_PATH = '/sw.js'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    
    const register = async () => {
      try {
        // Register immediately on load
        const reg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' })
        // Listen for updates
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              console.info('[PWA] New version is available. It will activate on next load.')
            }
          })
        })
        // Refresh the page when the new SW takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.info('[PWA] Controller changed. Reloading...')
          window.location.reload()
        })
      } catch (err) {
        console.warn('[PWA] Service worker registration failed', err)
      }
    }

    // Defer registration until the app is idle
    if ('requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(register)
    } else {
      setTimeout(register, 1500)
    }
  }, [])

  return null
}
