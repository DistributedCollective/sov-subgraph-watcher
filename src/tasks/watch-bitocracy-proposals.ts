import { parse } from 'graphql';
import { gql } from 'graphql-request';

import { prisma } from 'db';
import { TaskInterface } from 'types';
import { logger } from 'utils/logger';
import { MessageType, NotificationType, notifyAll } from 'utils/notify';
import { client } from 'utils/subgraph';

const log = logger.child({ module: 'watchBitocracyProposals' });

function watchBitocracyProposals(): TaskInterface {
  return {
    id: 'watchBitocracyProposals',
    run: async ({ blockNumber }) => {
      // retrieve proposal ids that can still be voted on from subgraph.
      const document = parse(gql`
        query {
          proposals(where: { endBlock_gt: ${blockNumber} }, first: 10, orderBy: timestamp, orderDirection: desc) {
            id
          }
        }
      `);

      const proposalList = await client
        .request<{ proposals: [{ id: string }] }>({ document })
        .then((res) => res.proposals.map((p) => p.id));

      const existing = await prisma.proposal.findMany({ where: { id: { in: proposalList } } });
      const existingIds = existing.map((p) => p.id);
      const newProposals = proposalList.filter((id) => !existingIds.includes(id));

      if (newProposals.length > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.proposal.createMany({
            data: newProposals.map((id) => ({ id })),
            skipDuplicates: true,
          });

          log.info(`found ${newProposals.length} new proposals, will send notifications`);
          return await notifyAll(NotificationType.BitocracyVote, {
            messageType: MessageType.BitocracyVote,
            frequency: 1,
            messageProperties: {},
            triggered: true,
          });
        });
      } else {
        log.info('no new proposals found');
      }
    },
  };
}

export default watchBitocracyProposals;
