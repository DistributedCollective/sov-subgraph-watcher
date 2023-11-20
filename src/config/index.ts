import convict from 'convict';

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'production',
    env: 'NODE_ENV',
  },
  db: {
    debug: {
      doc: 'The prisma debug mode.',
      format: Boolean,
      default: false,
      env: 'PRISMA_DEBUG',
      arg: 'debug',
    },
    user: {
      doc: 'The database user.',
      format: String,
      default: null,
      env: 'POSTGRES_USER',
    },
    password: {
      doc: 'The database password.',
      format: String,
      default: null,
      env: 'POSTGRES_PASSWORD',
      sensitive: true,
    },
    host: {
      doc: 'The database host.',
      format: String,
      default: null,
      env: 'POSTGRES_HOST',
    },
    port: {
      doc: 'The database port.',
      format: Number,
      default: null,
      env: 'POSTGRES_PORT',
    },
    name: {
      doc: 'The database name.',
      format: String,
      default: null,
      env: 'POSTGRES_DB',
    },
  },
  logger: {
    appName: {
      doc: 'The application name.',
      format: String,
      default: null,
      nullable: true,
      env: 'APP_NAME',
      arg: 'app-name',
    },
    logLevel: {
      doc: 'The log level.',
      format: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
      default: 'info',
      env: 'LOG_LEVEL',
      arg: 'log-level',
    },
  },
  subgraph: {
    url: {
      doc: 'The subgraph url.',
      format: String,
      default: null,
      env: 'SUBGRAPH_URL',
      arg: 'subgraph-url',
    },
    errorPolicy: {
      doc: 'The subgraph error policy.',
      format: ['none', 'ignore', 'all'],
      default: 'all',
      env: 'SUBGRAPH_ERROR_POLICY',
      arg: 'subgraph-error-policy',
    },
  },
  notify: {
    doc: 'The notify url.',
    format: String,
    default: 'http://sov-notification-service-notify:8082',
    env: 'NOTIFICATION_SERVICE_URL',
    arg: 'notify',
  },
  options: {
    blockTime: {
      doc: 'The block time in miliseconds.',
      format: Number,
      default: 15_000,
      env: 'BLOCK_TIME',
      arg: 'block-time',
    },
  },
  isTestnet: {
    doc: 'The testnet flag.',
    format: Boolean,
    default: false,
    env: 'IS_TESTNET',
    arg: 'testnet',
  },
  discordWebhookUrlForSip: {
    doc: 'The discord webhook url for sip.',
    format: String,
    default: null,
    env: 'DISCORD_WEBHOOK_URL',
  },
});

try {
  config.validate({ allowed: 'strict' });
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('\x1b[31m%s\x1b[0m', 'CONFIG ERROR: ', error.message);
  process.exit(1);
}

export default config.getProperties();
