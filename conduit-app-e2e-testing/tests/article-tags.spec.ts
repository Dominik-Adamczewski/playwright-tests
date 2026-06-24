import { test, expect } from '../fixtures/fixtures';
import { NewArticle } from '../types/conduit-types';
import { addNewArticleViaApi, deleteArticleViaApi } from '../helpers/article';
import { getLoginToken } from '../helpers/authenthication';
import { existingUser } from '../helpers/global';
import { waitForRequestToFinish } from '../helpers/request';

const newArticle: NewArticle = {
  title: `Test article ${Date.now()}`,
  description: 'Test article description',
  content: 'Test article content',
  tags: ['TestArticles']
};

test.describe('Article tags test suite', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async ({ request }) => {
    const token = await getLoginToken(request, existingUser.email, existingUser.password);
    await addNewArticleViaApi(request, newArticle, token);
  });

  test.afterAll(async ({ request }) => {
    const token = await getLoginToken(request, existingUser.email, existingUser.password);
    await deleteArticleViaApi(request, token, newArticle.title);
  });

  test('It should add the tag to "Popular tags" section after adding article with new tag', async ({ userLoggedInPage, homePage }) => {
    // Arrange
    await waitForRequestToFinish(userLoggedInPage, '/api/tags', 200, () => homePage.goto());
    // Assert
    await expect(homePage.popularTag.filter({ hasText: newArticle.tags![0] })).toBeVisible();
  });

  test('It should display newly added article, after filtering by its tag', async ({ userLoggedInPage, homePage }) => {
    // Arrange
    await waitForRequestToFinish(userLoggedInPage, '/api/tags', 200, () => homePage.goto());
    // Act
    await waitForRequestToFinish(userLoggedInPage, '/api/articles', 200, () => homePage.filterByPopularTag(newArticle.tags![0]));
    // Assert
    const articlePreview = homePage.getArticlePreviewComponent(newArticle.title);
    await expect(articlePreview.articlePreviewTitle).toHaveText(newArticle.title);
  });
});
