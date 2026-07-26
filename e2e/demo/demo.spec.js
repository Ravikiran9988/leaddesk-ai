import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { LeadModalPage } from '../pages/LeadModalPage.js';
import { AssistantPage } from '../pages/AssistantPage.js';
import { mockLeadDeskApi } from '../utils/mockApi.js';

test.describe('Complete Application Demo Flow', () => {
  test('demonstrates end-to-end user journey in a continuous recording', async ({ page }) => {
    // Enable stateful mock API endpoints
    await mockLeadDeskApi(page);

    // -------------------------------------------------------------
    // SECTION 1: Open Homepage
    // -------------------------------------------------------------
    await page.goto('/');
    await expect(page.getByText(/Transform Your Business/i).first()).toBeVisible();

    // -------------------------------------------------------------
    // SECTION 2: Login as Admin
    // -------------------------------------------------------------
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('admin@aileaddesk.com', 'Password123@');

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();

    // -------------------------------------------------------------
    // SECTION 3: Dashboard (KPI Cards & Analytics Charts)
    // -------------------------------------------------------------
    await expect(page.getByText('Total Leads')).toBeVisible();
    await expect(page.getByText('Monthly Leads Trend')).toBeVisible();
    await expect(page.getByText('Status Distribution')).toBeVisible();

    // -------------------------------------------------------------
    // SECTION 4: Lead Management (Search, Filter, Edit, Note, Upload)
    // -------------------------------------------------------------
    await dashboardPage.searchFor('Ava');
    await expect(page.getByRole('table').getByText('Ava Johnson')).toBeVisible();

    await dashboardPage.filterByStatus('New');
    await expect(page.getByRole('table').getByText('Ava Johnson')).toBeVisible();

    await dashboardPage.openLeadDetails('Ava Johnson');
    const leadModal = new LeadModalPage(page);
    await expect(leadModal.modalTitle).toBeVisible();

    await leadModal.setStatus('Contacted');
    await leadModal.saveChanges();
    await expect(page.getByText('Lead updated')).toBeVisible();

    await leadModal.addNote('Scheduled discovery call for next Tuesday.');
    await expect(page.getByText('Note added')).toBeVisible();

    await leadModal.uploadAttachment({
      name: 'sample_proposal.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Mock PDF Content'),
    });
    await expect(page.getByText('File uploaded')).toBeVisible();

    // -------------------------------------------------------------
    // SECTION 5: AI Features (Analysis, Email, Assistant)
    // -------------------------------------------------------------
    await leadModal.runAIAnalysis();
    await expect(page.getByText('Lead analyzed')).toBeVisible();

    await leadModal.generateFollowUpEmail();
    await expect(page.getByText(/follow-up email generated/i)).toBeVisible();

    await leadModal.closeModal();

    await page.goto('/admin/assistant');
    const assistantPage = new AssistantPage(page);
    await assistantPage.ask('Which leads need follow-up?');
    await expect(page.locator('.space-y-6 > div.flex').last()).toContainText('High priority leads need follow-up today.');

    const lastMessage = page.locator('.space-y-6 > div.flex').last();
    await expect(lastMessage.getByRole('button', { name: 'Show high priority leads' })).toBeVisible();

    await assistantPage.clickQuickPrompt('Show high priority leads');
    await expect(page.locator('.space-y-6 > div.flex').last()).toContainText('High priority leads need follow-up today.');

    // -------------------------------------------------------------
    // SECTION 6: Notifications
    // -------------------------------------------------------------
    await page.goto('/admin');
    await dashboardPage.openNotifications();
    await expect(page.getByRole('heading', { name: 'Notification Center' })).toBeVisible();

    // -------------------------------------------------------------
    // SECTION 7: Toggle Dark Mode
    // -------------------------------------------------------------
    await dashboardPage.toggleDarkMode();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await dashboardPage.toggleDarkMode();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // -------------------------------------------------------------
    // SECTION 8: Responsive Mobile View
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(dashboardPage.heading).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(dashboardPage.heading).toBeVisible();

    // -------------------------------------------------------------
    // SECTION 9: Logout
    // -------------------------------------------------------------
    await dashboardPage.logout();
    await expect(page).toHaveURL(/.*login/);
  });
});
