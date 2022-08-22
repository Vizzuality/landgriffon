import { useEffectOnceWhen } from 'rooks';

const useEffectOnce = (callback: () => void) => useEffectOnceWhen(callback, true);

export default useEffectOnce;
