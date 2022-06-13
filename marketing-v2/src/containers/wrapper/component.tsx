import { ReactNode } from 'react';

export interface WrapperProps {
  children: ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children }: WrapperProps) => {
  return <div className="max-w-5xl px-5 mx-auto lg:px-10">{children}</div>;
};

export default Wrapper;
