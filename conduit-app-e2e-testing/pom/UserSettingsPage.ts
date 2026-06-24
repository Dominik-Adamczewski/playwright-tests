import { type Locator, type Page } from '@playwright/test';
import NavigationBar from './components/NavigationBar';
import { waitForRequestToFinish } from '../helpers/request';

export default class UserSettingsPage {
  readonly page: Page;

  readonly navigationBar: NavigationBar;

  readonly profilePictureUrlInputField: Locator;
  readonly usernameInputField: Locator;
  readonly bioTextarea: Locator;
  readonly emailInputField: Locator;
  readonly passwordInputField: Locator;
  readonly updateSettingsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navigationBar = new NavigationBar(page);
    
    this.profilePictureUrlInputField = page.getByRole('textbox', { name: 'URL of profile picture' });
    this.usernameInputField = page.getByRole('textbox', { name: 'Your Name' });
    this.bioTextarea = page.getByRole('textbox', { name: 'bio' });
    this.emailInputField = page.getByRole('textbox', { name: 'email' });
    this.passwordInputField = page.getByRole('textbox', { name: 'password' });
    this.updateSettingsButton = page.getByRole('button', { name: 'Update Settings' });
  }

  private async clickUpdateSettingsButton() {
    await this.updateSettingsButton.click();
  }

  async goto() {
    await this.page.goto('/#/settings');
  }

  async addProfilePicture(profilePictureUrl: string) {
    await this.profilePictureUrlInputField.fill(profilePictureUrl);
    await waitForRequestToFinish(this.page, '/user', 200, async () => { await this.clickUpdateSettingsButton(); });
  }

  async clearProfilePicture() {
    await this.profilePictureUrlInputField.click({ clickCount: 3 });
    await this.page.keyboard.press('Delete');
    await waitForRequestToFinish(this.page, '/user', 200, async () => { await this.clickUpdateSettingsButton(); });
  }

  async clearUserBio() {
    await this.bioTextarea.click({ clickCount: 3 });
    await this.page.keyboard.press('Delete');
    await waitForRequestToFinish(this.page, '/user', 200, async () => { await this.clickUpdateSettingsButton(); });
  }

  async updateUserName(username: string) {
    await this.usernameInputField.fill(username);
    await waitForRequestToFinish(this.page, '/user', 200, async () => { await this.clickUpdateSettingsButton(); });
  }

  async updateUserBio(bio: string) {
    await this.bioTextarea.fill(bio);
    await waitForRequestToFinish(this.page, '/user', 200, async () => { await this.clickUpdateSettingsButton(); });
  }
}