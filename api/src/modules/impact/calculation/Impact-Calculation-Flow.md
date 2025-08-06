# Impact Calculation Flow

This readme file aims to give an overview of the new Impact Calculation Flow. This flow can be enabled by setting the feature flag environment variable `FLAGS_USE_NEW_IMPACT_FLOW` to true, and it gets executed on :

- `sourcing-data-import.service.ts` on the parsing of a new Excel file with impact factor data, to recalculate all the impacts with the new/updated factors.
- `intervention-builder.service.ts` after the creation of an intervention, to calculate the data for the new locations.

## Process

All calculations are done in `calculateImpacts` in the `ImpactCalculator` class, summarized in these steps:

```typescript
get Strategies
for each location {
  	precalculate for all strategies
	for each sourcing record in location {
		for each strategy {
			calculate final values
		}
		create and save indicator records
	}
}
```


### Strategies 
There is a group of classes that represent each of the calculation strategies, one for each Indicator. These classes implement the `IndicatorCalculationStrategy` interface, with the declaration of two main methods that are to be implenented by concrete classes for each indicator, used in the main flow:

- `preCalculate`: this involves getting base data needed for the calculation, usually the indicator H3Data Source, production H3Ddata Source, fetching the actual H3 index list of the corresponding location, and the raw impact value for the indicator. These values are fetched from the `ImpactCalculationRepository`, which is set up to cache the results of the the queries, as there could be a lot of repetition (many locations with the same material and in turn same Production H3Data Source, Indicator H3Data Source, geo region index list, etc)
- `calculate`: this method is responsible for the actual calculation of the indicator, using the aggregated calculation context so far for a given location.

Because there are several indicators where calculated result depend on the result of other indicators, all the calculations results are aggregated into a `CalculationContext` object, which is passed to the `calculate` method of each strategy. To achieve this, Strategies are calculated in a **sorted order, by priority**. Each Strategy has a priority value, depending on what dependencies it has with other indicators.

- Indicators with `0` priority are base indicators, that don't depend on any other indicator, and are calculated first.
- Indicators with `1` priority depend on the calculated values of indicator with 0 priority.
- Indicators with `2` priority depend on the calculated values of indicators with 0 and 1 priority, and so on.

**Important TODO**: This process assumes that all required indicators in the dependencies of each indicator are provided in the list of `activeIndicators` passed to the `calculateImpacts` method. If an indicator is not provided, it will not be calculated, and the calculation of dependent indicators will fail. This is a limitation that should be addressed in the future. 

### Calculation for Interventions

There's a variant calculation flow in `calculateDataForIntervention`, specific for the calculations resulted from new Locations create in an intervention. The main difference being the possibility to pass a set of provided coefficients, that will override the values that would be calculated in the normal flow.

```typescript
get Strategies
for each location {
	if (providedCoefficients not null) {
		create and save indicator records from provided coefficients
	} else {
		// This is the same as the main flow
		precalculate for all strategies
		for each sourcing record in location {
			for each strategy {
				calculate final values
			}
			create and save indicator records
		}
	}
  	
}
```

