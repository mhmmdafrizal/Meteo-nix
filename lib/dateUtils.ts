export function formatIsoTimeWithAMPM(
  iso: string,
  timezoneOffset: number
): string {
  const date = new Date(iso)
  const local = new Date(date.getTime() + timezoneOffset * 1000)
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(local)
}
