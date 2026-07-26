import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { AssistantPage } from '../pages/AssistantPage.js';
import { LeadModalPage } from '../pages/LeadModalPage.js';
import { mockLeadDeskApi } from '../utils/mockApi.js';

test.describe('AI Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockLeadDeskApi(page);
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');
  });

  test('AI assistant answers a prompt and displays suggested actions', async ({ page }) => {
    await page.goto('/admin/assistant');

    const assistantPage = new AssistantPage(page);
    await assistantPage.ask('Which leads need follow-up?');

    await expect(page.getByText('High priority leads need follow-up today.')).toBeVisible();
    const lastMessage = page.locator('.space-y-6 > div.flex').last();
    await expect(lastMessage.getByRole('button', { name: 'Show high priority leads' })).toBeVisible();
  });

  test('AI assistant responds to quick prompt chips', async ({ page }) => {
    await page.goto('/admin/assistant');

    const assistantPage = new AssistantPage(page);
    await assistantPage.clickQuickPrompt('Show high priority leads');

    await expect(page.getByText('High priority leads need follow-up today.')).toBeVisible();
  });

  test('runs AI lead analysis from lead details modal', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.openLeadDetails('Ava Johnson');

    const leadModal = new LeadModalPage(page);
    await leadModal.runAIAnalysis();

    await expect(page.getByText('Lead analyzed')).toBeVisible();
  });

  test('generates AI follow-up email from lead details modal', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.openLeadDetails('Ava Johnson');

    const leadModal = new LeadModalPage(page);
    await leadModal.generateFollowUpEmail();

    await expect(page.getByText(/follow-up email generated/i)).toBeVisible();
  });
});
