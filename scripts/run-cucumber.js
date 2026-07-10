const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { resetReportsDirectory } = require('./report-utils');

const rootDir = path.resolve(__dirname, '..');
const frameworkDir = path.join(rootDir, 'osttra-framework');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const envName = getArg('env', process.env.ENV || 'sit').toLowerCase();
const profile = getArg('profile', 'default');
const tags = getArg('tags', '');
const defaultEnvFile = path.join(frameworkDir, '.env');

const namedEnvFile = path.join(frameworkDir, `.env.${envName}`);

const envFilePath = fs.existsSync(defaultEnvFile)
    ? defaultEnvFile
    : namedEnvFile;

console.log("Loading env file:", envFilePath);
console.log("Exists:", fs.existsSync(envFilePath));

dotenv.config({ path: envFilePath });

console.log("ROLE =", process.env.ROLE);
console.log("USER_NAME =", process.env.USER_NAME);
console.log("USER_PASS =", process.env.USER_PASS ? "Loaded" : "Missing");

const role = getArg('role', process.env.ROLE || 'user').toLowerCase();
const browser = getArg('browser', process.env.BROWSER || 'chromium').toLowerCase();
const workers = getArg('workers', process.env.WORKERS || (process.env.CI === 'true' ? '4' : '2'));
const setupOnly = args.includes('--setup-only');

process.env.ENV = envName;
process.env.ROLE = role;
process.env.BROWSER = browser;
process.env.WORKERS = workers;
fs.mkdirSync(path.join(frameworkDir, 'auth'), { recursive: true });
resetReportsDirectory(path.join(frameworkDir, 'reports'));
process.env.ALLURE_RESULTS_DIR = path.join(frameworkDir, 'reports', 'allure-results');

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || frameworkDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const authFile = path.join(frameworkDir, 'auth', `${envName}-${role}-session.json`);
const hasUsableAuth = fs.existsSync(authFile) && fs.statSync(authFile).size > 0;
const isApiOnlyRun = profile === 'api-only' || tags === '@api';

function storageStateHasCookies(file) {
  if (!hasUsableAuth) return false;

  try {
    const storageState = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(storageState.cookies) && storageState.cookies.length > 0;
  } catch {
    return false;
  }
}

// Browser login sessions expire, so refresh auth by default before UI runs.
// Set REUSE_AUTH=true to skip setup when the saved file still has cookies.
const canReuseAuth = process.env.REUSE_AUTH === 'true' && storageStateHasCookies(authFile);
const shouldSetup = setupOnly || (!isApiOnlyRun && (!canReuseAuth || process.env.FORCE_AUTH === 'true'));

if (shouldSetup) {
  console.log(`\nCreating Playwright storage state for ENV=${envName}, ROLE=${role}, BROWSER=${browser}...\n`);
  run('node', ['-r', 'ts-node/register', 'global-setup.ts']);
} else {
  console.log(`\nUsing existing storage state: ${path.relative(frameworkDir, authFile)}\n`);
}

if (setupOnly) {
  process.exit(0);
}

const cucumberArgs = ['cucumber-js', '--config', 'cucumber.json', '--profile', profile];
if (tags) {
  cucumberArgs.push('--tags', tags);
}
if (workers) {
  cucumberArgs.push('--parallel', workers);
}

run('npx', cucumberArgs);
