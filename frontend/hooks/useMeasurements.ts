'use client'

import { useState } from 'react'

const MEASUREMENTS_API_URL = process.env.NEXT_PUBLIC_MEASUREMENTS_API_URL || 'http://localhost:8003/api/v1'

interface ManualMeasurementsPayload {
  method: 'manual'
  measurements: {
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
}

interface ScanMeasurementsPayload {
  method: 'scan'
  user_id: string
  front_image_url: string
  side_image_url?: string
  video_url?: string
  is_paid: boolean
}

interface MeasurementsResponse {
  method: 'manual' | 'scan'
  measurements: {
    chest?: number
    neck?: number
    waist?: number
    hips?: number
    shoulders?: number
    arm_length?: number
    thigh?: number
    biceps?: number
    leg_length?: number
  }
  confidence: 'exact' | 'estimated'
  precision_cm: string
  version: number
  disclaimer?: string
}

export function useMeasurements() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitManualMeasurements = async (payload: ManualMeasurementsPayload): Promise<MeasurementsResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${MEASUREMENTS_API_URL}/measurements/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload.measurements),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
        throw new Error(errorData.detail || `Erreur ${response.status}`)
      }

      const data: MeasurementsResponse = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission des mesures'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const submitScanMeasurements = async (payload: ScanMeasurementsPayload): Promise<MeasurementsResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${MEASUREMENTS_API_URL}/measurements/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: payload.user_id,
          front_image_url: payload.front_image_url,
          side_image_url: payload.side_image_url,
          video_url: payload.video_url,
          is_paid: payload.is_paid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }))
        throw new Error(errorData.detail || `Erreur ${response.status}`)
      }

      const data: MeasurementsResponse = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du scan'
      setError(errorMessage)
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

