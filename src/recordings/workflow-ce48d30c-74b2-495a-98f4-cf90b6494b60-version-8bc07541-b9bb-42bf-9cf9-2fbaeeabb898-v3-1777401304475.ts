import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bitoasis.net/ar/login');
  await page.getByTestId('login-loginForm-email-txt').click();
  await page.getByTestId('login-loginForm-email-txt').fill('dddddd@ssss.com');
  await page.getByText('كلمة المرور', { exact: true }).click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').click();
  await page.getByTestId('login-loginForm-password-txt').fill('wwwwwwwww');
  await page.getByTestId('login-loginForm-submit-btn').click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'تخطي التحدي، الصفحة 1 من' }).click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 239,
      y: 389
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'تحقق من الإجابات' }).click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 130,
      y: 383
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 430,
      y: 285
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 463,
      y: 293
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 128,
      y: 363
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 128,
      y: 363
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 266,
      y: 294
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'تخطي التحدي' }).click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'تخطي التحدي' }).click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 228,
      y: 276
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'تخطي التحدي' }).press('ArrowDown');
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 446,
      y: 236
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 163,
      y: 340
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 108,
      y: 334
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 431,
      y: 136
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'تخطي التحدي' }).click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 54,
      y: 377
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'التحدي التالي، الصفحة 1 من' }).click();
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 255,
      y: 411
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('img', { name: 'تحدي CAPTCHA' }).click({
    position: {
      x: 278,
      y: 399
    }
  });
  await page.locator('iframe[title="hCaptcha challenge"]').first().contentFrame().getByRole('button', { name: 'تحقق من الإجابات' }).click();
  await page.getByRole('link', { name: 'تعلّم' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'English' }).click();
  const page1 = await page1Promise;
  await page.locator('site-header').getByRole('link', { name: 'Fees' }).click();
  await page.getByRole('link', { name: 'Prices' }).click();
  await page.getByText('BitcoinBTCMCap $1.53T DetailsBuy').click();
  await page.getByRole('link', { name: ' Buy' }).click();
  await page.getByTestId('login-loginForm-email-txt').click();
});