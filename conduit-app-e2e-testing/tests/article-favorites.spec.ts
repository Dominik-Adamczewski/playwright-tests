import { test, expect } from '../fixtures/fixtures';
import { NewArticle } from '../types/conduit-types';
import { addNewArticleViaApi, deleteArticleViaApi, unfavoriteArticleViaApi } from '../helpers/article';
import { getLoginToken, getTokenFromLocalStorage } from '../helpers/authenthication';
import { existingUser } from '../helpers/global';
import { waitForRequestToFinish } from '../helpers/request';

let newArticle: NewArticle = {
  title: '',
  description: '',
  content: '',
  tags: [],
};

let articleCreated: boolean = false;

test.describe('Article favorites test suite', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Tests with a new article', () => {

    test.beforeEach(async ({ userLoggedInPage, request }) => {
      newArticle = {
        title: `Test article favorite ${Date.now()}`,
        description: 'Test article favorite description',
        content: 'Test article favorite content',
        tags: ['FavoriteArticles']
      };
      const token = await getTokenFromLocalStorage(userLoggedInPage);
      await addNewArticleViaApi(request, newArticle, token);
      articleCreated = true;
    });

    test.afterEach(async ({ request }) => {
      if (articleCreated) {
        const token = await getLoginToken(request, existingUser.email, existingUser.password);
        await deleteArticleViaApi(request, token, newArticle.title);
      }
    });

    test('It should add new article to favorites from articles list', async ({ userLoggedInPage, homePage, userProfilePage }) => {
      // Arrange
      await homePage.filterByPopularTag(newArticle.tags![0]);
      const articleComponent = homePage.getArticlePreviewComponent(newArticle.title);
      // Act
      await waitForRequestToFinish(userLoggedInPage, '/favorite', 200, () => articleComponent.clickFavoriteButton());
      // Assert
      const articleFavoriteCount = await articleComponent.getNumberOfTimeArticleGotFavorited();
      expect(articleFavoriteCount).toBe(1);

      const userName = await userProfilePage.navigationBar.getUserName();
      await userProfilePage.goto(userName);
      await userProfilePage.openFavoritedArticlesSection();

      await expect(articleComponent.articlePreviewTitle).toHaveText(newArticle.title);
    });

    test('It should remove new article from favorites from articles list', async ({ userLoggedInPage, homePage, userProfilePage }) => {
      // Arrange
      await homePage.filterByPopularTag(newArticle.tags![0]);
      const articleComponent = homePage.getArticlePreviewComponent(newArticle.title);
      await waitForRequestToFinish(userLoggedInPage, '/favorite', 200, () => articleComponent.clickFavoriteButton()); // add to favorites
      // Act
      await waitForRequestToFinish(userLoggedInPage, '/favorite', 200, () => articleComponent.clickFavoriteButton()); // remove from favorites
      // Assert
      const articleFavoriteCount = await articleComponent.getNumberOfTimeArticleGotFavorited();
      expect(articleFavoriteCount).toBe(0);

      const userName = await userProfilePage.navigationBar.getUserName();
      await userProfilePage.goto(userName);
      await userProfilePage.openFavoritedArticlesSection();

      await expect(articleComponent.articlePreviewTitle).not.toBeVisible();
    });
  });

  test.describe('Tests with an existing article', () => {
    const existingArticleSlug = 'lorem-ipsum-51';
    const existingArticleTitle = 'Lorem Ipsum 51';

    test.afterEach(async ({ request }) => {
      // Always reset favorite state after each test regardless of outcome
      const token = await getLoginToken(request, existingUser.email, existingUser.password);
      await unfavoriteArticleViaApi(request, token, existingArticleSlug);
    });

    test('It should add existing article to favorites from published article view', async ({ userLoggedInPage, publishedArticlePage, userProfilePage }) => {
      // Arrange
      await publishedArticlePage.goto(existingArticleSlug);
      // Act
      await waitForRequestToFinish(userLoggedInPage, '/favorite', 200, () => publishedArticlePage.addToFavorite());
      // Assert
      const favoriteCount = await publishedArticlePage.getFavoriteCount();
      expect(favoriteCount).toBeGreaterThanOrEqual(1);

      const userName = await publishedArticlePage.navigationBar.getUserName();
      await userProfilePage.goto(userName);
      await userProfilePage.openFavoritedArticlesSection();

      await expect(userProfilePage.getArticlePreviewComponent(existingArticleTitle).articlePreviewTitle)
        .toHaveText(existingArticleTitle);
    });

    test('It should remove existing article from favorites from published article view', async ({ userLoggedInPage, publishedArticlePage, userProfilePage }) => {
      // Arrange
      await publishedArticlePage.goto(existingArticleSlug);
      await waitForRequestToFinish(userLoggedInPage, '/favorite', 200, () => publishedArticlePage.addToFavorite());
      // Act
      await waitForRequestToFinish(userLoggedInPage, '/favorite', 200, () => publishedArticlePage.addToFavorite());
      // Assert
      const favoriteCount = await publishedArticlePage.getFavoriteCount();
      expect(favoriteCount).toBe(0);

      const userName = await publishedArticlePage.navigationBar.getUserName();
      await userProfilePage.goto(userName);
      await userProfilePage.openFavoritedArticlesSection();

      await expect(userProfilePage.getArticlePreviewComponent(existingArticleTitle).articlePreviewTitle)
        .not.toBeVisible();
    });
  });
});