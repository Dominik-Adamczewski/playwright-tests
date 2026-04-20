import { APIResponse } from "@playwright/test";

export const getDataByBoardName = async (response: APIResponse, boardName: string) => {
  const data = await response.json();
  return data.find((board: any) => board.name === boardName);
};