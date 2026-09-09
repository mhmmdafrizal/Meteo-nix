import { AirPollutionResponse } from "@/lib/types"

export const getAirPollutionData = async ({
  lat,
  lon,
}: {
  lat: string
  lon: string
}): Promise<AirPollutionResponse> => {
  const res = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`,
    { next: { revalidate: 900 } }
  )
  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  return res.json()
}
