import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { mockLeadDeskApi } from '../utils/mockApi.js';

test.describe('Dashboard Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeadDeskApi(page);
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');
  });

  test('loads dashboard and renders header title', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();
  });

  test('displays statistics and KPI metric cards', async ({ page }) => {
    await expect(page.getByText('Total Leads')).toBeVisible();
  });

  test('renders business intelligence charts', async ({ page }) => {
    await expect(page.getByText('Business Intelligence Visualizations')).toBeVisible();
    await expect(page.getByText('Monthly Leads Trend')).toBeVisible();
    await expect(page.getByText('Status Distribution')).toBeVisible();
  });

  test('navigation works between overview and directory tabs and pages', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Switch tabs
    await dashboardPage.leadsTab.click();
    await expect(page.getByText('Lead Management Directory')).toBeVisible();

    await dashboardPage.overviewTab.click();
    await expect(page.getByText('Business Intelligence Visualizations')).toBeVisible();

    // Navigation links
    await page.getByRole('link', { name: /kanban/i }).click();
    await expect(page).toHaveURL(/\/admin\/kanban/);

    await page.getByRole('link', { name: /ai assistant/i }).click();
    await expect(page).toHaveURL(/\/admin\/assistant/);
  });
});
