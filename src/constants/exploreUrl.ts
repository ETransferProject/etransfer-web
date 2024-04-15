enum ENVIRONMENT {
  TEST = 'test',
  DEVELOPMENT = 'development',
  DEVELOPMENT4 = 'development4',
  PRODUCTION = 'production',
}
const env = process.env.NEXT_PUBLIC_NODE_ENV as unknown as ENVIRONMENT;

const explorerUrls = {
  [ENVIRONMENT.TEST]: {
    AELF: 'https://explorer-test.aelf.io/',
    TDVV: 'https://explorer-test-side02.aelf.io/',
    TDVW: 'https://explorer-test-side02.aelf.io/',
  },
  [ENVIRONMENT.DEVELOPMENT]: {
    AELF: 'https://explorer-test.aelf.io/',
    TDVV: 'https://explorer-test-side02.aelf.io/',
    TDVW: 'https://explorer-test-side02.aelf.io/',
  },
  [ENVIRONMENT.DEVELOPMENT4]: {
    AELF: 'https://explorer-test.aelf.io/',
    TDVV: 'https://explorer-test-side02.aelf.io/',
    TDVW: 'https://explorer-test-side02.aelf.io/',
  },
  [ENVIRONMENT.PRODUCTION]: {
    AELF: 'https://explorer.aelf.io/',
    TDVV: 'https://tdvv-explorer.aelf.io/',
    TDVW: 'https://tdvv-explorer.aelf.io/',
  },
};

export const EXPLORE_URL = {
  AELF: explorerUrls[env].AELF,
  TDVV: explorerUrls[env].TDVV,
  TDVW: explorerUrls[env].TDVW,
};
