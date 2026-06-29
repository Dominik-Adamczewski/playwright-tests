import { test, expect } from '../fixtures/fixtures';
import { NewArticle } from '../types/conduit-types';
import { addNewArticleViaApi, deleteArticleViaApi } from '../helpers/article';
import { getTokenFromLocalStorage } from '../helpers/authenthication';
import { getLoginToken } from '../helpers/authenthication';
import { existingUser } from '../helpers/global';

const articlesToClean: string[] = [];

let newArticle: NewArticle = {
  title: '',
  description: '',
  content: '',
  tags: [],
};

test.describe('New article test suite', () => {
  test.beforeEach(async ({ newArticlePage }) => {
    newArticle = {
      title: `Test article ${Date.now()}`,
      description: 'This article is about testing',
      content: 'Lorem ipsum tests are the best tests in the world!',
      tags: ['Testing']
    };

    await newArticlePage.goto();
  });

  test('It should not publish new article without filling in the form', async ({ newArticlePage }) => {
    // Act
    await newArticlePage.clickPublishArticleButton();
    // Assert
    await expect(newArticlePage.page).not.toHaveURL('/article');
  });

  test('It should not publish new article with only title filled in', async ({ newArticlePage }) => {
    // Arrange
    await newArticlePage.fillTitle(newArticle.title);
    // Act
    await newArticlePage.clickPublishArticleButton();
    // Assert
    await expect(newArticlePage.page).not.toHaveURL('/article');
  });

  test('It should not publish new article with only title and description filled in', async ({ newArticlePage }) => {
    // Arrange
    await newArticlePage.fillTitle(newArticle.title);
    await newArticlePage.fillDescription(newArticle.description);
    // Act
    await newArticlePage.clickPublishArticleButton();
    // Assert
    await expect(newArticlePage.page).not.toHaveURL('/article');
  });

  test('It should validate creating article with existing name', async ({ userLoggedInPage, request, newArticlePage }) => {
    // Arrange
    const existingArticle: NewArticle = {
      title: 'Existing article',
      description: 'This is article which already exists',
      content: 'Existing!',
      tags: ['exisintgArticle']
    };
    const token = await getTokenFromLocalStorage(userLoggedInPage);
    articlesToClean.push(existingArticle.title);

    await addNewArticleViaApi(request, existingArticle, token);
    // Act
    await newArticlePage.publishArticle(existingArticle, 422);
    // Assert
    const errorMessages = await newArticlePage.getErrorMessages();
    expect(errorMessages).toContain('Title already exists.. ');
  });

  test('It should publish new article with only title, description and contnt filled in', async ({ newArticlePage, publishedArticlePage }) => {
    // Arrange
    const articleWithMinimumContent: NewArticle = {
        title: 'Min content article' + Date.now(),
        description: 'Min content article description',
        content: 'This is a min content article',
    }
    articlesToClean.push(articleWithMinimumContent.title);
    // Act
    await newArticlePage.publishArticle(articleWithMinimumContent);
    await publishedArticlePage.waitForArticleHeadingToBeVisible();
    // Assert
    expect(await publishedArticlePage.articleHeading.textContent()).toEqual(articleWithMinimumContent.title);
    expect(await publishedArticlePage.articleContent.textContent()).toEqual(articleWithMinimumContent.content);
  });

  test('It should publish new article with all information filled in', async ({ newArticlePage, publishedArticlePage }) => {
    // Arrange
    articlesToClean.push(newArticle.title);
    // Act
    await newArticlePage.publishArticle(newArticle);
    await publishedArticlePage.waitForArticleHeadingToBeVisible();

    // Assert
    expect(await publishedArticlePage.articleHeading.textContent()).toEqual(newArticle.title);
    expect(await publishedArticlePage.articleContent.textContent()).toEqual(newArticle.content);
    for (const tag of newArticle.tags!) {
      const allTags = await publishedArticlePage.tag.allTextContents();
      expect(allTags).toContain(tag);
    }
  });

  test.afterAll(async ({ request }) => {
    const token = await getLoginToken(request, existingUser.email, existingUser.password);
    for (const title of articlesToClean) {
      await deleteArticleViaApi(request, token, title);
    }
  });
});