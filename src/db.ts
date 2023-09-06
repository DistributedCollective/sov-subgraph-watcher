import { PrismaClient } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library';

import config from 'config';

const { user, password, host, port, name } = config.db;

export const prisma = new PrismaClient({
  datasourceUrl: `postgresql://${user}:${password}@${host}:${port}/${name}`,
  log: config.db.debug ? ['query', 'info', 'warn'] : ['error'],
});

export type PrismaTx = Omit<typeof prisma, ITXClientDenyList>;

export const db = (tx?: PrismaTx) => tx ?? prisma;
