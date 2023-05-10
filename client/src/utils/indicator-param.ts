import { useRouter } from 'next/router';

export const useIndicatorParam = () => {
  const { query = {}, replace } = useRouter();
  return (indicator: string) => {
    replace({ query: { ...query, indicator } }, undefined, {
      shallow: true,
    });
  };
};
