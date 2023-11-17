import { parse } from 'graphql';
import { gql } from 'graphql-request';

import config from 'config';
import { prisma } from 'db';
import { TaskInterface } from 'types';
import { DiscordMessageBody, Embed, sendDiscordMessage } from 'utils/discord';
import { logger } from 'utils/logger';
import { client } from 'utils/subgraph';

const log = logger.child({ module: 'watchBitocracyProposals' });

type QueryType = {
  id: string;
  proposalId: number;
  proposer: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  startBlock: number;
  endBlock: number;
  description: string;
  timestamp: number;
  created: { id: string };
};

function sendSipAlertsToDiscord(): TaskInterface {
  return {
    id: 'sendSipAlertsToDiscord',
    run: async ({ lastProcessedBlock, blockNumber }) => {
      // get all proposals since last processed block,
      // or if it's the first run, get all proposals in the last 5000 blocks (roughly 40 hours)
      const document = parse(gql`
        query {
          proposals(where: { startBlock_gte: ${
            lastProcessedBlock > 0 ? lastProcessedBlock - 1 : blockNumber - 5000
          } }, orderBy: timestamp, orderDirection: desc) {
            id
            proposalId
            proposer
            targets
            values
            signatures
            calldatas
            startBlock
            endBlock
            description
            timestamp,
            created { id }
          }
        }
      `);

      const proposalList = await client.request<{ proposals: QueryType[] }>({ document }).then((res) => res.proposals);

      const proposalIds = proposalList.map((p) => p.id);

      const existing = await prisma.proposalForAlert.findMany({ where: { id: { in: proposalIds } } });
      const existingIds = existing.map((p) => p.id);
      const newProposals = proposalIds.filter((id) => !existingIds.includes(id));

      if (newProposals.length > 0) {
        await prisma.$transaction(async (tx) => {
          await tx.proposalForAlert.createMany({
            data: newProposals.map((id) => ({ id })),
            skipDuplicates: true,
          });

          log.info(`found ${newProposals.length} new sips, send discord alerts`);

          const embeds = newProposals.map((id) => {
            const proposal = proposalList.find((p) => p.id === id);
            const alert: Partial<Embed> = {
              title: proposal.description.substring(0, 64),
              url: `https://sovryn.app/bitocracy/${proposal.id}`,
              description: proposal.description.substring(0, 2048),
              color: 0x00ff00,
              fields: [
                {
                  name: 'Proposal ID',
                  value: proposal.proposalId.toString(),
                  inline: true,
                },
                {
                  name: 'Date',
                  value: new Date(proposal.timestamp * 1000).toISOString(),
                  inline: true,
                },
                {
                  name: 'Transaction Hash',
                  value: `[${proposal.created.id}](https://explorer.rsk.co/tx/${proposal.created.id})`,
                },
                {
                  name: 'Proposer',
                  value: `[${proposal.proposer}](https://explorer.rsk.co/address/${proposal.proposer})`,
                },
                {
                  name: 'Targets',
                  value: proposal.targets.map((t) => '- `' + t + '`').join('\n'),
                },
                {
                  name: 'Signatures',
                  value: proposal.signatures.map((t) => '- `' + t + '`').join('\n'),
                },
                {
                  name: 'Values',
                  value: proposal.values.map((t) => '- `' + t + '`').join('\n'),
                },
                {
                  name: 'Calldatas',
                  value: proposal.calldatas.map((t) => '- `' + t + '`').join('\n'),
                },
              ],
            };
            return alert;
          });

          const message: Partial<DiscordMessageBody> = {
            content: embeds.length > 1 ? `Found ${embeds.length} SIPS:` : undefined,
            embeds: embeds.slice(0, 5),
          };

          return await sendDiscordMessage(config.discordWebhookUrlForSip, message);
        });
      } else {
        log.info('no new SIPs found to alert');
      }
    },
  };
}

export default sendSipAlertsToDiscord;
