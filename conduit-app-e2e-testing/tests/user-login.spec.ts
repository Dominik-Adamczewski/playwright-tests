import { test, expect } from '../fixtures/fixtures';
import { existingUser } from '../helpers/global';
import type { User } from '../types/conduit-types';
import { waitForRequestToFinish } from '../helpers/request';

const testUser: User = {
  username: `TestUser ${Date.now()}`,
  email: `testuser+${Date.now()}@example.com`,
  password: 'password'
}

test.describe('User login page test suite', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('It should fail to login the user when submitting empty form', async ({ page, loginPage }) => {
    // Act
    await loginPage.clickLoginButton();
    // Assert
    await expect(page).toHaveURL('/#/login');
  });

  test('It should fail to login the user when submitting the form with only email filled in', async ({ page, loginPage }) => {
    // Arrange
    await loginPage.fillEmailInputField(testUser.email);
    // Act
    await loginPage.clickLoginButton();
    // Assert
    await expect(page).toHaveURL('/#/login');
  });

  test('It should fail to login the user when submitting the form with only password filled in', async ({ page, loginPage }) => {
    // Arrange
    await loginPage.fillPasswordInputField(testUser.password);
    // Act
    await loginPage.clickLoginButton();
    // Assert
    await expect(page).toHaveURL('/#/login');
  });

  test('It should fail to login the user when submitting the form with wrong password', async ({ page, loginPage }) => {
    // Arrange
    await loginPage.fillEmailInputField(existingUser.email);
    await loginPage.fillPasswordInputField(testUser.password);
    // Act
    await waitForRequestToFinish(page, '/api/users/login', 422, () => loginPage.clickLoginButton());
    // Assert
    const errorMessages = await loginPage.getErrorMessages();
    expect(errorMessages).toContain('Wrong email/password combination');
  });

  test('It should fail to login the user when submitting the form with wrong email', async ({ page, loginPage }) => {
    // Arrange
    await loginPage.fillEmailInputField(testUser.email);
    await loginPage.fillPasswordInputField(existingUser.password);
    // Act
    await waitForRequestToFinish(page, '/api/users/login', 404, () => loginPage.clickLoginButton());
    // Assert
    const errorMessages = await loginPage.getErrorMessages();
    expect(errorMessages).toContain('Email not found sign in first');
  });

  test('It should fail to login the user when submitting the form with wrong email and password', async ({ page, loginPage }) => {
    // Arrange
    await loginPage.fillEmailInputField(testUser.email);
    await loginPage.fillPasswordInputField(testUser.password);
    // Act
    await waitForRequestToFinish(page, '/api/users/login', 404, () => loginPage.clickLoginButton());
    // Assert
    const errorMessages = await loginPage.getErrorMessages();
    expect(errorMessages).toContain('Email not found sign in first');
  });

  test('It should login the user when submitting correct email and password', async ({ page, loginPage }) => {
    // Arrange
    await loginPage.fillEmailInputField(existingUser.email);
    await loginPage.fillPasswordInputField(existingUser.password);
    // Act
    await loginPage.clickLoginButton();
    // Assert
    await expect(loginPage.navigationBar.userAvatar).toBeVisible();
    const userName = await loginPage.navigationBar.getUserName();
    expect(userName).toBe(existingUser.username);
  });
});