import { type Locator, type Page, expect } from '@playwright/test';
import ArticlePreview from './components/ArticlePreview';
import { waitForRequestToFinish } from '../helpers/request';
import NavigationBar from './components/NavigationBar';

export default class HomePage {
  readonly page: Page;

  readonly navigationBar: NavigationBar;

  readonly paginationComponent: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly globalFeedButton: Locator;
  readonly popularTagsSection: Locator;
  readonly popularTag: Locator;
  readonly firstArticleHeading: Locator;
  readonly lastArticleHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navigationBar = new NavigationBar(page);

    this.paginationComponent = page.getByRole('navigation', { name: 'pagination' });
    this.nextPageButton = this.paginationComponent.getByRole('button', { name: 'Next Page' });
    this.previousPageButton = this.paginationComponent.getByRole('button', { name: 'Previous Page' });
    this.globalFeedButton = page.getByRole('button', { name: 'Global Feed' });
    this.popularTagsSection = page.locator('div.tag-list');
    this.popularTag = this.popularTagsSection.locator('.tag-pill');
    this.firstArticleHeading = page.locator('div.article-preview').first().getByRole('heading', { level: 1 });
    this.lastArticleHeading = page.locator('div.article-preview').last().getByRole('heading', { level: 1 });
  }

  getArticlePreviewComponent(articleTitle: string): ArticlePreview {
    return new ArticlePreview(this.page, articleTitle);
  }

  async goto() {
    await this.page.goto('/#/');
  }

  async moveToNextPage() {
    await this.nextPageButton.click();
  }

  async moveToPreviousPage() {
    await this.previousPageButton.click();
  }

  async moveToConretePage(pageNumber: number) {
    const pageButton = this.paginationComponent.getByRole('button', { name: `Page ${pageNumber}` });
    await waitForRequestToFinish(this.page, '/api/articles', 200, () => pageButton.click());
    await expect(pageButton).toHaveAttribute('aria-current', 'page');
  }

  async openGlobalFeed() {
    await waitForRequestToFinish(this.page, '/api/articles', 200, () => this.globalFeedButton.click());
  }

  async filterByPopularTag(popularTag: string) {
    await this.popularTag.filter({ hasText: popularTag }).click();
  }
}