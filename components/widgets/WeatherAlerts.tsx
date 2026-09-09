"use client"

import { useEffect, useState } from "react"
import { OpenMeteoAlert } from "@/lib/types"

const DISMISSED_KEY = "dismissedAlerts"

type DismissedAlert = {
  id: string
  expiresAt: number
}

function alertId(alert: OpenMeteoAlert): string {
  return `${alert.event ?? "alert"}-${alert.start ?? ""}`
}

function expired(d: DismissedAlert): boolean {
  return d.expiresAt < Date.now()
}

function loadDismissed(): DismissedAlert[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return raw ? (JSON.parse(raw) as DismissedAlert[]) : []
  } catch {
    return []
  }
}

export default function WeatherAlerts({ alerts }: { alerts: OpenMeteoAlert[] }) {
  const [dismissed, setDismissed] = useState<DismissedAlert[]>([])

  useEffect(() => {
    setDismissed(loadDismissed().filter((d) => !expired(d)))
  }, [])

  const dismiss = (alert: OpenMeteoAlert) => {
    const entry: DismissedAlert = {
      id: alertId(alert),
      expiresAt: new Date(alert.end ?? "").getTime() || Date.now() + 86400000,
    }
    setDismissed((prev) => {
      const next = [...prev.filter((d) => !expired(d)), entry]
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next))
      return next
    })
  }

  const visible = alerts.filter((a) => !dismissed.some((d) => d.id === alertId(a)))

  if (visible.length === 0) return null

  return (
    <div className="mb-4 flex flex-col gap-2">
      {visible.map((alert) => (
        <div
          key={alertId(alert)}
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/40 dark:bg-amber-950/40"
        >
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {alert.event ?? "Weather alert"}
            </p>
            {alert.description && (
              <p className="mt-1 text-amber-800 dark:text-amber-300">
                {alert.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(alert)}
            aria-label="Dismiss alert"
            className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-200/60 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}