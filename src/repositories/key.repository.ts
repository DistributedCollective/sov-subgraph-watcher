import { PrismaTx, db } from 'db';

export enum Keys {
  lastBlock = 'lastBlock',
  initialBlock = 'initialBlock',
}

export const keyRepository = {
  get: async (key: Keys, tx?: PrismaTx): Promise<string | null> => {
    return await db(tx)
      .keyValue.findFirst({ where: { key } })
      .then((x) => (x?.value ?? null) as string);
  },
  set: async (key: Keys, value: string, tx?: PrismaTx) => {
    await db(tx).keyValue.upsert({
      where: { key },
      update: { value },
      create: { key, value: value },
    });
  },
};
