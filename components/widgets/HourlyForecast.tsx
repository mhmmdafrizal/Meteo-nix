"use client"
import { OpenMeteoForecast } from "@/lib/types"
import { Card } from "../ui/card"
import { useRef } from "react"
import { useDraggable } from "react-use-draggable-scroll"
import IconComponent from "../ui/icon-component"

interface HourlyForecastProps {
  data: OpenMeteoForecast
}

export default function HourlyForecast({ data }: HourlyForecastProps) {
  function extractHoursFromTime(time: string): number {
    return Number(time.slice(11, 13))
  }

  const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  const { events } = useDraggable(ref, {
    safeDisplacement: 2,
  })

  const hourly = data.hourly

  return (
    <>
      <Card
        ref={ref}
        {...events}
        tabIndex={0}
        className="order-first col-span-2 flex h-48 cursor-grab touch-auto touch-pan-x select-none scroll-px-0.5 flex-row items-center justify-between gap-12 overflow-hidden overscroll-contain scroll-smooth p-6 ring-offset-background transition-colors scrollbar-hide hover:overflow-x-auto focus:scroll-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:order-2 lg:order-3"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={hourly.time[i]} className="flex h-full flex-col justify-between">
            <div className="flex justify-center text-sm text-neutral-600 dark:text-neutral-400">
              {i === 0 ? "Now" : `${extractHoursFromTime(hourly.time[i])}:00`}
            </div>
            <div className="flex h-full items-center justify-center">
              <IconComponent
                weatherCode={hourly.weather_code[i]}
                x={hourly.is_day[i] ? "" : "n"}
                className="h-8 w-8"
              />
            </div>
            <div className="flex justify-center">
              {Math.floor(hourly.temperature_2m[i])}&deg;
            </div>
            {hourly.precipitation_probability[i] > 20 && (
              <div className="flex justify-center text-xs text-blue-600 dark:text-blue-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-0.5 h-3 w-3"
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
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.8501 18.05L3.30005 19.6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.7002 4.95L6.65015 5.9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {Math.round(hourly.precipitation_probability[i])}%
              </div>
            )}
          </div>
        ))}
      </Card>
    </>
  )
}
