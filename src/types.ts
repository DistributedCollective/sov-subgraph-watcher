export type TaskData = {
  blockNumber: number;
  lastProcessedBlock: number;
};

export type TaskInterface = {
  id: string;
  run: (data: TaskData) => Promise<void>;
};
