import { expect } from '@playwright/test';

export class LeadModalPage {
  constructor(page) {
    this.page = page;
    this.modal = page.getByRole('dialog');
    this.modalTitle = this.modal.getByRole('heading', { name: 'Lead Details' });
    this.statusSelect = this.modal.getByLabel('Status');
    this.sourceSelect = this.modal.getByLabel('Source');
    this.categorySelect = this.modal.getByLabel('Category');
    this.saveButton = this.modal.getByRole('button', { name: /save changes/i });
    this.deleteButton = this.modal.getByRole('button', { name: /delete/i });
    this.analyzeButton = this.modal.getByRole('button', { name: /analyze with ai|refresh analysis/i });
    this.generateEmailButton = this.modal.getByRole('button', { name: /generate email|regenerate/i });
  }

  async setStatus(status) {
    await this.statusSelect.selectOption(status);
  }

  async setCategory(category) {
    await this.categorySelect.selectOption(category);
  }

  async saveChanges() {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/leads/') && resp.request().method() === 'PATCH',
      { timeout: 5000 }
    ).catch(() => null);

    await this.saveButton.click();
    await responsePromise;
  }

  async runAIAnalysis() {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/analyze'),
      { timeout: 5000 }
    ).catch(() => null);

    await this.analyzeButton.click();
    await responsePromise;
  }

  async generateFollowUpEmail() {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/follow-up-email'),
      { timeout: 5000 }
    ).catch(() => null);

    await this.generateEmailButton.click();
    await responsePromise;
  }

  async addNote(noteText) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/notes'),
      { timeout: 5000 }
    ).catch(() => null);

    await this.modal.getByPlaceholder(/add an internal note/i).fill(noteText);
    await this.modal.getByRole('button', { name: /add note/i }).click();
    await responsePromise;
  }

  async uploadAttachment(filePayload) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/upload'),
      { timeout: 5000 }
    ).catch(() => null);

    const fileInput = this.modal.locator('input[type="file"]');
    await fileInput.setInputFiles(filePayload);
    await responsePromise;
  }

  async closeModal() {
    await this.page.evaluate(() => {
      const backdrop = document.querySelector('div.bg-black\\/60');
      if (backdrop) backdrop.click();
    });
    await expect(this.modal).toBeHidden();
  }
}
