'use client'

import { useState } from 'react'

interface ManualMeasurementsPayload {
  chest?: number | null
  neck?: number | null
  waist?: number | null
  hips?: number | null
  shoulders?: number | null
  arm_length?: number | null
  thigh?: number | null
  biceps?: number | null
  leg_length?: number | null
}

interface ScanMeasurementsPayload {
  front?: File | null
  side?: File | null
  video?: File | null
}

export function useMeasurements() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitManualMeasurements = async (payload: ManualMeasurementsPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/measurements/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(err.error || `Erreur ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la soumission des mesures'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const submitScanMeasurements = async (payload: ScanMeasurementsPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      if (payload.front) formData.append('front', payload.front)
      if (payload.side) formData.append('side', payload.side)
      if (payload.video) formData.append('video', payload.video)

      const response = await fetch('/api/measurements/scan', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(err.error || `Erreur ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du scan'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    submitManualMeasurements,
    submitScanMeasurements,
    isLoading,
    error,
  }
}
