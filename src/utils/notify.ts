import config from 'config';

import { cleanUrl } from './helpers';
import { logger } from './logger';

export enum MessageType {
  BitocracyVote = 'BitocracyVote',
  ZeroRecovery = 'ZeroRecovery',
}

export enum NotificationType {
  BitocracyVote = 'BitocracyVote',
}

export type NotifyAllOptions = {
  messageType: MessageType;
  frequency: number; // in hours, 1-100
  messageProperties: Record<string, any>;
  triggered: boolean;
  overrides?: any;
};

const log = logger.child({ module: 'NotifyUtil' });

export const notifyAll = async (type: NotificationType, options: NotifyAllOptions) => {
  return fetch(cleanUrl(`${config.notify}/message/all/email/${type}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(options),
  }).then(async (res) => {
    log.info('notifyAll:: ACK', res.ok, res.status, res.statusText);
    if (res.ok) {
      return await res.json();
    }

    if (res.status === 422) {
      const result = await res.json();
      if (isNotifyHttpError(res.status, result)) {
        throw new Error(result.error.errors.map((e) => `${e.param}: ${e.msg}`).join(', '));
      }
    }

    throw new Error('notifyAll:: request failed with unknown reason: ' + res);
  });
};

export interface NotifyHttpError {
  message: string;
  error: {
    name: string;
    statusCode: number;
    isOperational: boolean;
    errors: {
      value: string;
      msg: string;
      param: string;
      location: string;
    }[];
  };
  stack?: string;
}

export const isNotifyHttpError = (status: number, response: any): response is NotifyHttpError => {
  return status === 422 && response.error && response.error.statusCode === 422;
};
