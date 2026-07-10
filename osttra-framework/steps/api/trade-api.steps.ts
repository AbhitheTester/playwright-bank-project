import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../../support/world';

When('I send GET request to {string}', async function(
  this: ICustomWorld, path: string
) {
  const headers: Record<string, string> = this.authToken
    ? { Authorization: `Bearer ${this.authToken}` }
    : {};

  const res = await this.apiContext!.get(path, { headers });

  this.apiResponse = {
    status: res.status(),
    body: await res.json(),
  };
});

When('I send POST request to {string} with body:', async function(
  this: ICustomWorld, path: string, body: string
) {
  const res = await this.apiContext!.post(
    path,
    { data: JSON.parse(body), headers: { 'Content-Type': 'application/json' } }
  );

  this.apiResponse = { status: res.status(), body: await res.json() };
});

When('I create user with name {string} and job {string}', async function(
  this: ICustomWorld, name: string, job: string
) {
  const res = await this.apiContext!.post('/api/users', { data: { name, job } });

  this.apiResponse = { status: res.status(), body: await res.json() };
  this.userId = this.apiResponse.body.id;
});

When('I update stored user name to {string}', async function(
  this: ICustomWorld, newName: string
) {
  const res = await this.apiContext!.put(
    `/api/users/${this.userId}`,
    { data: { name: newName, job: 'Updated' } }
  );

  this.apiResponse = { status: res.status(), body: await res.json() };
});

Then('response status should be {int}', function(
  this: ICustomWorld, expectedStatus: number
) {
  expect(this.apiResponse!.status).toBe(expectedStatus);
});

Then('response should have field {string}', function(
  this: ICustomWorld, field: string
) {
  expect(this.apiResponse!.body).toHaveProperty(field);
});

Then('response should have field {string} as array', function(
  this: ICustomWorld, field: string
) {
  expect(Array.isArray(this.apiResponse!.body[field])).toBe(true);
});

Then('response should have field {string} as number', function(
  this: ICustomWorld, field: string
) {
  expect(typeof this.apiResponse!.body[field]).toBe('number');
});

Then('response field {string} should equal {string}', function(
  this: ICustomWorld, field: string, value: string
) {
  expect(this.apiResponse!.body[field]).toBe(value);
});

Then('each user should have {string}, {string}, {string}, {string}', function(
  this: ICustomWorld, field1: string, field2: string, field3: string, field4: string
) {
  const users = this.apiResponse!.body.data;
  expect(Array.isArray(users)).toBe(true);

  for (const user of users) {
    expect(user).toHaveProperty(field1);
    expect(user).toHaveProperty(field2);
    expect(user).toHaveProperty(field3);
    expect(user).toHaveProperty(field4);
  }
});

Then('user should be created with status {int}', function(
  this: ICustomWorld, expectedStatus: number
) {
  expect(this.apiResponse!.status).toBe(expectedStatus);
  expect(this.apiResponse!.body).toHaveProperty('id');
});

Then('I store created user {string}', function(
  this: ICustomWorld, field: string
) {
  this.userId = this.apiResponse!.body[field];
  expect(this.userId).toBeTruthy();
});

Then('I store the {string} for subsequent requests', function(
  this: ICustomWorld, field: string
) {
  this.authToken = this.apiResponse!.body[field];
  expect(this.authToken).toBeTruthy();
});