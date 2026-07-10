# Playwright Cucumber Framework Guide

## What this framework provides

- Cucumber BDD feature files and TypeScript step definitions.
- Playwright UI automation with one saved login session per environment and role.
- API test support through Playwright request context.
- Parallel execution with configurable workers.
- CI-friendly reports: Cucumber JSON, JUnit XML, Cucumber HTML, Allure, screenshots, videos, and traces.
- Environment-driven setup so a new project mostly needs `.env.<env>` changes.

## Main execution flow

```text
npm script
  -> scripts/run-cucumber.js
  -> loads osttra-framework/.env.<env>
  -> creates auth/report folders
  -> runs global-setup.ts for UI auth when needed
  -> runs npx cucumber-js with cucumber.json profile
  -> support/hooks.ts creates browser/API context
  -> feature files map to step definitions
  -> reports and failure artifacts are written under osttra-framework/reports
```

## Important files

| File | Responsibility |
| --- | --- |
| `package.json` | Easy local commands like smoke, regression, API, reports, typecheck |
| `scripts/run-cucumber.js` | Main runner: env/profile/role/browser/workers, auth setup, Cucumber trigger |
| `osttra-framework/support/config.ts` | Central config for env, role, URLs, selectors, auth path, timeouts |
| `osttra-framework/global-setup.ts` | Logs in once and saves Playwright storage state |
| `osttra-framework/support/hooks.ts` | Creates browser/API context per scenario and captures artifacts |
| `osttra-framework/cucumber.json` | Cucumber profiles, tags, formatters, feature/step loading |
| `.github/workflows/automation.yml` | GitHub Actions CI pipeline |

## Local commands

```powershell
npm run typecheck
npm run auth:setup
npm test
npm run test:regression
npm run test:api
npm run report:generate
```

Run a specific environment/role/browser:

```powershell
node scripts/run-cucumber.js --env=sit --profile=smoke --role=user --browser=chromium --workers=2
```

Reuse an existing saved login session:

```powershell
$env:REUSE_AUTH="true"
npm test
```

Force fresh login:

```powershell
$env:FORCE_AUTH="true"
npm test
```

## Adding another project

Create or update `.env.<env>` with:

```env
BASE_URL=https://your-app/dashboard
LOGIN_URL=https://your-app/login
POST_LOGIN_URL=https://your-app/dashboard
USER_NAME=your-user
USER_PASS=your-password
LOGIN_USERNAME_SELECTOR=#username
LOGIN_PASSWORD_SELECTOR=#password
LOGIN_SUBMIT_SELECTOR=button[type="submit"]
AUTH_READY_SELECTOR=[data-testid="dashboard"]
```

For multiple roles:

```env
ROLE=user
USER_NAME=normal-user
USER_PASS=normal-password
ADMIN_USER_NAME=admin-user
ADMIN_USER_PASS=admin-password
```

Then run:

```powershell
node scripts/run-cucumber.js --env=sit --profile=smoke --role=admin
```

This creates:

```text
osttra-framework/auth/sit-admin-session.json
```

## Reports

After a run:

```text
osttra-framework/reports/json
osttra-framework/reports/*.xml
osttra-framework/reports/cucumber-html
osttra-framework/reports/allure-results
osttra-framework/reports/allure-report
osttra-framework/reports/screenshots
osttra-framework/reports/videos
osttra-framework/reports/traces
```

Generate reports:

```powershell
npm run report:generate
```
