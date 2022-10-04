import classNames from 'classnames';

import Loading from 'components/loading';

import type { PageLoadingProps } from './types';

const PageLoading: React.FC<PageLoadingProps> = ({
  className,
  message = 'Loading data. This action may take a few seconds',
}: PageLoadingProps) => (
  <div className="absolute z-20 bg-black bg-opacity-40 backdrop-blur-sm top-0 bottom-0 right-0 left-0">
    <div
      className={classNames(
        'absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center text-white',
        className,
        {
          'text-white': !className,
        },
      )}
    >
      <Loading className="w-12 h-12 -ml-1 mr-3" />
      <p className="mt-6 text-center">{message}</p>
    </div>
  </div>
);

export default PageLoading;
