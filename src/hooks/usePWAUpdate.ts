import { useRegisterSW } from 'virtual:pwa-register/react'

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000 // 1 hour

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Check for updates periodically
        setInterval(() => {
          void registration.update()
        }, UPDATE_CHECK_INTERVAL)
      }
    },
  })

  const applyUpdate = () => {
    void updateServiceWorker(true)
  }

  return {
    needRefresh,
    applyUpdate,
  }
}
