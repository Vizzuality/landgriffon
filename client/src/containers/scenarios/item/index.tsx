import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';
import Component from './component';

const ScenarioItemContainer = (props) => {
  const { visualizationMode } = useAppSelector(analysis);
  const componentProps = {
    data: null,
    isSelected: false,
    isComparisonEnabled: false,
    ...props,
    isComparisonAvailable: visualizationMode !== 'map',
  };

  return <Component {...componentProps} />;
};

export default ScenarioItemContainer;
