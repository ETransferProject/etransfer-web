import queryString from 'query-string';
import { ListingStep, LISTING_STEP_PATHNAME_MAP } from 'constants/listing';
import { TSearchParams } from 'types/listing';

export const getListingUrl = (step: ListingStep, params?: TSearchParams) => {
  let search;
  switch (step) {
    case ListingStep.TOKEN_INFORMATION:
      search = queryString.stringify({
        symbol: params?.symbol,
      });
      break;
    case ListingStep.SELECT_CHAIN:
      search = queryString.stringify({
        symbol: params?.symbol,
      });
      break;
    case ListingStep.COBO_CUSTODY_REVIEW:
      search = queryString.stringify({
        networks: params?.networks,
      });
      break;
    case ListingStep.INITIALIZE_LIQUIDITY_POOL:
      search = queryString.stringify({
        symbol: params?.symbol,
        id: params?.id,
      });
      break;
  }
  return `/listing${LISTING_STEP_PATHNAME_MAP[step]}${search ? '?' + search : ''}`;
};
