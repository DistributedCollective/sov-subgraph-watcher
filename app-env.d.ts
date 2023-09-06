declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PRISMA_DEBUG: 'true' | 'false';
    DATABASE_URL: string;
    SUBGRAPH_URL: string;
    NOTIFICATION_SERVICE_URL: string;
  }
}
