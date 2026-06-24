import { type Locator, type Page } from '@playwright/test';

export default class ArticlePreview {
  readonly page: Page;
  readonly articleTitle: string;

  readonly articlePreviewContainer: Locator;
  readonly articlePreviewDescription: Locator;
  readonly articlePreviewTitle: Locator;
  readonly articleFavoriteButton: Locator;
  readonly favoriteCount: Locator;
  readonly readMoreButton: Locator;

  constructor(page: Page, articleTitle: string) {
    this.page = page;
    this.articleTitle = articleTitle;

    this.articlePreviewContainer = page.locator('div.article-preview').filter({ has: page.getByRole('heading', { level: 1, name: articleTitle }) });
    this.articlePreviewDescription = this.articlePreviewContainer.locator('p');
    this.articlePreviewTitle = this.articlePreviewContainer.getByRole('heading', { level: 1 });
    this.articleFavoriteButton = this.articlePreviewContainer.locator('div.article-meta').getByRole('button');
    this.favoriteCount = this.articleFavoriteButton.locator('.counter');
    this.readMoreButton = this.articlePreviewContainer.getByText('Read more...');
  }

  async clickFavoriteButton() {
    await this.articleFavoriteButton.click();
  }

  async openPublishedArticlePage() {
    await this.readMoreButton.click();
  }

  async getNumberOfTimeArticleGotFavorited(): Promise<Number> {
    const string = await this.favoriteCount.textContent();
    const regex = /\d+/;
    const resultsArray = string?.match(regex);
    return Number(resultsArray && resultsArray.length > 0 ? resultsArray[0] : null);
  }
}