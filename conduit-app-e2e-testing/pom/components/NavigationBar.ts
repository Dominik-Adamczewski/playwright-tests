import { type Locator, type Page } from '@playwright/test';

export default class NavigationBar {
  readonly page: Page;
  readonly navbarContainer: Locator;

  readonly websiteLogo: Locator;
  readonly homeLink: Locator;
  readonly newArticleLink: Locator;
  readonly userAvatar: Locator;
  readonly userAvatarImage: Locator;
  readonly userName: Locator;
  readonly profileLink: Locator;
  readonly settingsLink: Locator;
  readonly logoutButton: Locator;
  readonly signupLink: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbarContainer = this.page.locator('nav.navbar');

    this.websiteLogo = this.navbarContainer.locator('a.navbar-brand');
    this.homeLink = this.navbarContainer.getByRole('link', { name: 'Home' });
    this.newArticleLink = this.navbarContainer.getByRole('link', { name: 'New Article' });
    this.userAvatar = this.navbarContainer.locator('li.nav-item.dropdown');
    this.userAvatarImage = this.userAvatar.getByRole('img');
    this.userName = this.userAvatar.locator('div.dropdown-toggle');
    this.profileLink = this.navbarContainer.getByRole('link', { name: 'Profile' });
    this.settingsLink = this.navbarContainer.getByRole('link', { name: 'Settings' });
    this.logoutButton = this.navbarContainer.getByRole('button', { name: 'Log out' });
    this.signupLink = this.navbarContainer.getByRole('link', { name: 'Sign up' });
    this.loginLink = this.navbarContainer.getByRole('link', { name: 'Login' });
  }

  async getUserName(): Promise<string> {
    return (await this.userName.textContent()) ?? '';
  }

  async navigateToHomePageViaLogo() {
    await this.websiteLogo.click();
  }

  async navigateToHomePage() {
    await this.homeLink.click();
  }

  async navigateToNewArticlePage() {
    await this.newArticleLink.click();
  }

  async navigateToProfilePage() {
    await this.userAvatar.click();
    await this.profileLink.click();
  }

  async navigateToSettingsPage() {
    await this.userAvatar.click();
    await this.settingsLink.click();
  }

  async logout() {
    await this.userAvatar.click();
    await this.logoutButton.click();
  }

  async navigateToSignupPage() {
    await this.signupLink.click();
  }

  async navigateToLoginPage() {
    await this.loginLink.click();
  }
}