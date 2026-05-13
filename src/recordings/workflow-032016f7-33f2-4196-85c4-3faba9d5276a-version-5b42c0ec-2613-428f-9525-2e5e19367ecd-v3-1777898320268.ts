import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByRole('link', { name: 'English' }).click();
  await page.locator('site-header').getByRole('link', { name: 'VIP' }).click();
  await page.locator('site-header').getByRole('link', { name: 'Lite' }).click();
  await page.getByTestId('login-btn').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').fill('sssss@ddd.ccc');
  await page.getByText('Password', { exact: true }).click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').fill('ssss.ssss');
  await page.getByTestId('login-loginForm-submit-btn').click();
  await page.locator('body > div > div:nth-child(2)').first().click();
});