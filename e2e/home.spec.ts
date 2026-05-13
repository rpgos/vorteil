import { test, expect } from '@playwright/test'

test('redirects to default locale', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/en/)
})

test('hero section is visible', async ({ page }) => {
  await page.goto('/en')
  await expect(page.getByRole('link', { name: /start playing/i })).toBeVisible()
})
