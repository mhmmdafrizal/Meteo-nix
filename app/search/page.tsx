import { getWeatherData } from "@/actions/getWeatherData"
import { getAirPollutionData } from "@/actions/getAirPollutionData"
import CurrentWeather from "@/components/widgets/CurrentWeather"
import HourlyForecast from "@/components/widgets/HourlyForecast"
import Map from "@/components/widgets/Map"
import OtherLargeCities from "@/components/widgets/OtherLargeCities"
import TenDayForecast from "@/components/widgets/TenDayForecast"
import WeatherAlerts from "@/components/widgets/WeatherAlerts"
import WeatherWidgets from "@/components/widgets/WeatherWidgets"
import { DEFAULT_LOCATION } from "@/lib/config"
import { Metadata } from "next"
import { notFound } from "next/navigation"

interface searchParamsProps {
  lat: string
  lon: string
  name?: string
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<searchParamsProps>
}): Promise<Metadata> {
  const params = await searchParams
  const cityName = params.name || DEFAULT_LOCATION.city

  return {
    title: `${cityName} - Weather Forecast`,
    description: `${cityName} weather forecast with current conditions, wind, air quality, and what to expect for the next 3 days.`,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<searchParamsProps>
}) {
  const { lat, lon, name } = await searchParams

  const [weather, airPollution] = await Promise.all([
    getWeatherData({ lat, lon }),
    getAirPollutionData({ lat, lon }),
  ])

  if (!weather || !airPollution) return notFound()

  const cityName = name || DEFAULT_LOCATION.city

  return (
    <>
      <WeatherAlerts alerts={weather.alerts ?? []} />
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex w-full min-w-[18rem] flex-col gap-4 md:w-1/2">
          <CurrentWeather data={weather} city={cityName} />
          <TenDayForecast data={weather} />
        </div>
        <section className="grid h-full grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <WeatherWidgets
            data={weather}
            airQuality={airPollution.current.european_aqi}
          />
          <HourlyForecast data={weather} />
          <Map />
          <OtherLargeCities />
        </section>
      </div>
    </>
  )
}
