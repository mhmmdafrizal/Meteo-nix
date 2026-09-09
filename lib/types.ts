type Coordinates = {
  lon: string
  lat: string
}
export type Location = {
  city: string
  coord: Coordinates
}

export type WeatherCode = number

export type OpenMeteoCurrent = {
  time: string
  interval: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  precipitation: number
  weather_code: WeatherCode
  wind_speed_10m: number
  wind_direction_10m: number
  pressure_msl: number
  visibility: number
}

export type OpenMeteoHourly = {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  precipitation: number[]
  precipitation_probability: number[]
  weather_code: WeatherCode[]
  is_day: number[]
}

export type OpenMeteoDaily = {
  time: string[]
  weather_code: WeatherCode[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
  precipitation_sum: number[]
  moon_phase: number[]
}

export type OpenMeteoAlert = {
  sender_name?: string
  event?: string
  start?: string
  end?: string
  description?: string
}

export type OpenMeteoForecast = {
  latitude: number
  longitude: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  current: OpenMeteoCurrent
  hourly: OpenMeteoHourly
  daily: OpenMeteoDaily
  alerts?: OpenMeteoAlert[]
}

export type AirQualityData = {
  time: string
  interval: number
  european_aqi: number
}

export type AirPollutionResponse = {
  latitude: number
  longitude: number
  current: AirQualityData
}
