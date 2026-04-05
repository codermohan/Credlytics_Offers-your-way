import { test, expect } from '@playwright/test';

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
});

test('public auth routes are reachable', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();

  await page.goto('/forgot-password');
  await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
});
