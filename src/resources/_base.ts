import type { Scout } from '../client';

/** Base class for every resource group. Holds a back-reference to the client. */
export abstract class APIResource {
  protected readonly client: Scout;
  constructor(client: Scout) {
    this.client = client;
  }
}
