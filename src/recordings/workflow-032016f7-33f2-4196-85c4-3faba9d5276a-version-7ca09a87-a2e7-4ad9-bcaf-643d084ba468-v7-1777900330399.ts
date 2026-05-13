import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByRole('link', { name: 'English' }).click();
  await page.locator('site-header').getByRole('link', { name: 'Fees' }).click();
  await page.locator('site-header').getByRole('link', { name: 'VIP' }).click();
  await page.getByRole('link', { name: 'Prices' }).click();
  await page.locator('site-header').getByRole('link', { name: 'Pro', exact: true }).click();
});