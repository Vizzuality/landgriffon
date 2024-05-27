import { FC } from 'react';
import { useSearchParams } from 'next/navigation';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useScenario } from '@/hooks/scenarios';

const AnalysisTableFooter: FC = () => {
  const searchParams = useSearchParams();
  const compareScenarioId = searchParams.get('compareScenarioId');

  const { data: scenarioName } = useScenario(compareScenarioId, undefined, {
    select: (scenario) => scenario?.title,
    enabled: Boolean(compareScenarioId),
  });

  return (
    <footer className="flex justify-between text-xs text-gray-500">
      <ul className="space-y-1">
        {Boolean(scenarioName) && (
          <li className="flex items-center space-x-2">
            <span className="relative pl-3 before:absolute before:left-0 before:top-1/2 before:h-3 before:w-[6px] before:shrink-0 before:grow-0 before:-translate-y-1/2 before:rounded before:bg-gray-900">
              {scenarioName}
            </span>
            <Separator className="h-[1px] w-[26px] text-gray-200" />
            <span className="text-gray-900">140</span>
            <Badge className="rounded-sm border border-gray-400 bg-transparent p-1 leading-3 text-gray-400 hover:bg-transparent">
              +70
            </Badge>
            <Separator className="h-[1px] w-[26px] text-gray-200" />
            <span>Difference</span>
          </li>
        )}
        <li className="flex items-center space-x-2">
          <span className="relative pl-3 before:absolute before:left-0 before:top-1/2 before:h-3 before:w-[6px] before:shrink-0 before:grow-0 before:-translate-y-1/2 before:rounded before:bg-gray-300">
            Actual data
          </span>
          <Separator className="h-[1px] w-[26px] text-gray-200" />
          <span className="text-gray-400 line-through">70</span>
        </li>
      </ul>
    </footer>
  );
};

export default AnalysisTableFooter;
