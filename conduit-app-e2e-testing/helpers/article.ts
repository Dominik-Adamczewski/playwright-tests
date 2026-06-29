import { APIRequestContext, expect } from "@playwright/test"
import { NewArticle } from "../types/conduit-types";

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const addNewArticleViaApi = async (
  requestFixture: APIRequestContext,
  article: NewArticle,
  token: string
) => {
  const response = await requestFixture.post(`${API_BASE_URL}/api/articles`, {
    headers: {
      Authorization: `Token ${token}`,
    },
    data: {
      article: {
        title: article.title,
        description: article.description,
        body: article.content,
        tagList: article.tags,
      },
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create article: ${response.status()} ${await response.text()}`);
  }
};

export const deleteArticleViaApi = async (
  requestFixture: APIRequestContext,
  token: string,
  articleTitle: string
): Promise<void> => {
  const searchResponse = await requestFixture.get(
    `${API_BASE_URL}/api/articles?limit=100`,
    { headers: { Authorization: `Token ${token}` } }
  );

  if (!searchResponse.ok()) {
    throw new Error(`Failed to fetch articles: ${searchResponse.status()} ${await searchResponse.text()}`);
  }

  const body = await searchResponse.json();
  const articles = body?.articles;

  if (!articles) {
    throw new Error(`Unexpected response shape: ${JSON.stringify(body)}`);
  }

  const article = articles.find((article: any) => article.title === articleTitle);
  if (!article) return;

  await requestFixture.delete(`${API_BASE_URL}/api/articles/${article.slug}`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const unfavoriteArticleViaApi = async (
  request: APIRequestContext,
  token: string,
  slug: string
) => {
  await request.delete(`/api/articles/${slug}/favorite`, {
    headers: { Authorization: `Token ${token}` },
  });
};