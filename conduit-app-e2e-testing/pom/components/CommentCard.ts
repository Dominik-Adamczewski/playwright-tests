import { type Locator, type Page } from '@playwright/test';

export default class CommentCard {
  readonly page: Page;
  readonly commentAuthor: string;

  readonly commentContainer: Locator;
  readonly commentText: Locator;
  readonly deleteCommentButton: Locator;

  constructor(page: Page, commentAuthor: string) {
    this.page = page;
    this.commentAuthor = commentAuthor;

    this.commentContainer = page
      .locator('.card')
      .filter({ has: page.locator('.comment-author', { hasText: commentAuthor }) });
    this.commentText = this.commentContainer.locator('p.card-text');  
    this.deleteCommentButton = this.commentContainer.locator('button.btn-outline-secondary');
  }

  async deleteComment() {
    this.page.on('dialog', dialog => dialog.accept());
    await this.deleteCommentButton.click();
  }
}