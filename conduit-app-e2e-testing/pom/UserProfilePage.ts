import { type Locator, type Page } from '@playwright/test';
import ArticlePreview from './components/ArticlePreview';
import { waitForRequestToFinish } from '../helpers/request';
import NavigationBar from './components/NavigationBar';

export default class UserProfilePage {
  readonly page: Page;

  readonly navigationBar: NavigationBar;

  readonly myArticlesSection: Locator;
  readonly favoritedArticlesSection: Locator;
  readonly userAvatarImage: Locator;
  readonly userBio: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navigationBar = new NavigationBar(page);

    this.myArticlesSection = this.page.getByRole('link', { name: 'My Articles' });
    this.favoritedArticlesSection = this.page.getByRole('link', { name: 'Favorited Articles' });
    this.userAvatarImage = this.page.locator('div.user-info').getByRole('img');
    this.userBio = this.page.locator('div.user-info').getByRole('paragraph');
  }

  getArticlePreviewComponent(articleTitle: string): ArticlePreview {
    return new ArticlePreview(this.page, articleTitle);
  }

  async goto(userName: string) {
    await this.page.goto(`/#/profile/${userName}`);
  }

  async openMyArticlesSection() {
    await this.myArticlesSection.click();
  }
  
  async openFavoritedArticlesSection() {
    await waitForRequestToFinish(this.page, '/api/articles', 200, () => this.favoritedArticlesSection.click());
  }
}