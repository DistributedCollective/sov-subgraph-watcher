import { Observable, Subject, Subscription, delay, startWith } from 'rxjs';

import config from 'config';
import { Keys, keyRepository } from 'repositories/key.repository';
import { taskBlockRepository } from 'repositories/task-block.repository';
import { TaskInterface } from 'types';
import { logger } from 'utils/logger';
import { queryBlockNumber } from 'utils/subgraph';

const log = logger.child({ module: 'TaskRunner' });

class TaskRunner {
  private tasks: TaskInterface[] = [];

  private subject = new Subject<number>();
  private source: Observable<number>;
  private subscription: Subscription;

  constructor(interval: number) {
    this.source = this.subject.pipe(startWith(0), delay(interval));
  }

  public registerTask(task: TaskInterface) {
    const exists = this.tasks.find((t) => t.id === task.id);
    if (exists) {
      throw new Error(`Task ${task.id} already exists`);
    }
    log.info(`registered task ${task.id}`);
    this.tasks.push(task);
  }

  public registerTasks(tasks: TaskInterface[]) {
    tasks.forEach((task) => this.registerTask(task));
  }

  public start() {
    if (this.subscription) {
      log.warn('TaskRunner already started');
      return;
    }
    this.subscription = this.source.subscribe(this.handleNextTick.bind(this));
  }

  public stop() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  protected async runTask(task: TaskInterface, pendingBlock: number) {
    log.info(`running task ${task.id} on block ${pendingBlock}`);

    const lastProcessedBlock = await taskBlockRepository.get(task.id);
    if (pendingBlock <= lastProcessedBlock) {
      log.info(`task ${task.id} is up to date with block ${pendingBlock}`);
      return;
    }

    return await task
      .run({
        blockNumber: pendingBlock,
        lastProcessedBlock,
      })
      .then(async () => {
        await taskBlockRepository.set(task.id, pendingBlock);
        log.info(
          `completed running task ${task.id} on block ${pendingBlock}; ${lastProcessedBlock} -> ${pendingBlock}`,
        );
      })
      .catch((error) => {
        log.warn(`task ${task.id} failed on block ${pendingBlock}`, error?.message ?? error);
      });
  }

  private async handleNextTick(value: number) {
    const lastBlock = await keyRepository.get(Keys.lastBlock).then((x) => Number(x ?? 0));
    const pendingBlock = await queryBlockNumber();

    if (lastBlock >= pendingBlock) {
      log.info('there is no pending blocks, will try again next tick', { lastBlock, pendingBlock });
    } else {
      log.info('tasks will be ran on pending block', { lastBlock, pendingBlock });

      await Promise.all(this.tasks.map((task) => this.runTask(task, pendingBlock)));
      await keyRepository.set(Keys.lastBlock, String(pendingBlock));
    }

    this.subject.next(value + 1);
  }
}

export const blockWatcher = new TaskRunner(config.options.blockTime);
