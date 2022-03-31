import * as config from 'config';

export const importQueueName: string = config.get('redis.importQueueName');
