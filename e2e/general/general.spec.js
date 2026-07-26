import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { mockLeadDeskApi } from '../utils/mockApi.js';

test.describe('General Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeadDeskApi(page);
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');
  });

  test('toggles dark mode theme', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.toggleDarkMode();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('opens notification panel', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.openNotifications();

    await expect(page.getByRole('heading', { name: 'Notification Center' })).toBeVisible();
  });

  test('supports responsive navigation on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();

    await page.getByRole('link', { name: /kanban/i }).click();
    await expect(page).toHaveURL(/\/admin\/kanban/);
  });
});
