import { describe, it, expect } from 'vitest';
import queryString from 'query-string';
import { getListingUrl } from '../listing';
import { ListingStep } from '../../constants/listing';

describe('getListingUrl', () => {
  it('should generate the correct URL for TOKEN_INFORMATION with a symbol param', () => {
    const step = ListingStep.TOKEN_INFORMATION;
    const params = { symbol: 'ABC' };

    const result = getListingUrl(step, params);
    const expectedSearch = queryString.stringify({ symbol: 'ABC' });

    expect(result).toBe(`/listing/token-information?${expectedSearch}`);
  });

  it('should generate the correct URL for SELECT_CHAIN with a symbol param', () => {
    const step = ListingStep.SELECT_CHAIN;
    const params = { symbol: 'XYZ' };

    const result = getListingUrl(step, params);
    const expectedSearch = queryString.stringify({ symbol: 'XYZ' });

    expect(result).toBe(`/listing/select-chain?${expectedSearch}`);
  });

  it('should generate the correct URL for COBO_CUSTODY_REVIEW with networks param', () => {
    const step = ListingStep.COBO_CUSTODY_REVIEW;
    const params = { networks: 'ethereum,binance' };

    const result = getListingUrl(step, params);
    const expectedSearch = queryString.stringify({ networks: 'ethereum,binance' });

    expect(result).toBe(`/listing/cobo-custody-review?${expectedSearch}`);
  });

  it('should generate the correct URL for INITIALIZE_LIQUIDITY_POOL with symbol and id params', () => {
    const step = ListingStep.INITIALIZE_LIQUIDITY_POOL;
    const params = { symbol: 'DEF', id: '12345' };

    const result = getListingUrl(step, params);
    const expectedSearch = queryString.stringify({ symbol: 'DEF', id: '12345' });

    expect(result).toBe(`/listing/initialize-liquidity-pool?${expectedSearch}`);
  });

  it('should return the correct base path when no params are provided for TOKEN_INFORMATION', () => {
    const step = ListingStep.TOKEN_INFORMATION;

    const result = getListingUrl(step);

    expect(result).toBe('/listing/token-information');
  });

  it('should return the correct base path when no params are provided for SELECT_CHAIN', () => {
    const step = ListingStep.SELECT_CHAIN;

    const result = getListingUrl(step);

    expect(result).toBe('/listing/select-chain');
  });

  it('should return the correct base path when no params are provided for COBO_CUSTODY_REVIEW', () => {
    const step = ListingStep.COBO_CUSTODY_REVIEW;

    const result = getListingUrl(step);

    expect(result).toBe('/listing/cobo-custody-review');
  });

  it('should return the correct base path when no params are provided for INITIALIZE_LIQUIDITY_POOL', () => {
    const step = ListingStep.INITIALIZE_LIQUIDITY_POOL;

    const result = getListingUrl(step);

    expect(result).toBe('/listing/initialize-liquidity-pool');
  });
});
