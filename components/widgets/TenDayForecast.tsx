import { OpenMeteoForecast } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { TemperatureRange } from "../ui/temperature-range"
import IconComponent from "../ui/icon-component"
import { Separator } from "../ui/separator"

interface TenDayForecastProps {
  data: OpenMeteoForecast
}

export default function TenDayForecast({ data }: TenDayForecastProps) {
  const daily = data.daily
  const minTemperature = Math.min(...daily.temperature_2m_min)
  const maxTemperature = Math.max(...daily.temperature_2m_max)

  function dayLabel(iso: string, i: number): string {
    if (i === 0) return "Today"
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(new Date(iso.replace(" ", "T")))
  }

  function dayTip(i: number): string {
    const rainChance = rainPercent(i)
    const tMax = daily.temperature_2m_max[i]
    const code = daily.weather_code[i]

    if (rainChance >= 60 || (code >= 95 && code <= 99))
      return "Thunderstorms possible, stay safe."
    if (rainChance >= 40) return "Bring an umbrella."
    if (code >= 71 && code <= 86) return "Snow possible, keep warm."
    if (tMax >= 32) return "Hot day, keep hydrated."
    if (tMax <= 10) return "Cold day, bundle up."
    return ""
  }

  function rainPercent(i: number): number {
    const day = daily.time[i]
    let max = 0
    const hourly = data.hourly
    for (let h = 0; h < hourly.time.length; h++) {
      if (hourly.time[h].slice(0, 10) === day) {
        const p = hourly.precipitation_probability?.[h] ?? 0
        if (p > max) max = p
      }
    }
    return Math.round(max)
  }

  return (
    <>
      <Card className="h-fit shrink-0">
        <CardHeader>
          <CardTitle>
            <i>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 invert dark:invert-0"
              >
                <path
                  d="M8 2V5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.5 9.08984H20.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.6947 13.7002H15.7037"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.6947 16.7002H15.7037"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.9955 13.7002H12.0045"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.9955 16.7002H12.0045"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.29431 13.7002H8.30329"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.29431 16.7002H8.30329"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
            10-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-base font-normal md:mb-1">
          {daily.time.map((dateISO, i) => (
            <div key={dateISO}>
              <div className="flex w-full flex-row items-center justify-between gap-2 last:mb-0">
                <p className="min-w-[3rem] font-medium">{dayLabel(dateISO, i)}</p>
                <IconComponent
                  weatherCode={daily.weather_code[i]}
                  className=" h-8 w-8"
                />
                <div className="flex w-[60%] flex-row gap-2 overflow-hidden">
                  <div className="flex w-full select-none flex-row items-center justify-between gap-2 pr-2 text-sm">
                    <p className="flex w-[3rem] min-w-fit justify-end text-neutral-600 dark:text-neutral-400">
                      {Math.floor(daily.temperature_2m_min[i])}&deg;
                    </p>
                    <TemperatureRange
                      min={minTemperature}
                      max={maxTemperature}
                      value={[
                        daily.temperature_2m_min[i],
                        daily.temperature_2m_max[i],
                      ]}
                    />
                    <p className="flex w-[3rem] min-w-fit justify-end">
                      {Math.floor(daily.temperature_2m_max[i])}&deg;
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex min-h-[1.25rem] items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                {rainPercent(i) > 0 && (
                  <span className="text-blue-600 dark:text-blue-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-0.5 inline h-3 w-3"
                    >
                      <path
                        d="M7.66 16.8C9.23 18.61 11.5 18.61 13.08 16.8C14.65 15 15.5 10.5 13.9 8.5C13.7 8.2 13.45 7.9 13.15 7.7C10.9 6.1 6.9 6.1 4.87 7.7C2.84 9.3 2.84 12.3 4.84 14.2C4.84 14.2 5.15 14.5 5.15 14.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.30005 10.5H14.05"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {rainPercent(i)}%
                  </span>
                )}
                {dayTip(i) && <span>{dayTip(i)}</span>}
              </div>
              {i !== daily.time.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
