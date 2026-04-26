import { test } from '@playwright/test';
test('test', async ({ page }) => {
    await page.goto('https://bitoasis.net/en/home');
    await page.getByTestId('login-btn').click();
    await page.getByTestId('login-loginForm-email-txt').click();
    await page.getByTestId('login-loginForm-email-txt').fill('sondosmarashdeh@bitoasis.net');
    await page.getByTestId('login-loginForm-password-txt').click();
    await page.getByTestId('login-loginForm-password-txt').fill('okhs234bdd');
    await page.getByTestId('login-loginForm-submit-btn').click();
});
