import { type Locator, type Page } from '@playwright/test';
import { NewArticle } from '../types/conduit-types';
import NavigationBar from './components/NavigationBar';
import { waitForRequestToFinish } from '../helpers/request';

export default class NewArticlePage {
  readonly page: Page;
  readonly navigationBar: NavigationBar;

  readonly articleTitleInputField: Locator;
  readonly articleDescriptionInputField: Locator;
  readonly articleBodyTextarea: Locator;
  readonly articleTagsInputField: Locator;
  readonly publishArticleButton: Locator;
  readonly updateArticleButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navigationBar = new NavigationBar(page);

    this.articleTitleInputField = page.getByRole('textbox', { name: 'title' });
    this.articleDescriptionInputField = page.getByPlaceholder("What's this article about?");
    this.articleBodyTextarea = page.getByPlaceholder("Write your article (in markdown)");
    this.articleTagsInputField = page.getByRole('textbox', { name: 'tags' });
    this.publishArticleButton = page.getByRole('button', { name: 'Publish Article' });
    this.updateArticleButton = page.getByRole('button', { name: 'Update Article' });
    this.errorMessage = page.locator('span.error-messages');
  }

  async goto() {
    await this.page.goto('/#/editor');
  }

    async clearField(locator: Locator) {
    await locator.click({ clickCount: 2 });
    await this.page.keyboard.press('Backspace');
  }

  async fillTitle(title: string) {
    await this.articleTitleInputField.fill(title);
  }

  async fillDescription(description: string) {
    await this.articleDescriptionInputField.fill(description);
  }

  async fillBody(body: string) {
    await this.articleBodyTextarea.fill(body);
  }

  async fillTags(tags: string[]) {
    for (const tag of tags) {
      await this.articleTagsInputField.pressSequentially(tag);
      await this.page.keyboard.press('Space');
    }
  }

  async clickPublishArticleButton() {
    await this.publishArticleButton.click();
  }

  async submitUpdate() {
    await this.updateArticleButton.click();
    await this.updateArticleButton.waitFor({ state: 'hidden' });
  }

  async publishArticle(article: NewArticle, statusCode: number = 201) {
    await this.fillTitle(article.title);
    await this.fillDescription(article.description);
    await this.fillBody(article.content);
    if (article.tags) {
      await this.fillTags(article.tags);
    }
    await waitForRequestToFinish(
      this.page,
      '/api/articles',
      statusCode,
      () => this.publishArticleButton.click(),
    );
  }

  async editTitle(newTitle: string) {
    await this.clearField(this.articleTitleInputField);
    await this.fillTitle(newTitle);
    await this.submitUpdate();
  }

  async editDescription(newDescription: string) {
    await this.clearField(this.articleDescriptionInputField);
    await this.fillDescription(newDescription);
    await this.submitUpdate();
  }

  async editBody(newBody: string) {
    await this.clearField(this.articleBodyTextarea);
    await this.fillBody(newBody);
    await this.submitUpdate();
  }

  async editTags(newTags: string[]) {
    await this.clearField(this.articleTagsInputField);
    await this.fillTags(newTags);
    await this.submitUpdate();
  }

  async clearWholeForm() {
    await this.clearField(this.articleTitleInputField);
    await this.clearField(this.articleDescriptionInputField);
    await this.clearField(this.articleTagsInputField);
    await this.clearField(this.articleBodyTextarea);
  }

  async getErrorMessages() {
    return this.errorMessage.allTextContents();
  }
}