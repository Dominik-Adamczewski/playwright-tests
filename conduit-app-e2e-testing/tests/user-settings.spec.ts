import { test, expect } from '../fixtures/fixtures';
import { existingUser } from '../helpers/global';

const freeImageUrl: string = 'https://freesvg.org/img/Male-Avatar.png';
const baseImagePath: string = '/src/assets/smiley-cyrus.jpeg';

test.describe('User settings test suite', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ userSettingsPage }) => {
    await userSettingsPage.goto();
  });
  
  test('It should add profile image', async ({ userLoggedInPage, userSettingsPage }) => {
    // Act
    await userSettingsPage.addProfilePicture(freeImageUrl);
    await userLoggedInPage.reload();
    // Assert
    await expect(userSettingsPage.navigationBar.userAvatarImage).toHaveAttribute('src', freeImageUrl);
  });

  test('It should remove profile image', async ({ userLoggedInPage, userSettingsPage }) => {
    // Arrange
    await userSettingsPage.addProfilePicture(freeImageUrl);
    await userLoggedInPage.reload();
    // Act
    await userSettingsPage.clearProfilePicture();
    // Assert
    await expect(userSettingsPage.navigationBar.userAvatarImage).toHaveAttribute('src', baseImagePath);
  });

  test('It should change user name', async ({ userSettingsPage }) => {
    // Arrange
    const newUserName = 'User edited' + Date.now();
    // Act
    await userSettingsPage.updateUserName(newUserName);
    // Assert
    await expect(userSettingsPage.navigationBar.userName).toHaveText(newUserName);
    // Cleanup
    await userSettingsPage.updateUserName(existingUser.username);
    await expect(userSettingsPage.navigationBar.userName).toHaveText(existingUser.username);
  });

  test('It should add bio about the user to the profile', async ({ userSettingsPage, userProfilePage }) => {
    // Arrange
    const bio = 'This is my Bio';
    // Act
    await userSettingsPage.updateUserBio(bio);
    // Assert
    await userSettingsPage.navigationBar.navigateToProfilePage();
    await expect(userProfilePage.userBio).toHaveText(bio);
    // Cleanup
    await userSettingsPage.goto();
    await userSettingsPage.clearUserBio();
  });
});