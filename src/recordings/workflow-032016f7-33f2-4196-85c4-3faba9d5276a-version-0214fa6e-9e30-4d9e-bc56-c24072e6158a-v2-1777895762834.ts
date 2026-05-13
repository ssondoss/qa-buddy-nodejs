import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByTestId('login-btn').click();
  await page.getByRole('link', { name: 'English' }).click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').fill('www');
  await page.locator('div').filter({ hasText: 'Password' }).nth(2).click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').fill('wwwwww');
  await page.getByTestId('login-loginForm-forgetPassword-link').click();
  await page.getByText('EmailSend email').click();
  await page.getByText('EmailSend email').click();
});