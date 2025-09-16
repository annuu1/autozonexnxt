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
        const reg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' })

        // Immediately activate a waiting SW
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        // Handle new SW found
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[PWA] New version installed, activating now...')
              sw.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })

        // Reload when the new SW activates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.info('[PWA] Updated service worker took control, reloading...')
          window.location.reload()
        })

        // Periodically check for updates
        setInterval(() => reg.update(), 60 * 60 * 1000) // every 1h
      } catch (err) {
        console.warn('[PWA] Service worker registration failed', err)
      }
    }

    if ('requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(register)
    } else {
      setTimeout(register, 1500)
    }
  }, [])

  return null
}
