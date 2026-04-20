import { test, expect } from '@playwright/test';
import { membersBaseUrl, boardsBaseUrl } from '../config/paths';

const apiKey = process.env.TRELLO_API_KEY as string;
const token = process.env.TRELLO_TOKEN as string;

let playwrightTestingBoardId: string = '';

test.describe('Trello API - Members', () => {
  test('GET all open boards', async ({ request }) => {
    const response = await request.get(membersBaseUrl, {
      params: { key: apiKey, token: token, filter: 'open' }
    });
    const body = await response.json();
    console.log(body);
    expect(response.status()).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].name).toBe('playwright-api-testing');
  });

  test('GET all closed boards', async ({ request }) => {
    const response = await request.get(membersBaseUrl, {
      params: { key: apiKey, token: token, filter: 'closed' }
    });
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body[0].name).toBe('Moja tablica Trello');
  });
});

test.describe('Trello API - Boards', () => {
  test.describe.configure({ mode: 'serial' });
  test('It should Create Completely new board', async ({ request}) => {
    const boardName = 'Playwright-Completely-New-Board';
    const response = await request.post(`${boardsBaseUrl}`, {
      params: { key: apiKey, token: token, name: boardName }
    })

    const body = await response.json();
    playwrightTestingBoardId = body.id;

    expect(response.status()).toBe(200);
    expect(body.name).toBe(boardName);
  });

  test('It should Get board by id', async ({ request }) => {
    const response = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.name).toBe('Playwright-Completely-New-Board');
  });

  test('It should return 400 error for non existing board id', async ({ request }) => {
    const response = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}123`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(400);
    expect(await response.text()).toBe('invalid id');
  });

  test('It should Update board name', async ({ request }) => {
    const currentNameGetRequest = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    const currentName = (await currentNameGetRequest.json()).name;
    const timestamp = Date.now();

    const response = await request.put(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token, name: `${currentName}-${timestamp}` }
    });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    const body = await getResponse.json();
    expect(getResponse.status()).toBe(200);
    expect(body.name).toBe(`${currentName}-${timestamp}`);
  });

  test('It should not update board name without name provided', async ({ request }) => {
    const getResponse = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    const currentName = (await getResponse.json()).name;
    const response = await request.put(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.name).toBe(currentName);
  });

  test('It should Update board description', async ({ request }) => {
    const newDescription = `This is a new description with timestamp ${Date.now()}`;
    const response = await request.put(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token, desc: newDescription }
    });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    const body = await getResponse.json();
    expect(getResponse.status()).toBe(200);
    expect(body.desc).toBe(newDescription);
  });

  test('It should delete board', async ({ request }) => {
    const response = await request.delete(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}`, {
      params: { key: apiKey, token: token }
    });
    expect(getResponse.status()).toBe(404);
  });

  test('It should not create board without name provided', async ({ request }) => {
    const response = await request.post(`${boardsBaseUrl}`, {
      params: { key: apiKey, token: token }
    });
    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.message).toBe('invalid value for name');
  });
});