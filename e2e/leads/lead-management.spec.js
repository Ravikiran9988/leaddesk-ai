import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { LeadModalPage } from '../pages/LeadModalPage.js';
import { LandingPage } from '../pages/LandingPage.js';
import { mockLeadDeskApi } from '../utils/mockApi.js';

test.describe('Lead Management Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeadDeskApi(page);
  });

  test('creates a new lead from the public contact form', async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();
    await landingPage.submitLead({
      name: 'Catherine Vance',
      email: 'catherine@example.com',
      budget: 'Above $5000',
      source: 'Website',
      message: 'Need full stack AI integration.',
    });

    await expect(page.getByText(/thanks! your lead has been submitted/i)).toBeVisible();
  });

  test('searches for a lead by name', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.searchFor('Ava');
    await expect(page.getByRole('table').getByText('Ava Johnson')).toBeVisible();
  });

  test('filters leads by status', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.filterByStatus('New');

    await expect(page.getByRole('table').getByText('Ava Johnson')).toBeVisible();
  });

  test('views lead details in modal', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.openLeadDetails('Ava Johnson');

    const leadModal = new LeadModalPage(page);
    await expect(leadModal.modalTitle).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Ava Johnson')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('ava@example.com')).toBeVisible();
  });

  test('edits lead details and saves changes', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.openLeadDetails('Ava Johnson');

    const leadModal = new LeadModalPage(page);
    await leadModal.setStatus('Contacted');
    await leadModal.saveChanges();

    await expect(page.getByText('Lead updated')).toBeVisible();
  });

  test('deletes a lead from directory', async ({ page }) => {
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.deleteLead('Bob Smith');

    await expect(page.getByText('Bob Smith')).not.toBeVisible();
  });
});
