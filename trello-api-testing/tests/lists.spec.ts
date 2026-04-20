import { test, expect } from '@playwright/test';
import { boardsBaseUrl, listsBaseUrl, membersBaseUrl } from '../config/paths';

const apiKey = process.env.TRELLO_API_KEY as string;
const token = process.env.TRELLO_TOKEN as string;

let playwrightTestingBoardId: string = '';
let playwrightTestingListId: string = '';

test.describe('Trello API - Lists', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    if (!playwrightTestingBoardId) {
      const response = await request.get(membersBaseUrl, {
        params: { key: apiKey, token: token, filter: 'open' }
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      const boardData = body.find((board: { name: string }) => board.name === 'Playwright-Lists-Test-Board');
      if (boardData) {
        playwrightTestingBoardId = boardData.id;
      }
    }
  });

  test('It should Create New list on the board', async ({ request }) => {
    const listName = 'Playwright-Test-List';
    const response = await request.post(`${listsBaseUrl}`, {
      params: { key: apiKey, token: token, name: listName, idBoard: playwrightTestingBoardId }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    playwrightTestingListId = body.id;
    expect(body.name).toBe(listName);
    expect(body.idBoard).toBe(playwrightTestingBoardId);
  });

  test('It should return 400 error for creating list with missing name', async ({ request }) => {
    const response = await request.post(`${listsBaseUrl}`, {
      params: { key: apiKey, token: token, idBoard: playwrightTestingBoardId }
    });
    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('invalid value for name');
    expect(await response.text()).toContain('BAD_REQUEST_ERROR');
  });

  test('It should get newly created list by id', async ({ request }) => {
    const response = await request.get(`${listsBaseUrl}/${playwrightTestingListId}`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('Playwright-Test-List');
    expect(body.id).toBe(playwrightTestingListId);
  });

  test('It should return 400 error for non existing list id', async ({ request }) => {
    const response = await request.get(`${listsBaseUrl}/${playwrightTestingListId}123`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(400);
    expect(await response.text()).toBe('invalid id');
  });

  test('It should update list name', async ({ request }) => {
    const newName = 'Updated-List-Name-' + new Date().getTime();
    const response = await request.put(`${listsBaseUrl}/${playwrightTestingListId}`, {
      params: { key: apiKey, token: token, name: newName }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe(newName);
  });

  test('It should archive the list', async ({ request }) => {
    const response = await request.put(`${listsBaseUrl}/${playwrightTestingListId}/closed`, {
      params: { key: apiKey, token: token, value: 'true' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.closed).toBe(true);
  });
});

test.describe('Trello API - Lists - Creating multiple lists', () => {
  const multipleLists = ['Playwright-Test-List-1', 'Playwright-Test-List-2', 'Playwright-Test-List-3'];

  test.describe.configure({ mode: 'serial' });

  test('It should create multiple lists on the board', async ({ request }) => {
    for (const list of multipleLists) {
      const response = await request.post(`${listsBaseUrl}`, {
        params: { key: apiKey, token: token, name: list, idBoard: playwrightTestingBoardId }
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.name).toBe(list);
    }
  });
  test('It should get all lists on the board', async ({ request }) => {
    const response = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}/lists`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.length).toBe(multipleLists.length);
    const listNames = body.map((list: any) => list.name);
    
    multipleLists.forEach(listName => {
      expect(listNames).toContain(listName);
    });
  });
  test('It should archive all created lists', async ({ request }) => {
    const response = await request.get(`${boardsBaseUrl}/${playwrightTestingBoardId}/lists`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    for (const list of body) {
      const putResponse = await request.put(`${listsBaseUrl}/${list.id}/closed`, {
        params: { key: apiKey, token: token, value: 'true' }
      });
      expect(putResponse.status()).toBe(200);
    }
  });
});