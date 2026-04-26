import { test } from '@playwright/test';
test('test', async ({ page }) => {
    await page.goto('https://bitoasis.net/en/home');
    await page.getByRole('link', { name: 'العربية' }).click();
    await page.locator('.hero').click();
    await page.locator('div').filter({ hasText: 'اشترِ بيتكوين وأكثر من 53' }).nth(4).click();
    await page.getByText('انضم إلى أكبر منصة عربية لتداول العملات الرقمية').click();
});
