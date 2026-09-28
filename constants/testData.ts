// Public demo account: anyone on the internet can use it, so log in with it but never assert on
// its cart. Tests that need a known state create their own user (see utils/dataFactory.ts).
export const demoAccount = {
  username: 'asd',
  password: 'asd',
};

// baseURL in playwright.config.ts points to the website, so the API is called with absolute URLs.
export const API_URL = 'https://api.demoblaze.com';
