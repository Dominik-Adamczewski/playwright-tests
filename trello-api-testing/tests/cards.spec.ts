import { test, expect } from '@playwright/test';
import { cardBaseUrl, membersBaseUrl, boardsBaseUrl, listsBaseUrl } from '../config/paths';
import { getBoardIdForCardTestsByName, getFirstListIdForCardTests, getAllListIdsForBoard } from '../helpers/cards-tests';

const apiKey = process.env.TRELLO_API_KEY as string;
const token = process.env.TRELLO_TOKEN as string;

let cardTestingBoardId: string = '';
let cardTestingListId: string = '';

const newCardData = {
  id: '',
  name: 'Playwright-Test-Card ' + new Date().getTime(),
  desc: 'This is a test card created by Playwright',
  comment: 'This is a test comment added by Playwright'
};

const commentCardData = {
  id: '',
  actionId: '',
  name: 'Playwright-Comments-Test-Card ' + new Date().getTime(),
  desc: 'This is a test comment card created by Playwright',
  comment: 'This is a test comment added by Playwright'
};

test.describe('Trello API - Cards', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    cardTestingBoardId = await getBoardIdForCardTestsByName(request, 'playwright-cards-test-board', apiKey, token);

    const listName = 'Playwright-Test-List';
    const response = await request.post(`${listsBaseUrl}`, {
      params: { key: apiKey, token: token, name: listName, idBoard: cardTestingBoardId }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    cardTestingListId = body.id;
    expect(body.name).toBe(listName);

    cardTestingListId = await getFirstListIdForCardTests(request, cardTestingBoardId, apiKey, token);
  });

  test('It should create a new card', async ({ request }) => {
    const response = await request.post(`${cardBaseUrl}`, {
      params: { idList: cardTestingListId, key: apiKey, token: token, name: newCardData.name }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    newCardData.id = body.id;
    expect(body.name).toBe(newCardData.name);
  });

  test('It should fail to create a card with missing idList', async ({ request }) => {
    const response = await request.post(`${cardBaseUrl}`, {
      params: { idList: '', key: apiKey, token: token, name: 'test' }
    });
    expect(response.status()).toBe(400);
    const responseText = await response.text();
    expect(responseText).toContain('invalid value for idList');
  });

  test('It should fail to get a card with an invalid ID', async ({ request }) => {
    const invalidCardId = 'invalidCardId123';
    const response = await request.get(cardBaseUrl, {
      params: { key: apiKey, token: token, id: invalidCardId }
    });
    expect(response.status()).toBe(404);  
  });

  test('It should fail to get a card, with an empty id', async ({ request }) => {
    const response = await request.get(cardBaseUrl, {
      params: { key: apiKey, token: token, id: '' }
    });
    expect(response.status()).toBe(404);
  });

  test('It should get a card by ID', async ({ request }) => {
    const response = await request.get(`${cardBaseUrl}/${newCardData.id}`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(newCardData.name);
  });

  test('It should update a card name', async ({ request }) => {
    const updatedName = newCardData.name + ' - Updated';
    const response = await request.put(`${cardBaseUrl}/${newCardData.id}`, {
      params: { key: apiKey, token: token, name: updatedName }
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(updatedName);
  });

  test('It should add a card description', async ({ request }) => {
    const response = await request.put(`${cardBaseUrl}/${newCardData.id}`, {
      params: { key: apiKey, token: token, desc: newCardData.desc }
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.desc).toBe(newCardData.desc);
  });

  test('It should delete a card', async ({ request }) => {
    const response = await request.delete(`${cardBaseUrl}/${newCardData.id}`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`${cardBaseUrl}/${newCardData.id}`, {
      params: { key: apiKey, token: token }
    });
    expect(getResponse.status()).toBe(404);
  });
});

test.describe('Trello API - Cards - Comments', () => {
  test.describe.configure({ mode: 'serial' });
  
  test.beforeAll(async ({ request }) => {
    // Get board for the test
    cardTestingBoardId = await getBoardIdForCardTestsByName(request, 'playwright-cards-test-board', apiKey, token);

    // Create a list for the tests
    const listName = 'Playwright-Test-List';
    const response = await request.post(`${listsBaseUrl}`, {
      params: { key: apiKey, token: token, name: listName, idBoard: cardTestingBoardId }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    cardTestingListId = body.id;
    expect(body.name).toBe(listName);

    cardTestingListId = await getFirstListIdForCardTests(request, cardTestingBoardId, apiKey, token);

    // Create a card for comment tests
    const cardCreateResponse = await request.post(`${cardBaseUrl}`, {
      params: { idList: cardTestingListId, key: apiKey, token: token, name: commentCardData.name }
    });
    expect(cardCreateResponse.status()).toBe(200);
    const cardBody = await cardCreateResponse.json();
    commentCardData.id = cardBody.id;
    expect(cardBody.name).toBe(commentCardData.name);
  });

  test('It should add a comment to a card', async ({ request }) => {
    const response = await request.post(`${cardBaseUrl}/${commentCardData.id}/actions/comments`, {
      params: { text: commentCardData.comment, key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.text).toBe(commentCardData.comment);
  });

  test('It should get Action on the card', async ({ request }) => {
    const response = await request.get(`${cardBaseUrl}/${commentCardData.id}/actions`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.length).toBeGreaterThan(0);
    commentCardData.actionId = body[0].id;
  });

  test('It should update the comment on the card', async ({ request }) => {
    const updatedComment = commentCardData.comment + ' - Updated';
    const response = await request.put(`${cardBaseUrl}/${commentCardData.id}/actions/${commentCardData.actionId}/comments`, {
      params: { text: updatedComment, key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.text).toBe(updatedComment);
  });

  test('Id should delete the comment on the card', async ({ request }) => {
    const response = await request.delete(`${cardBaseUrl}/${commentCardData.id}/actions/${commentCardData.actionId}/comments`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`${cardBaseUrl}/${commentCardData.id}/actions/${commentCardData.actionId}/comments`, {
      params: { key: apiKey, token: token }
    });
    expect(getResponse.status()).toBe(404);
  });

  test.afterAll(async ({ request }) => {
    const response = await request.delete(`${cardBaseUrl}/${commentCardData.id}`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);

    const getResponse = await request.get(`${cardBaseUrl}/${commentCardData.id}`, {
      params: { key: apiKey, token: token }
    });
    expect(getResponse.status()).toBe(404);
  });
});

test.describe('Trello API - Moving cards between lists', () => {
  test.describe.configure({ mode: 'serial' });

  let firstListId: string = '';
  let idOfCardToMove: string = '';

  const listTestCases = [
    { title: 'It should move all the cards to "To-Do" list', name: 'To Do' },
    { title: 'It should move all the cards to "Design" list', name: 'Design' },
    { title: 'It should move all the cards to "In Progress" list', name: 'In Progress' },
    { title: 'It should move all the cards to "QA" list', name: 'QA' },
    { title: 'It should move all the cards to "Accepted" list', name: 'Accepted' }
  ];

  let listIds: { id: string; name: string }[] = [];

  test.beforeAll(async ({ request }) => {
    if (!cardTestingBoardId) {
      cardTestingBoardId = await getBoardIdForCardTestsByName(request, 'playwright-cards-test-board', apiKey, token);
    }

    // clear the existing lists on the board
    const existingListsResponse = await request.get(`${boardsBaseUrl}/${cardTestingBoardId}/lists`, {
      params: { key: apiKey, token: token }
    });
    expect(existingListsResponse.status()).toBe(200);
    const existingLists = await existingListsResponse.json();
    if (existingLists.length) {
      for (const existingList of existingLists) {
        const archiveResponse = await request.put(`${listsBaseUrl}/${existingList.id}/closed`, {
          params: { key: apiKey, token: token, value: 'true' }
        });
        expect(archiveResponse.status()).toBe(200);
      }
    }

    for (const listTestCase of listTestCases) {
      const response = await request.post(`${listsBaseUrl}`, {
        params: { key: apiKey, token: token, name: listTestCase.name, idBoard: cardTestingBoardId }
      });
      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.name).toBe(listTestCase.name);
    }
    listIds = await getAllListIdsForBoard(request, cardTestingBoardId, apiKey, token);
    firstListId = await getFirstListIdForCardTests(request, cardTestingBoardId, apiKey, token);
    

    // create a card in the first list
    const cardResponse = await request.post(`${cardBaseUrl}`, {
      params: { idList: firstListId, key: apiKey, token: token, name: newCardData.name }
    });
    expect(cardResponse.status()).toBe(200);
    const body = await cardResponse.json();
    idOfCardToMove = body.id;
    expect(body.name).toBe(newCardData.name);
  });

  for (const listTestCase of listTestCases) {
    test(listTestCase.title, async ({ request }) => {
      const targetList = listIds.find(list => list.name === listTestCase.name);

      const cardResponse = await request.get(`${cardBaseUrl}/${idOfCardToMove}`, {
        params: { key: apiKey, token: token }
      });
      expect(cardResponse.status()).toBe(200);
      const cardData = await cardResponse.json();
      const currentListId = cardData.idList;

      if (targetList) {
        const response = await request.post(`${listsBaseUrl}/${currentListId}/moveAllCards`, {
          params: { idBoard: cardTestingBoardId, idList: targetList.id, key: apiKey, token: token }
        });
        expect(response.status()).toBe(200);

        const getCardResponse = await request.get(`${cardBaseUrl}/${idOfCardToMove}`, {
          params: { key: apiKey, token: token }
        });
        expect(getCardResponse.status()).toBe(200);
        const updatedCardData = await getCardResponse.json();
        expect(updatedCardData.idList).toBe(targetList.id);
      }
    });
  }

  test.afterAll(async ({ request }) => {
    const response = await request.delete(`${cardBaseUrl}/${idOfCardToMove}`, {
      params: { key: apiKey, token: token }
    });
    expect(response.status()).toBe(200);

    for (const list of listIds) {
      const archiveResponse = await request.put(`${listsBaseUrl}/${list.id}/closed`, {
        params: { key: apiKey, token: token, value: 'true' }
      });
      expect(archiveResponse.status()).toBe(200);
    }
  });
});