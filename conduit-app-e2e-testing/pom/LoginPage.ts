import { type Locator, type Page } from '@playwright/test';
import NavigationBar from './components/NavigationBar';

export default class LoginPage {
  readonly page: Page;

  readonly navigationBar: NavigationBar;

  readonly emailInputField: Locator;
  readonly passwordInputField: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navigationBar = new NavigationBar(page);

    this.emailInputField = page.getByRole('textbox', { name: 'Email' });
    this.passwordInputField = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('.error-messages li');
  }

  async goto() {
    await this.page.goto('/#/login');
  }

  async fillEmailInputField(email: string) {
    await this.emailInputField.fill(email);
  }

  async fillPasswordInputField(password: string) {
    await this.passwordInputField.fill(password);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmailInputField(email);
    await this.fillPasswordInputField(password);
    await this.clickLoginButton();
  }

  async getErrorMessages(): Promise<string[]> {
    return this.errorMessage.allTextContents();
  }
}