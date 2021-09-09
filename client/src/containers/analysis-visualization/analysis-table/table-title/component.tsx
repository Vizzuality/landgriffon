import { SwitchVerticalIcon } from '@heroicons/react/outline';

interface TitleProps {
  title: string;
}

const Title: React.FC<TitleProps> = ({ title }: TitleProps) => (
  <div className="flex items-center">
    <p className="m-0">{title}</p>
    <button type="button" onClick={() => console.log('sort column')}>
      {' '}
      <SwitchVerticalIcon className="w-3 h-3 mx-4 text-black" />
    </button>
  </div>
);

export default Title;
