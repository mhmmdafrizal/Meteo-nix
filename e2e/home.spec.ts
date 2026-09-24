import { expect, test } from "@playwright/test"

test.describe("Homepage", () => {
  test("loads weather for the default city", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/Jakarta - Weather Forecast/)
    await expect(page.getByText("Search city...")).toBeVisible()
    // wait for the server-fetched current conditions card
    await expect(page.getByText("Jakarta").first()).toBeVisible({ timeout: 30_000 })
    // maplibre canvas mounts client-side
    await expect(page.locator(".maplibregl-canvas")).toBeVisible({
      timeout: 30_000,
    })
  })

  test("shows current temperature and high/low", async ({ page }) => {
    await page.goto("/")

    // temperature is a text-8xl value, "17°"-style, followed by H:/L:
    const temperature = page.locator("div.text-8xl")
    await expect(temperature).toBeVisible({ timeout: 30_000 })
    await expect(temperature).toHaveText(/\d+°/)
    await expect(page.getByText(/H: -?\d+°/)).toBeVisible()
    await expect(page.getByText(/L: -?\d+°/)).toBeVisible()
  })

  test("theme toggle switches to dark and back", async ({ page }) => {
    await page.goto("/")
    const html = page.locator("html")

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await page.getByText("Dark", { exact: true }).click()
    await expect(html).toHaveClass(/dark/)

    await page.getByRole("button", { name: "Toggle theme" }).click()
    await page.getByText("Light", { exact: true }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test("command menu opens via Ctrl+J", async ({ page }) => {
    await page.goto("/")

    // the Ctrl+J listener mounts during hydration; press until the dialog opens
    await expect(async () => {
      await page.keyboard.press("Control+j")
      await expect(page.getByPlaceholder("Search city...")).toBeVisible({
        timeout: 1_000,
      })
    }).toPass({ timeout: 10_000 })

    await expect(page.getByText("Use my location")).toBeVisible()
  })
})