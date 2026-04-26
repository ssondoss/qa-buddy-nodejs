import { test } from '@playwright/test';
test('test', async ({ page }) => {
    await page.goto('https://bitoasis.net/en/home');
    await page.locator('site-header').getByRole('link').filter({ hasText: /^$/ }).click();
    await page.locator('site-header').getByRole('link', { name: 'Lite' }).click();
    await page.locator('site-header').getByRole('link', { name: 'Pro', exact: true }).click();
    await page.getByRole('link', { name: 'Prices' }).click();
    await page.locator('site-header').getByRole('link', { name: 'VIP' }).click();
    await page.getByRole('link', { name: 'Toggle navigation' }).click();
    await page.getByTestId('login-btn').click();
});
