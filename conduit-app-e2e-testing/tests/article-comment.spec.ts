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

test.describe('Article comment test suite', () => {
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

  test('It should fail to add an empty comment', async ({ publishedArticlePage }) => {
    // Act
    await publishedArticlePage.clickPostCommentButton();
    // Assert
    await expect(publishedArticlePage.noCommentsText).toBeVisible();
  });

  test('It should add new comment', async ({ publishedArticlePage }) => {
    const articleComment = 'I do like this article!';
    // Arrange
    await publishedArticlePage.writeArticleComment(articleComment);
    // Act
    await publishedArticlePage.clickPostCommentButton();
    // Assert
    const userName = await publishedArticlePage.navigationBar.getUserName();
    const addedComment = publishedArticlePage.getCommentCard(userName);
    await expect(addedComment.commentText).toHaveText(articleComment);
  });

  test('It should delete newly added comment', async ({ publishedArticlePage }) => {
    const articleComment = 'I do not like this article!';
    // Arrange
    await publishedArticlePage.writeArticleComment(articleComment);
    await publishedArticlePage.clickPostCommentButton();
    const userName = await publishedArticlePage.navigationBar.getUserName();
    const addedComment = publishedArticlePage.getCommentCard(userName);
    // Act
    await addedComment.deleteComment();
    // Assert
    await expect(addedComment.commentContainer).not.toBeVisible();
    await expect(publishedArticlePage.noCommentsText).toBeVisible();
  });
});