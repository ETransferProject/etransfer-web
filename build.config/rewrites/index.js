const devConfig = require('./development');
const proConfig = require('./production');
const { NEXT_PUBLIC_NODE_ENV } = process.env;

module.exports = NEXT_PUBLIC_NODE_ENV === 'production' ? proConfig : devConfig;
