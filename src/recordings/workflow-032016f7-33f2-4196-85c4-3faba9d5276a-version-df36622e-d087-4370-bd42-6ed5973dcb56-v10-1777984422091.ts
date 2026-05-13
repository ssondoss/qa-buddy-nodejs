import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').dblclick();
  await page.getByTestId('login-loginForm-email-txt').fill('ok@ok.ss');
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').fill('kjhgffdfghj');
  await page.getByTestId('login-loginForm-submit-btn').click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'صورة التحدي 6' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.locator('.rtl > div > div:nth-child(2)').first().click();
  const page1 = await page1Promise;
  await page.getByRole('link', { name: 'برنامج الإحالة' }).click();
  const page2Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'تعلّم' }).click();
  const page2 = await page2Promise;
});