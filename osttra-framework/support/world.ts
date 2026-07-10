import { World, IWorldOptions } from '@cucumber/cucumber';
import {
  Browser,
  BrowserContext,
  Page,
  APIRequestContext
} from '@playwright/test';

export interface ICustomWorld extends World {
  // Browser
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  // API
  apiContext?: APIRequestContext;
  apiResponse?: {
    status: number;
    body: any;
  };

  // Shared Scenario Data
  authToken?: string;
  userId?: string;
  tradeId?: string;
  bookingId?: string;
}

export class CustomWorld extends World implements ICustomWorld {
  // Browser
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  // API
  apiContext?: APIRequestContext;
  apiResponse?: {
    status: number;
    body: any;
  };

  // Shared Scenario Data
  authToken?: string;
  userId?: string;
  tradeId?: string;
  bookingId?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }
}