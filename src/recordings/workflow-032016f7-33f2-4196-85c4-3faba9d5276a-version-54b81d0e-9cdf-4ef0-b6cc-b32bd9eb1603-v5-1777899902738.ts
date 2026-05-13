import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/en/home');
  await page.getByTestId('login-btn').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByRole('link', { name: 'Prices' }).click();
  await page.locator('site-header').getByRole('link', { name: 'Pro', exact: true }).click();
  await page.locator('site-header').getByRole('link').filter({ hasText: /^$/ }).click();
  await page.getByTestId('login-btn').click();
  await page.locator('div').filter({ hasText: 'Email' }).nth(1).click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByText('EmailPasswordForget password?').click();
  await page.getByText('EmailPasswordForget password?').click();
  await page.locator('site-header').getByRole('link', { name: 'Fees' }).click();
  await page.locator('site-header').getByRole('link', { name: 'VIP' }).click();
  await page.getByRole('link', { name: 'Prices' }).click();
});