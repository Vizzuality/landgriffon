import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MaterialsService } from 'modules/materials/materials.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { IndicatorSourcesService } from 'modules/indicator-sources/indicator-sources.service';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { UnitConversionsService } from 'modules/unit-conversions/unit-conversions.service';
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';

/**
 * @note: Formula for Waterfootprint calculus:
 * Water risk  (m3 / year ) =  blue water footprint (mm / yr) * harvest area portion in that location  * 1/1000(unit conversion)
 *
 */

@Injectable()
export class RiskMapService {
  constructor(
    @Inject(forwardRef(() => H3DataService))
    private readonly h3dataService: H3DataService,
    private readonly materialService: MaterialsService,
    private readonly indicatorService: IndicatorsService,
    private readonly indicatorSourceService: IndicatorSourcesService,
    private readonly unitConversionsService: UnitConversionsService,
  ) {}

  async calculateRiskMapByMaterialAndIndicator(
    materialId: string,
    indicatorId: string,
  ): Promise<H3IndexValueData[]> {
    const indicator = await this.indicatorService.getIndicatorById(indicatorId);
    if (!indicator.h3Grid)
      throw new NotFoundException(
        `There is no H3 Data for Indicator: ${indicator.name}`,
      );
    const material = await this.materialService.getMaterialById(materialId);
    if (!material.h3Grid)
      throw new NotFoundException(
        `There is no H3 Data for Material: ${material.name}`,
      );
    const unitConversion = await this.unitConversionsService.getUnitConversionByUnitId(
      indicator.unit.id,
    );

    return await this.h3dataService.calculateRiskMapByMaterialAndIndicator(
      indicator.h3Grid,
      material.h3Grid,
      unitConversion.factor as number,
    );
  }
}
