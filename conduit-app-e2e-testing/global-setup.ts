import { request } from '@playwright/test';
import { existingUser } from './helpers/global';

async function globalSetup() {
  const requestContext = await request.newContext();
  
  await requestContext.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/users`, {
    data: {
      user: {
        username: existingUser.username,
        email: existingUser.email,
        password: existingUser.password
      }
    }
  });

  await requestContext.dispose();
}

export default globalSetup;