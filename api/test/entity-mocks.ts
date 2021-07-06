import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { IndicatorSource } from 'modules/indicator-sources/indicator-source.entity';
import { Layer } from 'modules/layers/layer.entity';

async function createIndicatorCoefficient(
  additionalData: Partial<IndicatorCoefficient> = {
    year: 2000,
  },
): Promise<IndicatorCoefficient> {
  const indicatorCoefficient = IndicatorCoefficient.merge(
    new IndicatorCoefficient(),
    additionalData,
  );

  if (!indicatorCoefficient.indicatorSourceId) {
    const indicatorSource: IndicatorSource = await createIndicatorSource();
    indicatorCoefficient.indicatorSource = indicatorSource;
  }

  return indicatorCoefficient.save();
}

async function createIndicatorSource(
  additionalData: Partial<IndicatorSource> = {
    title: 'Indicator Source title',
  },
): Promise<IndicatorSource> {
  const indicatorSource = IndicatorSource.merge(
    new IndicatorSource(),
    additionalData,
  );

  if (!indicatorSource.layerId) {
    const layer: Layer = await createLayer();
    indicatorSource.layer = layer;
  }

  return indicatorSource.save();
}

async function createLayer(
  additionalData: Partial<Layer> = {},
): Promise<Layer> {
  const layer = Layer.merge(new Layer(), additionalData);

  return layer.save();
}

export { createIndicatorCoefficient, createIndicatorSource, createLayer };
