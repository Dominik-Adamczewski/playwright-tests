import { APIRequestContext, expect } from "@playwright/test"
import { Page } from "@playwright/test";

const API_BASE_URL = 'http://localhost:3000';

const getLoginToken = async (requestFixture: APIRequestContext, email: string, password: string) => {
  const response = await requestFixture.post(`${API_BASE_URL}/api/users/login`, {
    data: { user: { email, password } }
  });
  expect(response.status()).toBe(200);
  const { user } = await response.json();
  return user.token;
};

const getTokenFromLocalStorage = async (page: Page): Promise<string> => {
  const token = await page.evaluate(() => {
    const stored = localStorage.getItem('loggedUser');
    return stored ? JSON.parse(stored).loggedUser.token : null;
  });

  if (!token) throw new Error('No auth token found in localStorage');
  return token;
};

const loginViaAPI = async (page: Page, requestFixture: APIRequestContext, email: string, password: string): Promise<void> => {
  const response = await requestFixture.post(`${API_BASE_URL}/api/users/login`, {
    data: { user: { email, password } }
  });
  const { user } = await response.json();

  await page.addInitScript((user) => {
    localStorage.setItem('loggedUser', JSON.stringify({
      headers: { Authorization: `Token ${user.token}` },
      isAuth: true,
      loggedUser: {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        token: user.token
      }
    }));
  }, user);
};

const signupViaAPI = async (requestFixture: APIRequestContext, username: string, email: string, password: string) => {
  const response = await requestFixture.post(`${API_BASE_URL}/api/users`, {
    data: {
      user: {
        username,
        email,
        password
      }
    }
  });
  expect(response.status()).toBe(201);
};

export { getLoginToken, getTokenFromLocalStorage, signupViaAPI, loginViaAPI }