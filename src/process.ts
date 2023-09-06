// https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits

import { prisma } from 'db';
import { logger } from 'utils/logger';

process.stdin.resume(); //so the program will not close instantly

type ExitHandlerOptions = {
  cleanup: boolean;
  exit: boolean;
};

async function exitHandler(options: ExitHandlerOptions, exitCode: number) {
  if (options.cleanup) {
    logger.info('database disconnecting...');
    await prisma.$disconnect();
  }
  if (exitCode || exitCode === 0) logger.info('exiting: ', exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
