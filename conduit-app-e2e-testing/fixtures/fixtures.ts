import { test as base } from '@playwright/test';
import { Page } from '@playwright/test';
import { loginViaAPI } from '../helpers/authenthication';
import { existingUser } from '../helpers/global';
import HomePage from '../pom/HomePage';
import LoginPage from '../pom/LoginPage';
import NewArticlePage from '../pom/NewArticlePage';
import PublishedArticlePage from '../pom/PublishedArticlePage';
import SignupPage from '../pom/SignupPage';
import UserProfilePage from '../pom/UserProfilePage';
import UserSettingsPage from '../pom/UserSettingsPage';

type MyFixtures = {
  userLoggedInPage: Page,
  homePage: HomePage,
  loginPage: LoginPage,
  newArticlePage: NewArticlePage,
  publishedArticlePage: PublishedArticlePage,
  signupPage: SignupPage,
  userProfilePage: UserProfilePage,
  userSettingsPage: UserSettingsPage
};

export const test = base.extend<MyFixtures>({
  userLoggedInPage: async ({ page, request }, use) => {
    await loginViaAPI(page, request, existingUser.email, existingUser.password);
    await page.goto('/#/');

    await use(page);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  newArticlePage: async ({ userLoggedInPage }, use) => {
    await use(new NewArticlePage(userLoggedInPage));
  },

  publishedArticlePage: async ({ userLoggedInPage }, use) => {
    await use(new PublishedArticlePage(userLoggedInPage));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  userProfilePage: async ({ userLoggedInPage }, use) => {
    await use(new UserProfilePage(userLoggedInPage));
  },

  userSettingsPage: async ({ userLoggedInPage }, use) => {
    await use(new UserSettingsPage(userLoggedInPage));
  }
});
export { expect } from '@playwright/test';