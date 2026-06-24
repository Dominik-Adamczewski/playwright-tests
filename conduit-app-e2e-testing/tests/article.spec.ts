import { test, expect } from '../fixtures/fixtures';
import { NewArticle } from '../types/conduit-types';
import { addNewArticleViaApi, deleteArticleViaApi } from '../helpers/article';
import { getTokenFromLocalStorage, getLoginToken } from '../helpers/authenthication';
import { existingUser } from '../helpers/global';
import { changeStringToSlug } from '../helpers/string';

let newArticle: NewArticle = {
  title: '',
  description: '',
  content: '',
  tags: [],
};

test.describe('Published article test suite', () => {
  test.beforeEach(async ({ userLoggedInPage, request, publishedArticlePage }) => {
    newArticle = {
      title: `Test article ${Date.now()}`,
      description: 'This article is about testing',
      content: 'Lorem ipsum tests are the best tests in the world!',
      tags: ['Testing']
    };
    const token = await getTokenFromLocalStorage(userLoggedInPage);
    await addNewArticleViaApi(request, newArticle, token);

    const path = changeStringToSlug(newArticle.title);
    await publishedArticlePage.goto(path);
  });

  test.afterEach(async ({ request }) => {
    const token = await getLoginToken(request, existingUser.email, existingUser.password);
    await deleteArticleViaApi(request, token, newArticle.title);
  });

  test('It should delete created article via UI', async ({ homePage, publishedArticlePage }) => {
    // Act
    await publishedArticlePage.deleteArticle();
    // Assert
    await homePage.openGlobalFeed();
    await expect(homePage.getArticlePreviewComponent(newArticle.title).articlePreviewContainer).not.toBeVisible();
  });

  test('It should fail to edit the article if you remove all the data from the form', async ({ newArticlePage, publishedArticlePage }) => {
    // Arrange
    await publishedArticlePage.openArticleEditForm();
    // Act
    await newArticlePage.clearWholeForm();
    // Assert
    expect(newArticlePage.page).not.toHaveURL('/article/');
  });

  test('It should update article title', async ({ newArticlePage, publishedArticlePage }) => {
    const newTitle = 'Changed title ' + Date.now();
    // Arrange
    await publishedArticlePage.openArticleEditForm();
    // Act
    await newArticlePage.editTitle(newTitle);
    // Assert
    await expect(publishedArticlePage.articleHeading).toHaveText(newTitle);
  });

  test('It should update article description', async ({ homePage, newArticlePage, publishedArticlePage }) => {
    const newDescription = 'Changed description ' + Date.now();
    // Arrange
    await publishedArticlePage.openArticleEditForm();
    // Act
    await newArticlePage.editDescription(newDescription);
    await homePage.goto();
    await homePage.openGlobalFeed();
    const addedArticlePreview = homePage.getArticlePreviewComponent(newArticle.title);
    // Assert
    await expect(addedArticlePreview.articlePreviewDescription).toHaveText(newDescription);
  });

  test('It should update article content', async ({ newArticlePage, publishedArticlePage }) => {
    const newContent = 'Changed content ' + Date.now();
    // Arrange
    await publishedArticlePage.openArticleEditForm();
    // Act
    await newArticlePage.editBody(newContent);
    // Assert
    await expect(publishedArticlePage.articleContent).toHaveText(newContent);
  });

  test('It should update article tag', async ({ newArticlePage, publishedArticlePage }) => {
    const newTag = ['TagChanged'];
    // Arrange
    await publishedArticlePage.openArticleEditForm();
    // Act
    await newArticlePage.editTags(newTag);
    // Assert
    await expect(publishedArticlePage.tag).toContainText(newTag);
  });

  test('It should add additional article tag', async ({ newArticlePage, publishedArticlePage }) => {
    const newTags = [...newArticle.tags!, 'NewTag'];
    // Arrange
    await publishedArticlePage.openArticleEditForm();
    // Act
    await newArticlePage.editTags(newTags);
    // Assert
    const tags = await publishedArticlePage.tag.allTextContents();
    console.log(tags);
    expect(tags).toContain('NewTag');
    expect(tags.length).toBe(2);
  });
});