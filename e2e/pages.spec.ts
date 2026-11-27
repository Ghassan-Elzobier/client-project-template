import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PUBLIC_PAGES } from "./env";

// Every public page, at each size the projects run (a phone, a small phone, a
// desktop): it has its heading, nothing pushes it sideways, and axe finds no
// WCAG 2.2 AA problem.
for (const { path, heading } of PUBLIC_PAGES) {
  test(`${path} shows its heading and fits the screen`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "the page scrolls sideways").toBeLessThanOrEqual(0);
  });

  test(`${path} passes the accessibility checks`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

test("an address that leads nowhere says so, with a way home", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
});
