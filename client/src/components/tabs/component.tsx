import classNames from 'classnames';
import Link from 'next/link';

import type { TabsProps } from './types';

const Tabs: React.FC<TabsProps> = ({ activeTab, tabs, bottomBorder = true }: TabsProps) => (
  <div className={classNames('flex text-sm', { 'border-b border-gray-200': !!bottomBorder })}>
    {Object.values(tabs).map((tab, index) => (
      <Link
        key={tab.name}
        href={tab.href}
        className={classNames('-mb-px py-3', {
          'ml-10': index !== 0,
          'text-green-700 border-green-700 border-b-2': activeTab && tab === activeTab,
        })}
      >
        {tab.name}
      </Link>
    ))}
  </div>
);

export default Tabs;
