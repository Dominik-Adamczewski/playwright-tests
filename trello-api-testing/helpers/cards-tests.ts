import { APIRequestContext } from '@playwright/test';
import { boardsBaseUrl, membersBaseUrl } from '../config/paths';
import { getDataByBoardName } from './data';


export const getBoardIdForCardTestsByName = async (request: APIRequestContext, boardName: string, apiKey: string, token: string) => {
  const response = await request.get(membersBaseUrl, {
    params: { key: apiKey, token: token, filter: 'open' }
  });
  const boardData = await getDataByBoardName(response, 'playwright-cards-test-board');
  return boardData.id;
};

export const getFirstListIdForCardTests = async (request: APIRequestContext, boardId: string, apiKey: string, token: string) => {
  const listResponse = await request.get(`${boardsBaseUrl}/${boardId}/lists`, {
    params: { key: apiKey, token: token }
  });
  console.log(await listResponse.json());
  const listDate = await listResponse.json();
  return listDate[0].id;
}

export const getAllListIdsForBoard = async (request: APIRequestContext, boardId: string, apiKey: string, token: string) => {
  const listResponse = await request.get(`${boardsBaseUrl}/${boardId}/lists`, {
    params: { key: apiKey, token: token }
  });
  const listData = await listResponse.json();
  return listData.map((list: { id: string; name: string }) => {
    return { id: list.id, name: list.name };
  });
}