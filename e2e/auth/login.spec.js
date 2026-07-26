import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { mockLeadDeskApi } from '../utils/mockApi.js';

test.describe('Authentication Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeadDeskApi(page);
  });

  test('shows validation feedback for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);

    await loginPage.login('bad@example.com', 'wrong-password');
    await loginPage.expectErrorVisible();
  });

  test('signs in successfully and lands on the dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);

    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('logs out successfully and redirects to login page', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();

    await dashboardPage.logout();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('persists session when auth token is present in localStorage', async ({ page }) => {
    await page.goto('/admin/login');
    await page.evaluate(() => localStorage.setItem('token', 'test-token'));

    await page.goto('/admin');
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();
  });
});
