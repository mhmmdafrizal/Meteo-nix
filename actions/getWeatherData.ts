import { OpenMeteoForecast } from "@/lib/types"
import { buildForecastUrl } from "@/lib/weather"

export const getWeatherData = async ({
  lat,
  lon,
}: {
  lat: string
  lon: string
}): Promise<OpenMeteoForecast> => {
  const res = await fetch(buildForecastUrl(lat, lon), {
    next: { revalidate: 900 },
  })
  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  return res.json()
}