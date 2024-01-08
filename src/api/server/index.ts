import axios, { CancelTokenSource } from 'axios';
import service from 'api/axios';
import { DEFAULT_METHOD } from 'api/list';
import { BaseConfig, UrlObj, RequestConfig } from 'api/types';
import { spliceUrl, getRequestConfig } from 'api/utils';

const myServer = new Function();

const cancelTokenSources: Map<string, CancelTokenSource> = new Map();

/**
 * @method parseRouter
 * @param  {string} name
 * @param  {UrlObj} urlObj
 */
myServer.prototype.parseRouter = function (name: string, urlObj: UrlObj) {
  const obj: any = (this[name] = {});
  Object.keys(urlObj).forEach((key) => {
    obj[key] = this.send.bind(this, urlObj[key]);
  });
};

/**
 * @method send
 * @param  {BaseConfig} base
 * @param  {object} config
 * @return {Promise<any>}
 */
myServer.prototype.send = function (base: BaseConfig, config: RequestConfig) {
  const {
    method = DEFAULT_METHOD,
    query = '',
    url,
    cancelTokenSourceKey,
    ...axiosConfig
  } = getRequestConfig(base, config) || {};
  const source = axios.CancelToken.source();
  if (cancelTokenSourceKey) {
    if (cancelTokenSources.has(cancelTokenSourceKey)) {
      cancelTokenSources.get(cancelTokenSourceKey)?.cancel();
    }
    cancelTokenSources.set(cancelTokenSourceKey, source);
  }
  return service({
    ...axiosConfig,
    url: url || spliceUrl(typeof base === 'string' ? base : base.target, query),
    method,
    cancelToken: source.token,
  });
};

export default myServer.prototype;
