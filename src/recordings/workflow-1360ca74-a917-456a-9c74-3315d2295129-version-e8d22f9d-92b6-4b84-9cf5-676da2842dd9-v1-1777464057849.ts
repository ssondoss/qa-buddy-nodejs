import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/en/home');
  await page.locator('site-header').getByRole('link').filter({ hasText: /^$/ }).click();
  await page.locator('site-header').getByRole('link', { name: 'Lite' }).click();
  await page.locator('site-header').getByRole('link', { name: 'Pro', exact: true }).click();
  await page.locator('site-header').getByRole('link', { name: 'VIP' }).click();
});