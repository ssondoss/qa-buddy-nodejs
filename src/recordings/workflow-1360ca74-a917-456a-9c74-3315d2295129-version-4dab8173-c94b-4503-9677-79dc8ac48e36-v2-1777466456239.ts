import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByText('البريد الإلكتروني').click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByText('البريد الإلكترونيكلمة المرورنسيت كلمة المرور؟تسجيل الدخولليس لديك حساب؟ قم بالإش').click();
  await page.getByRole('link', { name: 'برنامج الإحالة' }).click();
  await page.getByText('إنشاء حسابتسجيل الدخول English').click();
});