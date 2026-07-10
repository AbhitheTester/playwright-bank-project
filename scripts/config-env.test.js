const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('SIT admin credentials are defined in the SIT env file', () => {
  const envFile = path.join(__dirname, '..', 'osttra-framework', '.env.sit');
  const content = fs.readFileSync(envFile, 'utf8');

  const getValue = (key) => {
    const match = new RegExp(`^${key}=(.+)$`, 'm');
    const result = content.match(match);
    assert.ok(result, `Missing ${key} in .env.sit`);
    return result[1].trim();
  };

  assert.equal(getValue('ADMIN_USER_NAME'), 'john_uat');
  assert.equal(getValue('ADMIN_USER_PASS'), 'demo_uat');
});
