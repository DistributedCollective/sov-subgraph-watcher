import pino from 'pino';

import config from 'config';

const { env, logger: loggerConfig } = config;

export const logger = pino({
  name: loggerConfig?.appName ?? 'sov-subgraph-watcher',
  level: loggerConfig.logLevel,
  transport: env === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});
