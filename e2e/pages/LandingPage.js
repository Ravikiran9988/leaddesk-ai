import { expect } from '@playwright/test';

export class LandingPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.budgetSelect = page.getByLabel('Budget');
    this.sourceSelect = page.getByLabel('How did you hear about us?');
    this.messageInput = page.getByLabel('Project Brief');
    this.submitButton = page.getByRole('button', { name: /submit lead/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async submitLead({ name, email, budget = 'Above $5000', source = 'Website', message = 'Interested in AI LeadDesk' }) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    if (budget) await this.budgetSelect.selectOption(budget);
    if (source) await this.sourceSelect.selectOption(source);
    await this.messageInput.fill(message);

    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/leads') && resp.request().method() === 'POST' && resp.status() === 201,
      { timeout: 5000 }
    ).catch(() => null);

    await this.submitButton.click();
    await responsePromise;
  }
}
