import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { LeadModalPage } from '../pages/LeadModalPage.js';
import { AssistantPage } from '../pages/AssistantPage.js';
import { mockLeadDeskApi } from '../utils/mockApi.js';
import path from 'path';

test.describe('Automated Documentation Screenshots Capture', () => {
  test('captures high-resolution documentation screenshots for all 18 application states', async ({ page }) => {
    // Set 1920x1080 resolution
    await page.setViewportSize({ width: 1920, height: 1080 });
    await mockLeadDeskApi(page);

    const docsDir = path.join(process.cwd(), 'docs', 'screenshots');

    // 1. Landing Page
    await page.goto('/');
    await expect(page.getByText(/Transform Your Business/i).first()).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'landing.png'), fullPage: true });

    // 2. Login Page
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await expect(loginPage.submitButton).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'login.png') });

    // Login for subsequent dashboard screens
    await loginPage.login('admin@aileaddesk.com', 'Password123@');
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.heading).toBeVisible();

    // 3. Dashboard Overview
    await page.screenshot({ path: path.join(docsDir, 'dashboard.png') });

    // 4. KPI Cards
    const kpiSection = page.locator('div.grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-4').first();
    if (await kpiSection.isVisible()) {
      await kpiSection.screenshot({ path: path.join(docsDir, 'kpi-cards.png') });
    } else {
      await page.screenshot({ path: path.join(docsDir, 'kpi-cards.png') });
    }

    // 5. Analytics Charts
    const chartsSection = page.locator('div.grid.gap-6.md\\:grid-cols-2').first();
    if (await chartsSection.isVisible()) {
      await chartsSection.screenshot({ path: path.join(docsDir, 'analytics.png') });
    } else {
      await page.screenshot({ path: path.join(docsDir, 'analytics.png') });
    }

    // 6. Lead Directory
    const directorySection = page.locator('section').filter({ has: page.getByRole('table') }).first();
    if (await directorySection.isVisible()) {
      await directorySection.screenshot({ path: path.join(docsDir, 'leads.png') });
    } else {
      await page.screenshot({ path: path.join(docsDir, 'leads.png') });
    }

    // 7. Search Lead
    await dashboardPage.searchFor('Ava');
    await expect(page.getByRole('table').getByText('Ava Johnson')).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'search-lead.png') });

    // 8. Filter Leads
    await page.reload();
    await mockLeadDeskApi(page);
    await dashboardPage.filterByStatus('New');
    await expect(page.getByRole('table').getByText('Ava Johnson')).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'filter-leads.png') });

    // 9. Lead Details Modal
    await dashboardPage.openLeadDetails('Ava Johnson');
    const leadModal = new LeadModalPage(page);
    await expect(leadModal.modalTitle).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'lead-details.png') });

    // 10. Edit Lead
    await leadModal.setStatus('Contacted');
    await leadModal.setCategory('Enterprise');
    await page.screenshot({ path: path.join(docsDir, 'edit-lead.png') });
    await leadModal.saveChanges();

    // 11. AI Lead Analysis
    await leadModal.runAIAnalysis();
    await expect(page.getByText('Lead analyzed')).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'ai-analysis.png') });

    // 13. AI Follow-up Email
    await leadModal.generateFollowUpEmail();
    await expect(page.getByText(/follow-up email generated/i)).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'follow-up.png') });

    await leadModal.closeModal();

    // 12. AI Assistant Chat
    await page.goto('/admin/assistant');
    const assistantPage = new AssistantPage(page);
    await assistantPage.ask('Which leads need follow-up?');
    await expect(page.locator('.space-y-6 > div.flex').last()).toContainText('High priority leads need follow-up today.');
    await page.screenshot({ path: path.join(docsDir, 'ai-chat.png') });

    // 14. Notifications Panel
    await page.goto('/admin');
    await dashboardPage.openNotifications();
    await expect(page.getByRole('heading', { name: 'Notification Center' })).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'notifications.png') });

    // 15. Dark Mode
    await dashboardPage.toggleDarkMode();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({ path: path.join(docsDir, 'dark-mode.png') });
    await dashboardPage.toggleDarkMode(); // Reset

    // 16. Responsive Mobile View
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(dashboardPage.heading).toBeVisible();
    await page.screenshot({ path: path.join(docsDir, 'mobile.png') });
    await page.setViewportSize({ width: 1920, height: 1080 }); // Reset

    // 17. Settings / Profile
    await page.screenshot({ path: path.join(docsDir, 'settings.png') });

    // 18. Logout Screen
    await dashboardPage.logout();
    await expect(page).toHaveURL(/.*login/);
    await page.screenshot({ path: path.join(docsDir, 'logout.png') });
  });
});
