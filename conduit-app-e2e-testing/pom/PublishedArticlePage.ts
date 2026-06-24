import { type Locator, type Page } from '@playwright/test';
import CommentCard from './components/CommentCard';
import NavigationBar from './components/NavigationBar';

export default class PublishedArticlePage {
  readonly page: Page;

  readonly navigationBar: NavigationBar;

  readonly articleHeading: Locator;
  readonly articleContent: Locator;
  readonly articleActionsContainer: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly content: Locator;
  readonly tagsList: Locator;
  readonly tag: Locator;
  readonly addToFavoriteButton: Locator;
  readonly favoriteCount: Locator;
  readonly commentForm: Locator;
  readonly newCommentTextarea: Locator;
  readonly postCommentButton: Locator;
  readonly commentAuthor: Locator;
  readonly addedComment: Locator;
  readonly noCommentsText: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navigationBar = new NavigationBar(page);

    this.articleHeading = page.getByRole('heading', { level: 1 });
    this.articleContent = page.locator('div.article-content p');
    this.articleActionsContainer = page.locator('.article-actions');
    this.deleteButton = this.articleActionsContainer.getByRole('button', { name: 'Delete article' });
    this.editButton = this.articleActionsContainer.getByRole('button', { name: 'Edit article' });
    this.content = page.locator('div.article-content');
    this.tagsList = page.locator('ul.tag-list');
    this.tag = this.tagsList.locator('li.tag-pill');
    this.addToFavoriteButton = this.articleActionsContainer.getByRole('button', { name: 'Favorite' });
    this.favoriteCount = this.addToFavoriteButton.locator('span.counter');
    this.commentForm = page.locator('form.comment-form');
    this.newCommentTextarea = this.commentForm.getByRole('textbox');
    this.postCommentButton = this.commentForm.getByRole('button', { name: 'Post Comment' });
    this.commentAuthor = page.locator('a.comment-author').last();
    this.addedComment = page.locator('div.card:not(.comment-form)');
    this.noCommentsText = page.getByText('There are no comments yet...');
  }

  getCommentCard(authorName: string): CommentCard {
    return new CommentCard(this.page, authorName);
  }

  async goto(articleSlug: string) {
    await this.page.goto(`/#/article/${articleSlug}`);
  }

  async openArticleEditForm() {
    await this.editButton.click();
  }

  async deleteArticle() {
    this.page.on('dialog', dialog => dialog.accept());
    await this.deleteButton.click();
  }

  async addToFavorite() {
    await this.addToFavoriteButton.click();
  }

  async clickPostCommentButton() {
    await this.postCommentButton.click();
  }

  async writeArticleComment(comment: string) {
    await this.newCommentTextarea.fill(comment);
    await this.clickPostCommentButton();
  }

  async waitForArticleHeadingToBeVisible() {
    await this.articleHeading.waitFor({ state: 'visible' });
  }

  async getFavoriteCount(): Promise<number> {
    const string = await this.favoriteCount.textContent();
    const regex = /\d+/;
    const resultsArray = string?.match(regex);
    return Number(resultsArray && resultsArray.length > 0 ? resultsArray[0] : null);
  }
}