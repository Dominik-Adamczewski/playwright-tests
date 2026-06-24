import { Page } from "@playwright/test";

export const waitForRequestToFinish = async (
  page: Page,
  path: string,
  statusCode: number,
  action: () => Promise<void>,
  timeout?: number
) => {
  const [response] = await Promise.all([
    page.waitForResponse(
      resp => resp.url().includes(path) && resp.status() === statusCode,
      { timeout }
    ),
    action(),
  ]);

  return response;
};

export const waitForRequest = async (
  page: Page,
  path: string,
  statusCode: number,
  timeout?: number
) => {
  return page.waitForResponse(
    resp => resp.url().includes(path) && resp.status() === statusCode,
    { timeout }
  );
};