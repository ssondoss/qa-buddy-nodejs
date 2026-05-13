import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByRole('link', { name: 'English' }).click();
  await page.locator('site-header').getByRole('link', { name: 'VIP' }).click();
  await page.getByRole('link', { name: 'Prices' }).click();
  await page.locator('site-header').getByRole('link', { name: 'Pro', exact: true }).click();
  await page.locator('site-header').getByRole('link', { name: 'Fees' }).click();
  await page.getByRole('link', { name: 'Referral Program' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Campaign Hub' }).click();
  const page1 = await page1Promise;
  await page.locator('site-header').getByRole('link').filter({ hasText: /^$/ }).click();
  await page.locator('site-header').getByRole('link', { name: 'Lite' }).click();
  await page.locator('section').filter({ hasText: 'Crypto trading made easy.' }).locator('img').click();
  await page.getByRole('link', { name: 'Prices' }).click();
});