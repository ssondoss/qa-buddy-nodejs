import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/en/home');
  await page.locator('site-header').getByRole('link', { name: 'Lite' }).click();
  await page.getByText('LiteProPricesVIPFeesInstitutionsLearnReferral ProgramCampaign Hub').click();
  await page.getByTestId('login-btn').click();
  await page.locator('div').filter({ hasText: 'Email' }).nth(1).click();
  await page.getByTestId('login-loginForm-email-txt').fill('ok');
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').fill('plllll');
  await page.getByText('EmailPasswordForget password?').click();
});