"use client"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useMemo, useState } from "react"
import MapLibreMap, {
  Layer,
  LayerProps,
  Popup,
  Source,
} from "react-map-gl/maplibre"
import type { MapLayerMouseEvent } from "react-map-gl/maplibre"
import { Card } from "../ui/card"
import { useSearchParams } from "next/navigation"
import { DEFAULT_LOCATION } from "@/lib/config"
import { useTheme } from "next-themes"
import { buildForecastUrl, weatherCodeDescription } from "@/lib/weather"

const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark"
const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/positron"
const RAINVIEWER_INDEX = "https://api.rainviewer.com/public/weather-maps.json"

type PopupInfo = {
  latitude: number
  longitude: number
  temperature?: number
  description?: string
}

export default function Map() {
  const { theme } = useTheme()
  const MapTheme = useMemo(() => {
    if (theme === "system") {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    return theme
  }, [theme])

  const searchParams = useSearchParams()
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  const [defaultLat, defaultLon] = useMemo(() => {
    const latNumber = lat ? Number(lat) : Number(DEFAULT_LOCATION.coord.lat)
    const lonNumber = lon ? Number(lon) : Number(DEFAULT_LOCATION.coord.lon)
    return [latNumber, lonNumber]
  }, [lat, lon])

  const weatherLayer: LayerProps = {
    id: "weatherLayer",
    type: "raster",
    minzoom: 0,
    maxzoom: 7,
  }

  const [viewport, setViewport] = useState({
    latitude: lat ? Number(lat) : Number(defaultLat),
    longitude: lon ? Number(lon) : Number(defaultLon),
    zoom: 7,
    pitch: 60,
    bearing: -60,
  })

  const [frames, setFrames] = useState<string[]>([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [popup, setPopup] = useState<PopupInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(RAINVIEWER_INDEX)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const past: { path: string }[] = data?.radar?.past ?? []
        if (past.length === 0) return
        const urls = past.map(
          (frame) =>
            `${data.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`
        )
        setFrames(urls)
        setFrameIndex(urls.length - 1)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!playing || frames.length < 2) return
    const id = setInterval(
      () => setFrameIndex((i) => (i + 1) % frames.length),
      500
    )
    return () => clearInterval(id)
  }, [playing, frames.length])

  useEffect(() => {
    setViewport((prevViewport) => ({
      ...prevViewport,
      latitude: lat ? Number(lat) : Number(defaultLat),
      longitude: lon ? Number(lon) : Number(defaultLon),
    }))
  }, [lat, lon, defaultLat, defaultLon])

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const { lng, lat } = e.lngLat
    setPopup({ latitude: lat, longitude: lng })
    fetch(buildForecastUrl(lat, lng))
      .then((res) => res.json())
      .then((data) => {
        if (!data?.current) return
        setPopup({
          latitude: lat,
          longitude: lng,
          temperature: data.current.temperature_2m,
          description: weatherCodeDescription(data.current.weather_code),
        })
      })
      .catch(() => {})
  }

  return (
    <Card className="relative order-11 col-span-2 h-[25rem] overflow-hidden overscroll-contain p-0 md:p-0 xl:col-span-3">
      <MapLibreMap
        reuseMaps
        {...viewport}
        onZoom={(e) => setViewport((v) => ({ ...v, zoom: e.viewState.zoom }))}
        onClick={handleMapClick}
        attributionControl={false}
        mapStyle={MapTheme === "dark" ? DARK_STYLE : LIGHT_STYLE}
        style={{
          flex: "1",
          position: "relative",
          width: "100%",
          height: "100%",
          top: "0",
          left: "0",
          zIndex: 0,
        }}
      >
        {frames.length > 0 && (
          <Source
            id="weatherSource"
            type="raster"
            tiles={[frames[frameIndex]]}
            tileSize={256}
            attribution="© RainViewer"
            maxzoom={7}
          >
            <Layer {...weatherLayer} />
          </Source>
        )}
        {popup && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            onClose={() => setPopup(null)}
            closeButton={true}
            closeOnClick={false}
            offset={12}
          >
            {popup.temperature !== undefined ? (
              <div className="flex flex-col">
                <span className="text-lg font-bold">
                  {Math.round(popup.temperature)}&deg;
                </span>
                <span className="text-sm">{popup.description}</span>
                <span className="text-xs text-neutral-500">
                  {popup.latitude.toFixed(2)}, {popup.longitude.toFixed(2)}
                </span>
              </div>
            ) : (
              <span>Loading…</span>
            )}
          </Popup>
        )}
      </MapLibreMap>
      {frames.length > 1 && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-md bg-white/85 px-2 py-1.5 text-xs shadow-md backdrop-blur dark:bg-black/60">
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause radar" : "Play radar"}
            className="grid h-6 w-6 place-items-center rounded text-neutral-700 hover:bg-black/10 dark:text-neutral-200 dark:hover:bg-white/10"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={frameIndex}
            onChange={(e) => setFrameIndex(Number(e.target.value))}
            className="w-28 accent-neutral-700 dark:accent-neutral-300"
            aria-label="Radar frame"
          />
          <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
            {frameIndex + 1}/{frames.length}
          </span>
        </div>
      )}
    </Card>
  )
}