import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Weather Dashboard",
    short_name: "Weather",
    description:
      "Weather forecast with current conditions, radar, air quality, and 10-day outlook.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf5ea",
    theme_color: "#4f3a28",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}