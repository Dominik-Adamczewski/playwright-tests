import { test, expect } from '@playwright/test';
import { loginViaAPI, signupViaAPI } from '../helpers/authenthication';
import NavigationBar from '../pom/components/NavigationBar';

import type { User } from '../types/conduit-types';

let navigationBar: NavigationBar;

const testUser: User = {
  username: `TestUser ${Date.now()}`,
  email: `testuser+${Date.now()}@example.com`,
  password: 'password'
}

test.describe('Navigation Bar test suite (public pages)', () => {
  test.beforeEach(async ({ page }) => {
    navigationBar = new NavigationBar(page);
    await page.goto('/#/article/lorem-ipsum-37');
  });

  test('It should navigate to the home page when clicking on the "Home" link', async ({ page }) => {
    // Act
    await navigationBar.navigateToHomePage();
    // Assert
    await expect(page).toHaveURL('/#/');
  });

  test('It should navigate to home page when clicking on the website logo', async ({ page }) => {
    // Act
    await navigationBar.navigateToHomePageViaLogo();
    // Assert
    await expect(page).toHaveURL('/#/');
  });

  test('It should navigate to the Login page when clicking on the "Login" link', async ({ page }) => {
    // Act
    await navigationBar.navigateToLoginPage();
    // Assert
    await expect(page).toHaveURL('/#/login');
  });

  test('It should navigate to the Signup page when clicking on the "Signup" link', async ({ page }) => {
    // Act
    await navigationBar.navigateToSignupPage();
    // Assert
    await expect(page).toHaveURL('/#/register');
  });
});

test.describe('Navigation Bar test suite (private pages)', () => {
  test.beforeAll(async ({ request }) => {
    await signupViaAPI(request, testUser.username, testUser.email, testUser.password);
  });

  test.beforeEach(async ({ page, request }) => {
    navigationBar = new NavigationBar(page);
    await loginViaAPI(page, request, testUser.email, testUser.password);
    await page.goto('/#/article/lorem-ipsum-37');
  });

  test('It should navigate to the New Article page when clicking on the "New Article" link', async ({ page }) => {
    // Act
    await navigationBar.navigateToNewArticlePage();
    // Assert
    await expect(page).toHaveURL('/#/editor');
  });

  test('It should navigate to the Profile page when clicking on the "Profile" link', async ({ page }) => {
    // Act
    await navigationBar.navigateToProfilePage();
    // Assert
    const encodedUsername = encodeURIComponent(testUser.username);
    await expect(page).toHaveURL(`/#/profile/${encodedUsername}`);
  });

  test('It should navigate to the Settings page when clicking on the "Settings" link', async ({ page }) => {
    // Act
    await navigationBar.navigateToSettingsPage();
    // Assert
    await expect(page).toHaveURL('/#/settings');
  });
});