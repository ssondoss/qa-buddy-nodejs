import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/en/home');
  await page.getByTestId('login-btn').click();
  await page.getByText('LiteProPricesVIPFeesInstitutionsLearnReferral ProgramCampaign Hub').click();
  await page.getByTestId('login-btn').click();
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').fill('ok');
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').fill('ok');
  await page.getByText('EmailPasswordForget password?').click();
  await page.getByTestId('login-loginForm-email-txt').click();
});