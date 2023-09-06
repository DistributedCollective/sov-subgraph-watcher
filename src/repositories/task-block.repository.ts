import { PrismaTx, db } from 'db';

export const taskBlockRepository = {
  get: async (id: string, tx?: PrismaTx): Promise<number> => {
    return await db(tx)
      .taskBlock.findUnique({ where: { id } })
      .then((x) => x?.block ?? 0);
  },
  set: async (id: string, block: number, tx?: PrismaTx) => {
    await db(tx).taskBlock.upsert({
      where: { id },
      update: { id, block },
      create: { id, block },
    });
  },
};
