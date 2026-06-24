import { type Locator, type Page } from '@playwright/test';
import NavigationBar from './components/NavigationBar';

export default class SignupPage {
  readonly page: Page;

  readonly navigationBar: NavigationBar;

  readonly usernameInputField: Locator;
  readonly emailInputField: Locator;
  readonly passwordInputField: Locator;
  readonly signupButton: Locator;
  readonly errorMessage: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navigationBar = new NavigationBar(page);

    this.usernameInputField = page.getByRole('textbox', { name: 'Your Name' });
    this.emailInputField = page.getByRole('textbox', { name: 'Email' });
    this.passwordInputField = page.getByRole('textbox', { name: 'Password' });
    this.signupButton = page.getByRole('button', { name: 'Sign up' });
    this.errorMessage = page.locator('ul.error-messages li');
    this.signInLink = page.locator('a').filter({ hasText: 'Sign in to your account' });
  }
  
  async goto() {
    await this.page.goto('/#/register');
  }

  async clickLoginPageLink() {
    await this.signInLink.click();
    await this.page.waitForURL('http://localhost:3000/#/login');
  }

  async fillUsernameInputField(username: string) {
    await this.usernameInputField.fill(username);
  }

  async fillEmailInputField(email: string) {
    await this.emailInputField.fill(email);
  }

  async fillPasswordInputField(password: string) {
    await this.passwordInputField.fill(password);
  }

  async clickSignupButton() {
    await this.signupButton.click();
  }

  async signup(username: string, email: string, password: string) {
    await this.fillUsernameInputField(username);
    await this.fillEmailInputField(email);
    await this.fillPasswordInputField(password);
    await this.clickSignupButton();
  }

  async getErrorMessages(): Promise<string[]> {
    return this.errorMessage.allTextContents();
  }
}