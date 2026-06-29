import { request } from '@playwright/test';
import { existingUser } from './helpers/global';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function globalSetup() {
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  const requestContext = await request.newContext();
  
  const response = await requestContext.post(`${apiBaseUrl}/api/users`, {
    data: {
      user: {
        username: existingUser.username,
        email: existingUser.email,
        password: existingUser.password
      }
    }
  });

  console.log(`Seed user creation status: ${response.status()} ${await response.text()}`);
  await requestContext.dispose();
}

export default globalSetup;