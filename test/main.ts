import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('main', () => {
  before(async () => {});
  it('should pass', async () => {
    assert.equal(1, 1);
  });
  after(async () => {});
});
