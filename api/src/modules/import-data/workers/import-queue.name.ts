import * as config from 'config';

export const importQueueName: string = config.get('queue.importQueueName');
