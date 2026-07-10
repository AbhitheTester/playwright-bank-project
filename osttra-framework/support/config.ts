import * as dotenv from 'dotenv';
import * as path from 'path';

export const frameworkRoot = path.resolve(__dirname, '..');

export function loadEnvironment() {
  const envName = (process.env.ENV || 'sit').toLowerCase();
  dotenv.config({ path: path.join(frameworkRoot, `.env.${envName}`) });
  return envName;
}

export const envName = loadEnvironment();
export const roleName = (process.env.ROLE || 'user').toLowerCase();

function envValue(name: string, fallback = '') {
  return process.env[name] || fallback;
}

function numberValue(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function boolValue(name: string, fallback: boolean) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function roleEnvName(name: string) {
  return `${roleName.toUpperCase()}_${name}`;
}

export function getRoleCredentials() {
  const username = envValue(roleEnvName('USER_NAME'), envValue('USER_NAME'));
  const password = envValue(roleEnvName('USER_PASS'), envValue('USER_PASS'));

  if (!username || !password) {
    throw new Error(
      `Missing credentials for ROLE=${roleName}. Add USER_NAME/USER_PASS or ${roleEnvName('USER_NAME')}/${roleEnvName('USER_PASS')} in .env.${envName}.`
    );
  }

  return { username, password };
}

export function getAuthFilePath(role = roleName) {
  return path.join(frameworkRoot, 'auth', `${envName}-${role}-session.json`);
}

export function getReportsDir() {
  return path.join(frameworkRoot, 'reports');
}

export function buildLoginURL(rawBaseURL: string) {
  const trimmedBaseURL = rawBaseURL.trim().replace(/\/$/, '');

  if (/\/parabank\/(index|login)\.htm(\?.*)?$/i.test(trimmedBaseURL)) {
    return trimmedBaseURL;
  }

  if (/\/parabank\/.*\.htm(\?.*)?$/i.test(trimmedBaseURL)) {
    return trimmedBaseURL.replace(/\/parabank\/.*$/i, '/parabank/index.htm?ConnType=JDBC');
  }

  if (trimmedBaseURL.endsWith('/parabank')) {
    return `${trimmedBaseURL}/index.htm?ConnType=JDBC`;
  }

  return `${trimmedBaseURL}/parabank/index.htm?ConnType=JDBC`;
}

export function buildPostLoginURL(rawBaseURL: string) {
  const trimmedBaseURL = rawBaseURL.trim().replace(/\/$/, '');

  if (/\/parabank\/.*\.htm(\?.*)?$/i.test(trimmedBaseURL)) {
    return trimmedBaseURL.replace(/\/parabank\/.*$/i, '/parabank/overview.htm');
  }

  if (trimmedBaseURL.endsWith('/parabank')) {
    return `${trimmedBaseURL}/overview.htm`;
  }

  return `${trimmedBaseURL}/parabank/overview.htm`;
}

const baseURL = envValue('BASE_URL', 'https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC');

export const testConfig = {
  envName,
  roleName,
  baseURL,
  apiBaseURL: envValue('API_BASE_URL', 'https://reqres.in'),
  apiToken: envValue('API_TOKEN'),
  browserName: envValue('BROWSER', 'chromium'),
  headless: boolValue('HEADLESS', process.env.CI === 'true'),
  slowMo: numberValue('SLOWMO', 0),
  timeout: numberValue('TEST_TIMEOUT', 60_000),
  actionTimeout: numberValue('ACTION_TIMEOUT', 15_000),
  navigationTimeout: numberValue('NAVIGATION_TIMEOUT', 30_000),
  workers: numberValue('WORKERS', process.env.CI === 'true' ? 4 : 2),
  viewport: {
    width: numberValue('VIEWPORT_WIDTH', 1920),
    height: numberValue('VIEWPORT_HEIGHT', 1080),
  },
  locale: envValue('LOCALE', 'en-GB'),
  timezoneId: envValue('TIMEZONE_ID', 'Asia/Kolkata'),
  loginURL: envValue('LOGIN_URL') || buildLoginURL(baseURL),
  postLoginURL: envValue('POST_LOGIN_URL') || buildPostLoginURL(baseURL),
  loginUsernameSelector: envValue('LOGIN_USERNAME_SELECTOR', '[name="username"]'),
  loginPasswordSelector: envValue('LOGIN_PASSWORD_SELECTOR', '[name="password"]'),
  loginSubmitSelector: envValue('LOGIN_SUBMIT_SELECTOR', '[value="Log In"]'),
  authReadySelector: envValue('AUTH_READY_SELECTOR', '#accountTable'),
};
