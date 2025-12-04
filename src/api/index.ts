import service from './axios';
import { DEFAULT_METHOD, EXPAND_APIS, EXPAND_REQ_TYPES } from './list';
import myServer from './server';
import { IBaseRequest } from './types';
import { spliceUrl } from './utils';

function baseRequest({ url, method = DEFAULT_METHOD, query = '', ...c }: IBaseRequest) {
  return service({
    ...c,
    url: spliceUrl(url, query),
    method,
  });
}

Object.entries(EXPAND_APIS).forEach(([key, value]) => {
  myServer.parseRouter(key, value);
});

const request: EXPAND_REQ_TYPES = Object.assign({}, myServer.base, myServer);

export { baseRequest, request };
