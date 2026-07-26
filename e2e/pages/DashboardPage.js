import { expect } from '@playwright/test';

export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Enterprise Analytics Dashboard/i });
    this.searchInput = page.getByPlaceholder(/search name, email, tags, source/i);
    this.statusFilterSelect = page.getByRole('combobox');
    this.overviewTab = page.getByRole('button', { name: /overview & analytics/i });
    this.leadsTab = page.getByRole('button', { name: /lead directory/i });
    this.logoutButton = page.getByRole('button', { name: /logout/i });
    this.darkModeButton = page.getByTitle(/switch to (dark|light) mode/i);
    this.notificationButton = page.getByRole('button', { name: /notification center/i });
  }

  async searchFor(term) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/leads') && resp.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    await this.searchInput.fill(term);
    await responsePromise;
  }

  async filterByStatus(status) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/leads') && resp.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);
    await this.statusFilterSelect.selectOption(status);
    await responsePromise;
  }

  async openLeadDetails(name) {
    const row = this.page.locator('tr', { hasText: name });
    await row.getByRole('button', { name: /view/i }).click();
  }

  async deleteLead(name) {
    const row = this.page.locator('tr', { hasText: name });
    await row.getByRole('button', { name: /delete/i }).click();
    await expect(row).toBeHidden();
  }

  async toggleDarkMode() {
    await this.darkModeButton.click();
  }

  async openNotifications() {
    await this.notificationButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
