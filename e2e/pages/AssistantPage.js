import { expect } from '@playwright/test';

export class AssistantPage {
  constructor(page) {
    this.page = page;
    this.input = page.getByPlaceholder(/ask about your leads/i);
    this.sendButton = page.getByRole('button', { name: /send/i });
  }

  async ask(message) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/ai/chat') && resp.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);

    await this.input.fill(message);
    await this.sendButton.click();
    await responsePromise;
  }

  async clickQuickPrompt(promptText) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/ai/chat') && resp.status() === 200,
      { timeout: 5000 }
    ).catch(() => null);

    const quickPromptBtn = this.page.locator('form').locator('..').getByRole('button', { name: promptText });
    await quickPromptBtn.click();
    await responsePromise;
  }
}
