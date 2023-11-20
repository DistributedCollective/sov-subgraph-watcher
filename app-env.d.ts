declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PRISMA_DEBUG: 'true' | 'false';
    DATABASE_URL: string;
    SUBGRAPH_URL: string;
    NOTIFICATION_SERVICE_URL: string;
    DISCORD_WEBHOOK_URL: string;
    IS_TESTNET: 'true' | 'false';
  }
}
