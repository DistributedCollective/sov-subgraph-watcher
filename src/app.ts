import { blockWatcher } from 'modules/block-watcher';
import watchBitocracyProposals from 'tasks/watch-bitocracy-proposals';
import { logger } from 'utils/logger';

logger.info('service is ready...');

// register tasks to be run on each block
// @dev all tasks will be run in parallel, so make sure they don't conflict with each other
//   e.g. don't write to the same table
// @dev next tick will only be triggered when all tasks are completed
blockWatcher.registerTasks([watchBitocracyProposals()]);

// start the loop
blockWatcher.start();
