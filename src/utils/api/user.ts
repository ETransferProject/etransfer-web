import { request } from 'api';
import {
  TCheckEOARegistrationRequest,
  TCheckEOARegistrationResult,
  TCheckRegistrationRequest,
  TCheckRegistrationResult,
  TTokenPricesRequest,
  TTokenPricesResult,
} from 'types/api';
import { formatApiError } from './error';

export const checkEOARegistration = async (
  params: TCheckEOARegistrationRequest,
): Promise<TCheckEOARegistrationResult> => {
  try {
    const res = await request.user.checkEOARegistration({
      params,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'checkEOARegistration error', false);
  }
};

export const checkRegistration = async (
  params: TCheckRegistrationRequest,
): Promise<TCheckRegistrationResult> => {
  try {
    const res = await request.user.checkRegistration({
      params,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'checkRegistration error', false);
  }
};

export const getTokenPrices = async (params: TTokenPricesRequest): Promise<TTokenPricesResult> => {
  try {
    const res = await request.user.getTokenPrices({
      params,
    });
    return res.data;
  } catch (error: any) {
    throw formatApiError(error, 'getTokenPrices error', false);
  }
};
