"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useEffect, useState } from "react"
import { DEFAULT_SUGGESTIONS as suggestions } from "@/lib/config"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

type GeocodingResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
}

const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search?count=5&language=en&format=json"

const RECENT_KEY = "recentCities"
const RECENT_MAX = 5

type RecentCity = {
  name: string
  lat: string
  lon: string
}

function displayName(result: GeocodingResult): string {
  return [result.name, result.admin1, result.country].filter(Boolean).join(", ")
}

function loadRecent(): RecentCity[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as RecentCity[]) : []
  } catch {
    return []
  }
}

export function CommandDialogDemo() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [recent, setRecent] = useState<RecentCity[]>(loadRecent)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeocodingResult[]>([])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${GEOCODING_URL}&name=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        )
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        // ponytail: aborted or failed requests leave the list empty
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const remember = (name: string, latitude: number, longitude: number) => {
    const entry: RecentCity = {
      name,
      lat: String(latitude),
      lon: String(longitude),
    }
    setRecent((prev) => {
      const deduped = prev.filter(
        (c) => c.lat !== entry.lat || c.lon !== entry.lon
      )
      const next = [entry, ...deduped].slice(0, RECENT_MAX)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      return next
    })
  }

  const openCity = (result: GeocodingResult) => {
    setOpen(false)
    setQuery("")
    remember(displayName(result), result.latitude, result.longitude)
    router.push(
      `/search?lat=${result.latitude}&lon=${result.longitude}&name=${encodeURIComponent(displayName(result))}`
    )
  }

  const geolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      openCity({
        id: 0,
        name: "My Location",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    })
  }

  const handleSelect = (result: GeocodingResult) => () => openCity(result)

  const handleSuggestion = (description: string) => async () => {
    const res = await fetch(`${GEOCODING_URL}&name=${encodeURIComponent(description)}`)
    if (!res.ok) return
    const data = await res.json()
    const first = data.results?.[0]
    if (first) openCity(first)
  }

  const showSuggestions = !query.trim() && results.length === 0

  return (
    <>
      <Button
        variant={"outline"}
        size={"lg"}
        onClick={() => setOpen(true)}
        className="h-9 w-full whitespace-nowrap px-4"
      >
        <p className="text-sm text-muted-foreground">
          Search city...{" "}
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 hover:bg-primary md:ml-28">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="h-3 w-3"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            
          </kbd>
        </p>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search city..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {recent.length > 0 && (
            <CommandGroup heading="Recent">
              {recent.map((city) => (
                <CommandItem
                  key={`${city.lat}-${city.lon}`}
                  onSelect={() =>
                    router.push(
                      `/search?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name)}`
                    )
                  }
                >
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={geolocate}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
              >
                <path
                  d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              Use my location
            </CommandItem>
            {showSuggestions &&
              suggestions.map((suggestion, i) => (
                <CommandItem
                  key={i}
                  onSelect={handleSuggestion(suggestion.description)}
                >
                  {suggestion.description}
                </CommandItem>
              ))}
            {!showSuggestions &&
              results.map((result) => (
                <CommandItem key={result.id} onSelect={handleSelect(result)}>
                  {displayName(result)}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}