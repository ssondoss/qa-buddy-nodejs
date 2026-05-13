import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByTestId('login-btn').click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByTestId('register-btn').click();
  const page1 = await page1Promise;
  const page2Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'العروض والمكافآت' }).click();
  const page2 = await page2Promise;
  const page3Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'تعلّم' }).click();
  const page3 = await page3Promise;
  await page.locator('site-header').getByRole('link', { name: 'الرسوم' }).click();
  await page.getByRole('link', { name: 'الأسعار' }).click();
  await page.getByRole('link', { name: 'English' }).click();
});