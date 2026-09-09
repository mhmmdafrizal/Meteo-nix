export function buildForecastUrl(lat: string | number, lon: string | number): string {
  const params = [
    "current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility",
    "hourly=temperature_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,is_day",
    "daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,moon_phase",
    "timezone=auto",
    "forecast_days=10",
    "alerts=true",
  ].join("&")

  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&${params}`
}

export function weatherCodeDescription(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  }
  return map[code] || "Unknown"
}

export function moonPhaseLabel(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return "New moon"
  if (phase < 0.1875) return "Waxing crescent"
  if (phase < 0.3125) return "First quarter"
  if (phase < 0.4375) return "Waxing gibbous"
  if (phase < 0.5625) return "Full moon"
  if (phase < 0.6875) return "Waning gibbous"
  if (phase < 0.8125) return "Last quarter"
  return "Waning crescent"
}