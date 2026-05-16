import { test, expect } from '@playwright/test';

test('login page renders the email input and submit button', async ({ page }) => {
  await page.goto('/en/login');
  await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
});

test('login page renders OAuth buttons', async ({ page }) => {
  await page.goto('/en/login');
  await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /continue with apple/i })).toBeVisible();
});
