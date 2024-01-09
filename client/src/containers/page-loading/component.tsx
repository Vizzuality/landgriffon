import classNames from 'classnames';

import Loading from 'components/loading';

import type { PageLoadingProps } from './types';

const PageLoading: React.FC<PageLoadingProps> = ({
  className,
  message = 'Loading data. This action may take a few seconds',
}: PageLoadingProps) => (
  <div className="absolute bottom-0 left-0 right-0 top-0 z-20 bg-black bg-opacity-40 backdrop-blur-sm">
    <div
      className={classNames(
        'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-white',
        className,
        {
          'text-white': !className,
        },
      )}
    >
      <Loading className="-ml-1 mr-3 h-12 w-12" />
      <p className="mt-6 text-center">{message}</p>
    </div>
  </div>
);

export default PageLoading;
