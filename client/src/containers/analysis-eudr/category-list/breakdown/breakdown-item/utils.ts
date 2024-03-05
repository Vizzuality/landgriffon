import { cloneElement } from 'react';

import CocoaSVG from '@/components/icons/commodities/cocoa';
import SoySVG from '@/components/icons/commodities/soy';
import RubberSVG from '@/components/icons/commodities/rubber';
import WoodSVG from '@/components/icons/commodities/wood';
import CoffeeSVG from '@/components/icons/commodities/coffee';
import PalmOilSVG from '@/components/icons/commodities/palm-oil';
import CattleSVG from '@/components/icons/commodities/cattle';
import { cn } from '@/lib/utils';

export type CommodityName = 'cocoa' | 'soy' | 'rubber' | 'wood' | 'coffee' | 'palm-oil' | 'cattle';

const SVGS_DICTIONARY = {
  cocoa: CocoaSVG,
  soy: SoySVG,
  rubber: RubberSVG,
  wood: WoodSVG,
  coffee: CoffeeSVG,
  'palm-oil': PalmOilSVG,
  cattle: CattleSVG,
};

export function getCommodityIconByName(
  commodity: CommodityName,
  iconProps?: React.SVGProps<SVGSVGElement>,
) {
  const Icon = SVGS_DICTIONARY[commodity];

  if (Icon === undefined) return null;

  return cloneElement(Icon(), {
    ...iconProps,
    className: cn('w-[56px] h-[56px]', iconProps?.className),
  });
}
