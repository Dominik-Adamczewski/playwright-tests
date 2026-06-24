import { test, expect } from '../fixtures/fixtures';
import { existingUser } from '../helpers/global';
import type { User } from '../types/conduit-types';

const testUser: User = {
  username: `TestUser ${Date.now()}`,
  email: `testuser+${Date.now()}@example.com`,
  password: 'password'
}

test.describe('User signup test suite', () => {
  test.beforeEach(async ({ signupPage }) => {
    await signupPage.goto();
  });

  test('It should fail to signup user with empty form', async ({ page, signupPage }) => {
    // Act
    await signupPage.clickSignupButton();
    // Assert
    await expect(page).toHaveURL('/#/register');
  });

  test('It should fail to signup user with empty email and password', async ({ page, signupPage }) => {
    // Arrange
    await signupPage.fillUsernameInputField(testUser.username);
    // Act
    await signupPage.clickSignupButton();
    // Assert
    await expect(page).toHaveURL('/#/register');
  });

  test('It should fail to signup user with empty password', async ({ page, signupPage }) => {
    // Arrange
    await signupPage.fillUsernameInputField(testUser.username);
    await signupPage.fillEmailInputField(testUser.email);
    // Act
    await signupPage.clickSignupButton();
    // Assert
    await expect(page).toHaveURL('/#/register');  
  });

  test('It should fail to signup user with invalid email', async ({ page, signupPage }) => {
    // Act
    await signupPage.signup(testUser.username, 'test', testUser.password);
    // Assert
    await expect(page).toHaveURL('/#/register');   
  });

  test('It should fail to signup already existing user', async ({ signupPage }) => {
    // Act
    await signupPage.signup(testUser.username, existingUser.email, existingUser.password);
    // Assert
    const errorMessages = await signupPage.getErrorMessages();
    expect(errorMessages).toContain('Email already exists.. try logging in');
  });

  test('It should successfully signup new user with correct data', async ({ signupPage }) => {
    // Act
    await signupPage.signup(testUser.username, testUser.email, testUser.password);
    // Assert
    await expect(signupPage.navigationBar.userAvatar).toBeVisible();
    const userName = await signupPage.navigationBar.getUserName();
    expect(userName).toBe(testUser.username);
  });

  test('It should redirect to login page after clicking link from signup page', async ({ page, signupPage }) => {
    // Act
    await signupPage.clickLoginPageLink();
    // Assert
    expect(page.url()).toBe('http://localhost:3000/#/login');
  });
});