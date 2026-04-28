import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByText('البريد الإلكتروني').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-password-txt').click();
});