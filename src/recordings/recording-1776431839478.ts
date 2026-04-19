import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/en/home');
  await page.getByTestId('login-btn').click();
  await page.getByText('EmailPasswordForget password?').click();
  await page.getByText('EmailPasswordForget password?').click();
});