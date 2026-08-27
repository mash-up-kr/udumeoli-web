import * as React from "react"

export function PwaRuntime() {
  React.useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js")
    }
  }, [])

  return null
}
