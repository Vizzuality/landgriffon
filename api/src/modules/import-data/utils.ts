import * as path from 'path';

interface WorkerConfig {
  workerPath: string;
  execArgv: string[];
}

// Since node workers do not support ts out of the box, we need to specify the JS file for the app, but TS file for the tests.

export const getWorkerConfig = (fileName: string): WorkerConfig => {
  const isTestEnvironment: boolean = process.env.NODE_ENV === 'test';
  const workerPath: WorkerConfig['workerPath'] = isTestEnvironment
    ? path.resolve(__dirname, `./workers/${fileName}.ts`)
    : path.resolve(__dirname, `./workers/${fileName}.js`);

  const execArgv: WorkerConfig['execArgv'] = isTestEnvironment
    ? ['-r', 'ts-node/register']
    : [];

  return { workerPath, execArgv };
};
