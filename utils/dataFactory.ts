import { expect, type APIRequestContext } from '@playwright/test';
import { API_URL } from '../constants/testData';

export type User = { username: string; password: string };

export function randomSuffix(length = 6): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

export function uniqueUser(prefix = 'qa'): User {
  const suffix = `${Date.now()}${randomSuffix()}`;
  return { username: `${prefix}_${suffix}`, password: `pw_${suffix}` };
}

/** Registers a user through the same request the Sign up modal sends (password in base64). */
export async function signUpViaApi(request: APIRequestContext, user: User): Promise<void> {
  const response = await request.post(`${API_URL}/signup`, {
    data: { username: user.username, password: Buffer.from(user.password).toString('base64') },
  });
  // Setup guard: fail fast if the precondition could not be created.
  expect(response.status()).toBe(200);
  // Success is an empty JSON string; a duplicate user returns { errorMessage } with status 200.
  expect(await response.json()).toBe('');
}
