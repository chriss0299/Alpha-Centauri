import { test, expect, request } from '@playwright/test';
import { API_BASE_URL, TEST_USER } from './fixtures';

test.describe('Smoke E2E — stack full-stack', () => {
  test('home page risponde', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('healthcheck Redis del backend risponde 200', async () => {
    const ctx = await request.newContext();
    const res = await ctx.get(`${API_BASE_URL}/health/redis`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    await ctx.dispose();
  });

  test('login con utente seedato via UI', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('input[type="password"]').press('Enter');

    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15_000 });

    const refreshToken = await page.evaluate(() => window.localStorage.getItem('rugby_refresh_token'));
    const userJson = await page.evaluate(() => window.localStorage.getItem('rugby_user'));
    expect(refreshToken).toBeTruthy();
    expect(userJson).toBeTruthy();
  });

  test('login via API risponde con accessToken', async () => {
    const ctx = await request.newContext();
    const res = await ctx.post(`${API_BASE_URL}/auth/login`, {
      data: { email: TEST_USER.email, password: TEST_USER.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.accessToken).toBeTruthy();
    await ctx.dispose();
  });
});
