import { parse } from 'graphql';
import { GraphQLClient, gql } from 'graphql-request';
import { ErrorPolicy } from 'graphql-request/build/esm/types';

import config from 'config';

import { cleanUrl } from './helpers';

export const client = new GraphQLClient(cleanUrl(config.subgraph.url), {
  errorPolicy: config.subgraph.errorPolicy as ErrorPolicy,
});

export const queryBlockNumber = async () => {
  const document = parse(gql`
    query {
      _meta {
        block {
          number
        }
      }
    }
  `);

  return await client
    .request<{ _meta: { block: { number: number } } }>({ document })
    .then((res) => res._meta.block.number);
};
