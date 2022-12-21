/*
 * Copyright 2022 FlowmapBlue
 * Copyright 2018-2020 Teralytics, modified by FlowmapBlue
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { bounds } from '@mapbox/geo-viewport';
import { ascending, descending, extent, min } from 'd3-array';
import { nest } from 'd3-collection';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import KDBush from 'kdbush';
import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
  ParametricSelector,
} from 'reselect';
import { alea } from 'seedrandom';
import { clusterLocations } from './cluster/cluster';
import {
  buildIndex,
  ClusterIndex,
  findAppropriateZoomLevel,
  makeLocationWeightGetter,
} from './cluster/ClusterIndex';
import getColors, {
  getColorsRGBA,
  getDiffColorsRGBA,
  getFlowColorScale,
  isDiffColors,
  isDiffColorsRGBA,
} from './colors';
import FlowMapAggregateAccessors from './FlowMapAggregateAccessors';
import { FlowMapState } from './FlowMapState';
import {
  getTimeGranularityByKey,
  getTimeGranularityByOrder,
  getTimeGranularityForDate,
  TimeGranularityKey,
} from './time';
import {
  AggregateFlow,
  Cluster,
  ClusterNode,
  CountByTime,
  FlowAccessors,
  FlowCirclesLayerAttributes,
  FlowLinesLayerAttributes,
  FlowMapData,
  FlowMapDataAccessors,
  isCluster,
  isLocationClusterNode,
  LayersData,
  LocationFilterMode,
  LocationTotals,
} from './types';
import { flatMap } from './util';

const MAX_CLUSTER_ZOOM_LEVEL = 20;
const NUMBER_OF_FLOWS_TO_DISPLAY = 5000;
type KDBushTree = any;

export type Selector<L, F, T> = ParametricSelector<FlowMapState, FlowMapData<L, F>, T>;

export default class FlowMapSelectors<L, F> {
  accessors: FlowMapAggregateAccessors<L, F>;

  constructor(accessors: FlowMapDataAccessors<L, F>) {
    this.accessors = new FlowMapAggregateAccessors(accessors);
    this.setAccessors(accessors);
  }

  setAccessors(accessors: FlowMapDataAccessors<L, F>) {
    this.accessors = new FlowMapAggregateAccessors(accessors);
  }

  getFetchedFlows = (state: FlowMapState, props: FlowMapData<L, F>) => props.flows;
  getFetchedLocations = (state: FlowMapState, props: FlowMapData<L, F>) => props.locations;
  getSelectedLocations = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.filterState.selectedLocations;
  getLocationFilterMode = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.filterState.locationFilterMode;
  getClusteringEnabled = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.settingsState.clusteringEnabled;
  getLocationTotalsEnabled = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.settingsState.locationTotalsEnabled;
  getZoom = (state: FlowMapState, props: FlowMapData<L, F>) => state.viewport.zoom;
  getViewport = (state: FlowMapState, props: FlowMapData<L, F>) => state.viewport;
  getSelectedTimeRange = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.filterState.selectedTimeRange;

  getColorSchemeKey: Selector<L, F, string | undefined> = (
    state: FlowMapState,
    props: FlowMapData<L, F>,
  ) => state.settingsState.colorScheme;

  getDarkMode: Selector<L, F, boolean> = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.settingsState.darkMode;

  getFadeEnabled: Selector<L, F, boolean> = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.settingsState.fadeEnabled;

  getFadeAmount: Selector<L, F, number> = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.settingsState.fadeAmount;

  getAnimate: Selector<L, F, boolean> = (state: FlowMapState, props: FlowMapData<L, F>) =>
    state.settingsState.animationEnabled;

  getInvalidLocationIds: Selector<L, F, string[] | undefined> = createSelector(
    this.getFetchedLocations,
    (locations) => {
      if (!locations) return undefined;
      const invalid = [];
      for (const location of locations) {
        const id = this.accessors.getLocationId(location);
        const [lon, lat] = this.accessors.getLocationCentroid(location) || [NaN, NaN];
        if (!(-90 <= lat && lat <= 90) || !(-180 <= lon && lon <= 180)) {
          invalid.push(id);
        }
      }
      return invalid.length > 0 ? invalid : undefined;
    },
  );

  getLocations: Selector<L, F, L[] | undefined> = createSelector(
    this.getFetchedLocations,
    this.getInvalidLocationIds,
    (locations, invalidIds) => {
      if (!locations) return undefined;
      if (!invalidIds || invalidIds.length === 0) return locations;
      const invalid: any = new Set(invalidIds);
      return locations.filter(
        (location: L) => !invalid.has(this.accessors.getLocationId(location)),
      );
    },
  );

  getLocationIds: Selector<L, F, Set<string> | undefined> = createSelector(
    this.getLocations,
    (locations) => (locations ? new Set(locations.map(this.accessors.getLocationId)) : undefined),
  );

  getSelectedLocationsSet: Selector<L, F, Set<string> | undefined> = createSelector(
    this.getSelectedLocations,
    (ids) => (ids && ids.length > 0 ? new Set(ids) : undefined),
  );

  getSortedFlowsForKnownLocations: Selector<L, F, F[] | undefined> = createSelector(
    this.getFetchedFlows,
    this.getLocationIds,
    (flows, ids) => {
      if (!ids || !flows) return undefined;
      return flows
        .filter(
          (flow: F) =>
            ids.has(this.accessors.getFlowOriginId(flow)) &&
            ids.has(this.accessors.getFlowDestId(flow)),
        )
        .sort((a: F, b: F) =>
          descending(
            Math.abs(this.accessors.getFlowMagnitude(a)),
            Math.abs(this.accessors.getFlowMagnitude(b)),
          ),
        );
    },
  );

  getActualTimeExtent: Selector<L, F, [Date, Date] | undefined> = createSelector(
    this.getSortedFlowsForKnownLocations,
    (flows) => {
      if (!flows) return undefined;
      let start = null;
      let end = null;
      for (const flow of flows) {
        const time = this.accessors.getFlowTime(flow);
        if (time) {
          if (start == null || start > time) start = time;
          if (end == null || end < time) end = time;
        }
      }
      if (!start || !end) return undefined;
      return [start, end];
    },
  );

  getTimeGranularityKey: Selector<L, F, TimeGranularityKey | undefined> = createSelector(
    this.getSortedFlowsForKnownLocations,
    this.getActualTimeExtent,
    (flows, timeExtent) => {
      if (!flows || !timeExtent) return undefined;

      const minOrder = min(flows, (d) => {
        const t = this.accessors.getFlowTime(d);
        return t ? getTimeGranularityForDate(t).order : null;
      });
      if (minOrder == null) return undefined;
      const timeGranularity = getTimeGranularityByOrder(minOrder);
      return timeGranularity ? timeGranularity.key : undefined;
    },
  );

  getTimeExtent: Selector<L, F, [Date, Date] | undefined> = createSelector(
    this.getActualTimeExtent,
    this.getTimeGranularityKey,
    (timeExtent, timeGranularityKey) => {
      const timeGranularity = timeGranularityKey
        ? getTimeGranularityByKey(timeGranularityKey)
        : undefined;
      if (!timeExtent || !timeGranularity?.interval) return undefined;
      const { interval } = timeGranularity;
      return [timeExtent[0], interval.offset(interval.floor(timeExtent[1]), 1)];
    },
  );

  getSortedFlowsForKnownLocationsFilteredByTime: Selector<L, F, F[] | undefined> = createSelector(
    this.getSortedFlowsForKnownLocations,
    this.getTimeExtent,
    this.getSelectedTimeRange,
    (flows, timeExtent, timeRange) => {
      if (!flows) return undefined;
      if (
        !timeExtent ||
        !timeRange ||
        (timeExtent[0] === timeRange[0] && timeExtent[1] === timeRange[1])
      ) {
        return flows;
      }
      return flows.filter((flow) => {
        const time = this.accessors.getFlowTime(flow);
        return time && timeRange[0] <= time && time < timeRange[1];
      });
    },
  );

  getLocationsHavingFlows: Selector<L, F, L[] | undefined> = createSelector(
    this.getSortedFlowsForKnownLocations,
    this.getLocations,
    (flows, locations) => {
      if (!locations || !flows) return locations;
      const withFlows = new Set();
      for (const flow of flows) {
        withFlows.add(this.accessors.getFlowOriginId(flow));
        withFlows.add(this.accessors.getFlowDestId(flow));
      }
      return locations.filter((location: L) =>
        withFlows.has(this.accessors.getLocationId(location)),
      );
    },
  );

  getLocationsById: Selector<L, F, Map<string, L> | undefined> = createSelector(
    this.getLocationsHavingFlows,
    (locations) => {
      if (!locations) return undefined;
      return nest<L, L>()
        .key((d: L) => this.accessors.getLocationId(d))
        .rollup(([d]: any[]) => d)
        .map(locations) as any as Map<string, L>;
    },
  );

  getClusterIndex: Selector<L, F, ClusterIndex<F> | undefined> = createSelector(
    this.getLocationsHavingFlows,
    this.getLocationsById,
    this.getSortedFlowsForKnownLocations,
    (locations, locationsById, flows) => {
      if (!locations || !locationsById || !flows) return undefined;

      const getLocationWeight = makeLocationWeightGetter(
        flows,
        this.accessors.getFlowMapDataAccessors(),
      );
      const clusterLevels = clusterLocations(
        locations,
        this.accessors.getFlowMapDataAccessors(),
        getLocationWeight,
        {
          maxZoom: MAX_CLUSTER_ZOOM_LEVEL,
        },
      );
      const clusterIndex = buildIndex<F>(clusterLevels);
      const { getLocationName, getLocationClusterName } = this.accessors.getFlowMapDataAccessors();

      // Adding meaningful names
      const getName = (id: string) => {
        const loc = locationsById.get(id);
        if (loc) {
          return getLocationName ? getLocationName(loc) : this.accessors.getLocationId(loc) || id;
        }
        return `"${id}"`;
      };
      for (const level of clusterLevels) {
        for (const node of level.nodes) {
          // Here mutating the nodes (adding names)
          if (isCluster(node)) {
            const leaves = clusterIndex.expandCluster(node);

            leaves.sort((a, b) => descending(getLocationWeight(a), getLocationWeight(b)));

            if (getLocationClusterName) {
              node.name = getLocationClusterName(leaves);
            } else {
              const topId = leaves[0];
              const otherId = leaves.length === 2 ? leaves[1] : undefined;
              node.name = `"${getName(topId)}" and ${
                otherId ? `"${getName(otherId)}"` : `${leaves.length - 1} others`
              }`;
            }
          } else {
            (node as any).name = getName(node.id);
          }
        }
      }

      return clusterIndex;
    },
  );

  getAvailableClusterZoomLevels = createSelector(
    this.getClusterIndex,
    this.getSelectedLocations,
    (clusterIndex, selectedLocations): number[] | undefined => {
      if (!clusterIndex) {
        return undefined;
      }

      let maxZoom = Number.POSITIVE_INFINITY;
      let minZoom = Number.NEGATIVE_INFINITY;

      const adjust = (zoneId: string) => {
        const cluster = clusterIndex.getClusterById(zoneId);
        if (cluster) {
          minZoom = Math.max(minZoom, cluster.zoom);
          maxZoom = Math.min(maxZoom, cluster.zoom);
        } else {
          const zoom = clusterIndex.getMinZoomForLocation(zoneId);
          minZoom = Math.max(minZoom, zoom);
        }
      };

      if (selectedLocations) {
        for (const id of selectedLocations) {
          adjust(id);
        }
      }

      return clusterIndex.availableZoomLevels.filter(
        (level) => minZoom <= level && level <= maxZoom,
      );
    },
  );

  _getClusterZoom: Selector<L, F, number | undefined> = createSelector(
    this.getClusterIndex,
    this.getZoom,
    this.getAvailableClusterZoomLevels,
    (clusterIndex, mapZoom, availableClusterZoomLevels) => {
      if (!clusterIndex) return undefined;
      if (!availableClusterZoomLevels) {
        return undefined;
      }

      const clusterZoom = findAppropriateZoomLevel(availableClusterZoomLevels, mapZoom);
      return clusterZoom;
    },
  );

  getClusterZoom = (state: FlowMapState, props: FlowMapData<L, F>) => {
    const { settingsState } = state;
    if (!settingsState.clusteringEnabled) return undefined;
    if (settingsState.clusteringAuto || settingsState.clusteringLevel == null) {
      return this._getClusterZoom(state, props);
    }
    return settingsState.clusteringLevel;
  };

  getLocationsForSearchBox: Selector<L, F, (L | Cluster)[] | undefined> = createSelector(
    this.getClusteringEnabled,
    this.getLocationsHavingFlows,
    this.getSelectedLocations,
    this.getClusterZoom,
    this.getClusterIndex,
    (clusteringEnabled, locations, selectedLocations, clusterZoom, clusterIndex) => {
      if (!locations) return undefined;
      let result: (L | Cluster)[] = locations;
      // if (clusteringEnabled) {
      //   if (clusterIndex) {
      //     const zoomItems = clusterIndex.getClusterNodesFor(clusterZoom);
      //     if (zoomItems) {
      //       result = result.concat(zoomItems.filter(isCluster));
      //     }
      //   }
      // }

      if (result && clusterIndex && selectedLocations) {
        const toAppend = [];
        for (const id of selectedLocations) {
          const cluster = clusterIndex.getClusterById(id);
          if (
            cluster &&
            !result.find(
              (d) => (isLocationClusterNode(d) ? d.id : this.accessors.getLocationId(d)) === id,
            )
          ) {
            toAppend.push(cluster);
          }
        }
        if (toAppend.length > 0) {
          result = result.concat(toAppend);
        }
      }
      return result;
    },
  );

  getDiffMode: Selector<L, F, boolean> = createSelector(this.getFetchedFlows, (flows) => {
    if (flows && flows.find((f: F) => this.accessors.getFlowMagnitude(f) < 0)) {
      return true;
    }
    return false;
  });

  _getFlowMapColors = createSelector(
    this.getDiffMode,
    this.getColorSchemeKey,
    this.getDarkMode,
    this.getFadeEnabled,
    this.getFadeAmount,
    this.getAnimate,
    getColors,
  );

  getFlowMapColorsRGBA = createSelector(this._getFlowMapColors, (flowMapColors) => {
    return isDiffColors(flowMapColors)
      ? getDiffColorsRGBA(flowMapColors)
      : getColorsRGBA(flowMapColors);
  });

  getUnknownLocations: Selector<L, F, Set<string> | undefined> = createSelector(
    this.getLocationIds,
    this.getFetchedFlows,
    this.getSortedFlowsForKnownLocations,
    (ids, flows, flowsForKnownLocations) => {
      if (!ids || !flows) return undefined;
      if (flowsForKnownLocations && flows.length === flowsForKnownLocations.length)
        return undefined;
      const missing = new Set<string>();
      for (const flow of flows) {
        if (!ids.has(this.accessors.getFlowOriginId(flow)))
          missing.add(this.accessors.getFlowOriginId(flow));
        if (!ids.has(this.accessors.getFlowDestId(flow)))
          missing.add(this.accessors.getFlowDestId(flow));
      }
      return missing;
    },
  );

  getSortedAggregatedFilteredFlows: Selector<L, F, (F | AggregateFlow)[] | undefined> =
    createSelector(
      this.getClusterIndex,
      this.getClusteringEnabled,
      this.getSortedFlowsForKnownLocationsFilteredByTime,
      this.getClusterZoom,
      this.getTimeExtent,
      (clusterTree, isClusteringEnabled, flows, clusterZoom, timeExtent) => {
        if (!flows) return undefined;
        let aggregated: (F | AggregateFlow)[];
        if (isClusteringEnabled && clusterTree && clusterZoom != null) {
          aggregated = clusterTree.aggregateFlows(
            // TODO: aggregate across time
            // timeExtent != null
            //   ? aggregateFlows(flows) // clusterTree.aggregateFlows won't aggregate unclustered across time
            //   : flows,
            flows,
            clusterZoom,
            this.accessors.getFlowMapDataAccessors(),
          );
        } else {
          aggregated = aggregateFlows(flows, this.accessors.getFlowMapDataAccessors());
        }
        aggregated.sort((a, b) =>
          descending(
            Math.abs(this.accessors.getFlowMagnitude(a)),
            Math.abs(this.accessors.getFlowMagnitude(b)),
          ),
        );
        return aggregated;
      },
    );

  _getFlowMagnitudeExtent: Selector<L, F, [number, number] | undefined> = createSelector(
    this.getSortedAggregatedFilteredFlows,
    this.getSelectedLocationsSet,
    this.getLocationFilterMode,
    (flows, selectedLocationsSet, locationFilterMode) => {
      if (!flows) return undefined;
      let rv: [number, number] | undefined = undefined;
      for (const f of flows) {
        if (
          this.accessors.getFlowOriginId(f) !== this.accessors.getFlowDestId(f) &&
          this.isFlowInSelection(f, selectedLocationsSet, locationFilterMode)
        ) {
          const count = this.accessors.getFlowMagnitude(f);
          if (rv == null) {
            rv = [count, count];
          } else {
            if (count < rv[0]) rv[0] = count;
            if (count > rv[1]) rv[1] = count;
          }
        }
      }
      return rv;
    },
  );

  getExpandedSelectedLocationsSet: Selector<L, F, Set<string> | undefined> = createSelector(
    this.getClusteringEnabled,
    this.getSelectedLocationsSet,
    this.getClusterIndex,
    (clusteringEnabled, selectedLocations, clusterIndex) => {
      if (!selectedLocations || !clusterIndex) {
        return selectedLocations;
      }

      const result = new Set<string>();
      for (const locationId of selectedLocations) {
        const cluster = clusterIndex.getClusterById(locationId);
        if (cluster) {
          const expanded = clusterIndex.expandCluster(cluster);
          for (const id of expanded) {
            result.add(id);
          }
        } else {
          result.add(locationId);
        }
      }
      return result;
    },
  );

  getTotalCountsByTime: Selector<L, F, CountByTime[] | undefined> = createSelector(
    this.getSortedFlowsForKnownLocations,
    this.getTimeGranularityKey,
    this.getTimeExtent,
    this.getExpandedSelectedLocationsSet,
    this.getLocationFilterMode,
    (flows, timeGranularityKey, timeExtent, selectedLocationSet, locationFilterMode) => {
      const timeGranularity = timeGranularityKey
        ? getTimeGranularityByKey(timeGranularityKey)
        : undefined;
      if (!flows || !timeGranularity || !timeExtent) return undefined;
      const byTime = flows.reduce((m, flow) => {
        if (this.isFlowInSelection(flow, selectedLocationSet, locationFilterMode)) {
          const key = timeGranularity.interval(this.accessors.getFlowTime(flow)).getTime();
          m.set(key, (m.get(key) ?? 0) + this.accessors.getFlowMagnitude(flow));
        }
        return m;
      }, new Map<number, number>());

      return Array.from(byTime.entries()).map(([millis, count]) => ({
        time: new Date(millis),
        count,
      }));
    },
  );

  getMaxLocationCircleSize: Selector<L, F, number> = createSelector(
    this.getLocationTotalsEnabled,
    (locationTotalsEnabled) => (locationTotalsEnabled ? 17 : 1),
  );

  getViewportBoundingBox: Selector<L, F, [number, number, number, number]> = createSelector(
    this.getViewport,
    this.getMaxLocationCircleSize,
    (viewport, maxLocationCircleSize) => {
      const pad = maxLocationCircleSize;
      return bounds(
        [viewport.longitude, viewport.latitude],
        viewport.zoom,
        [viewport.width + pad * 2, viewport.height + pad * 2],
        512,
      );
    },
  );

  getLocationsForZoom: Selector<L, F, L[] | ClusterNode[] | undefined> = createSelector(
    this.getClusteringEnabled,
    this.getLocationsHavingFlows,
    this.getClusterIndex,
    this.getClusterZoom,
    (clusteringEnabled, locationsHavingFlows, clusterIndex, clusterZoom) => {
      if (clusteringEnabled && clusterIndex) {
        return clusterIndex.getClusterNodesFor(clusterZoom);
      } else {
        return locationsHavingFlows;
      }
    },
  );

  getLocationTotals: Selector<L, F, Map<string, LocationTotals> | undefined> = createSelector(
    this.getLocationsForZoom,
    this.getSortedAggregatedFilteredFlows,
    this.getSelectedLocationsSet,
    this.getLocationFilterMode,
    (locations, flows, selectedLocationsSet, locationFilterMode) => {
      if (!flows) return undefined;
      const totals = new Map<string, LocationTotals>();
      const add = (id: string, d: Partial<LocationTotals>): LocationTotals => {
        const rv = totals.get(id) ?? {
          incomingCount: 0,
          outgoingCount: 0,
          internalCount: 0,
        };
        if (d.incomingCount != null) rv.incomingCount += d.incomingCount;
        if (d.outgoingCount != null) rv.outgoingCount += d.outgoingCount;
        if (d.internalCount != null) rv.internalCount += d.internalCount;
        return rv;
      };
      for (const f of flows) {
        if (this.isFlowInSelection(f, selectedLocationsSet, locationFilterMode)) {
          const originId = this.accessors.getFlowOriginId(f);
          const destId = this.accessors.getFlowDestId(f);
          const count = this.accessors.getFlowMagnitude(f);
          if (originId === destId) {
            totals.set(originId, add(originId, { internalCount: count }));
          } else {
            totals.set(originId, add(originId, { outgoingCount: count }));
            totals.set(destId, add(destId, { incomingCount: count }));
          }
        }
      }
      return totals;
    },
  );

  getLocationsTree: Selector<L, F, KDBushTree> = createSelector(
    this.getLocationsForZoom,
    (locations) => {
      if (!locations) {
        return undefined;
      }
      return new KDBush(
        // @ts-ignore
        locations,
        (location: L | ClusterNode) =>
          lngX(
            isLocationClusterNode(location)
              ? location.centroid[0]
              : this.accessors.getLocationCentroid(location)[0],
          ),
        (location: L | ClusterNode) =>
          latY(
            isLocationClusterNode(location)
              ? location.centroid[1]
              : this.accessors.getLocationCentroid(location)[1],
          ),
      );
    },
  );

  _getLocationIdsInViewport: Selector<L, F, Set<string> | undefined> = createSelector(
    this.getLocationsTree,
    this.getViewportBoundingBox,
    (tree: KDBushTree, bbox: [number, number, number, number]) => {
      const ids = this._getLocationsInBboxIndices(tree, bbox);
      if (ids) {
        return new Set(ids.map((idx: number) => tree.points[idx].id) as Array<string>);
      }
      return undefined;
    },
  );

  getLocationIdsInViewport: Selector<L, F, Set<string> | undefined> =
    // @ts-ignore
    createSelectorCreator<Set<string> | undefined>(
      // @ts-ignore
      defaultMemoize,
      (s1: Set<string> | undefined, s2: Set<string> | undefined, index: number) => {
        if (s1 === s2) return true;
        if (s1 == null || s2 == null) return false;
        if (s1.size !== s2.size) return false;
        for (const item of s1) if (!s2.has(item)) return false;
        return true;
      },
    )(this._getLocationIdsInViewport, (locationIds: Set<string> | undefined) => {
      if (!locationIds) return undefined;
      return locationIds;
    });

  getTotalUnfilteredCount: Selector<L, F, number | undefined> = createSelector(
    this.getSortedFlowsForKnownLocations,
    (flows) => {
      if (!flows) return undefined;
      return flows.reduce((m, flow) => m + this.accessors.getFlowMagnitude(flow), 0);
    },
  );

  getTotalFilteredCount: Selector<L, F, number | undefined> = createSelector(
    this.getSortedAggregatedFilteredFlows,
    this.getSelectedLocationsSet,
    this.getLocationFilterMode,
    (flows, selectedLocationSet, locationFilterMode) => {
      if (!flows) return undefined;
      const count = flows.reduce((m, flow) => {
        if (this.isFlowInSelection(flow, selectedLocationSet, locationFilterMode)) {
          return m + this.accessors.getFlowMagnitude(flow);
        }
        return m;
      }, 0);
      return count;
    },
  );

  _getLocationTotalsExtent: Selector<L, F, [number, number] | undefined> = createSelector(
    this.getLocationTotals,
    (locationTotals) => calcLocationTotalsExtent(locationTotals, undefined),
  );

  _getLocationTotalsForViewportExtent: Selector<L, F, [number, number] | undefined> =
    createSelector(
      this.getLocationTotals,
      this.getLocationIdsInViewport,
      (locationTotals, locationsInViewport) =>
        calcLocationTotalsExtent(locationTotals, locationsInViewport),
    );

  getLocationTotalsExtent = (
    state: FlowMapState,
    props: FlowMapData<L, F>,
  ): [number, number] | undefined => {
    if (state.settingsState.adaptiveScalesEnabled) {
      return this._getLocationTotalsForViewportExtent(state, props);
    } else {
      return this._getLocationTotalsExtent(state, props);
    }
  };

  getFlowsForFlowMapLayer: Selector<L, F, (F | AggregateFlow)[] | undefined> = createSelector(
    this.getSortedAggregatedFilteredFlows,
    this.getLocationIdsInViewport,
    this.getSelectedLocationsSet,
    this.getLocationFilterMode,
    (flows, locationIdsInViewport, selectedLocationsSet, locationFilterMode) => {
      if (!flows || !locationIdsInViewport) return undefined;
      const picked: (F | AggregateFlow)[] = [];
      let pickedCount = 0;
      for (const flow of flows) {
        const origin = this.accessors.getFlowOriginId(flow);
        const dest = this.accessors.getFlowDestId(flow);
        if (locationIdsInViewport.has(origin) || locationIdsInViewport.has(dest)) {
          if (this.isFlowInSelection(flow, selectedLocationsSet, locationFilterMode)) {
            if (origin !== dest) {
              // exclude self-loops
              picked.push(flow);
              pickedCount++;
            }
          }
        }
        // Only keep top
        if (pickedCount > NUMBER_OF_FLOWS_TO_DISPLAY) break;
      }
      // assuming they are sorted in descending order,
      // we need ascending for rendering
      return picked.reverse();
    },
  );

  getFlowMagnitudeExtent(
    state: FlowMapState,
    props: FlowMapData<L, F>,
  ): [number, number] | undefined {
    if (state.settingsState.adaptiveScalesEnabled) {
      const flows = this.getFlowsForFlowMapLayer(state, props);
      if (flows) {
        const rv = extent(flows, this.accessors.getFlowMagnitude);
        return rv[0] !== undefined && rv[1] !== undefined ? rv : undefined;
      } else {
        return undefined;
      }
    } else {
      return this._getFlowMagnitudeExtent(state, props);
    }
  }

  getLocationMaxAbsTotalGetter = createSelector(this.getLocationTotals, (locationTotals) => {
    return (locationId: string) => {
      const total = locationTotals?.get(locationId);
      if (!total) return undefined;
      return Math.max(
        Math.abs(total.incomingCount + total.internalCount),
        Math.abs(total.outgoingCount + total.internalCount),
      );
    };
  });

  getFlowThicknessScale = (state: FlowMapState, props: FlowMapData<L, F>) => {
    const magnitudeExtent = this.getFlowMagnitudeExtent(state, props);
    if (!magnitudeExtent) return undefined;
    return scaleLinear()
      .range([0.025, 0.5])
      .domain([
        0,
        // should support diff mode too
        Math.max.apply(
          null,
          magnitudeExtent.map((x: number | undefined) => Math.abs(x || 0)),
        ),
      ]);
  };

  getCircleSizeScale = (state: FlowMapState, props: FlowMapData<L, F>) => {
    const maxLocationCircleSize = this.getMaxLocationCircleSize(state, props);
    const { locationTotalsEnabled } = state.settingsState;
    if (!locationTotalsEnabled) {
      return () => maxLocationCircleSize;
    }

    const locationTotalsExtent = this.getLocationTotalsExtent(state, props);
    if (!locationTotalsExtent) return undefined;
    return scaleSqrt()
      .range([0, maxLocationCircleSize])
      .domain([
        0,
        // should support diff mode too
        Math.max.apply(
          null,
          locationTotalsExtent.map((x: number | undefined) => Math.abs(x || 0)),
        ),
      ]);
  };

  getInCircleSizeGetter = createSelector(
    this.getCircleSizeScale,
    this.getLocationTotals,
    (circleSizeScale, locationTotals) => {
      return (locationId: string) => {
        // const total = locationTotals?.get(locationId);
        // if (total && circleSizeScale) {
        //   return circleSizeScale(Math.abs(total.incomingCount + total.internalCount)) || 0;
        // }
        return 4;
      };
    },
  );

  getOutCircleSizeGetter = createSelector(
    this.getCircleSizeScale,
    this.getLocationTotals,
    (circleSizeScale, locationTotals) => {
      return (locationId: string) => {
        // const total = locationTotals?.get(locationId);
        // if (total && circleSizeScale) {
        //   return circleSizeScale(Math.abs(total.outgoingCount + total.internalCount)) || 0;
        // }
        return 4;
      };
    },
  );

  getSortedLocationsForZoom: Selector<L, F, L[] | ClusterNode[] | undefined> = createSelector(
    this.getLocationsForZoom,
    this.getInCircleSizeGetter,
    this.getOutCircleSizeGetter,
    (locations, getInCircleSize, getOutCircleSize) => {
      if (!locations) return undefined;
      const nextLocations = [...locations] as L[] | ClusterNode[];
      return nextLocations.sort((a, b) => {
        const idA = this.accessors.getLocationId(a);
        const idB = this.accessors.getLocationId(b);
        return ascending(
          Math.max(getInCircleSize(idA), getOutCircleSize(idA)),
          Math.max(getInCircleSize(idB), getOutCircleSize(idB)),
        );
      });
    },
  );

  getLocationsForFlowMapLayer: Selector<L, F, Array<L | ClusterNode> | undefined> = createSelector(
    this.getSortedLocationsForZoom,
    // this.getLocationIdsInViewport,
    (
      locations,
      // locationIdsInViewport
    ) => {
      // if (!locations) return undefined;
      // if (!locationIdsInViewport) return locations;
      // if (locationIdsInViewport.size === locations.length) return locations;
      // const filtered = [];
      // for (const loc of locations) {
      //   if (locationIdsInViewport.has(loc.id)) {
      //     filtered.push(loc);
      //   }
      // }
      // return filtered;
      // @ts-ignore
      // return locations.filter(
      //   (loc: L | ClusterNode) => locationIdsInViewport!.has(loc.id)
      // );
      // TODO: return location in viewport + "connected" ones
      return locations;
    },
  );

  getLocationsForFlowMapLayerById: Selector<L, F, Map<string, L | ClusterNode> | undefined> =
    createSelector(this.getLocationsForFlowMapLayer, (locations) => {
      if (!locations) return undefined;
      return locations.reduce((m, d) => (m.set(this.accessors.getLocationId(d), d), m), new Map());
    });

  prepareLayersData(state: FlowMapState, props: FlowMapData<L, F>): LayersData {
    const locations = this.getLocationsForFlowMapLayer(state, props) || [];
    const flows = this.getFlowsForFlowMapLayer(state, props) || [];
    const { getFlowOriginId, getFlowDestId, getFlowMagnitude, getLocationId, getLocationCentroid } =
      this.accessors;

    const flowMapColors = this.getFlowMapColorsRGBA(state, props);
    const { settingsState } = state;

    const locationsById = this.getLocationsForFlowMapLayerById(state, props);
    const getCentroid = (id: string) => {
      const loc = locationsById?.get(id);
      return loc ? getLocationCentroid(loc) : [0, 0];
    };

    const locationIdsInViewport = this.getLocationIdsInViewport(state, props);
    const getInCircleSize = this.getInCircleSizeGetter(state, props);
    const getOutCircleSize = this.getOutCircleSizeGetter(state, props);

    const flowThicknessScale = this.getFlowThicknessScale(state, props);

    const flowMagnitudeExtent = extent(flows, (f) => getFlowMagnitude(f)) as [number, number];
    const flowColorScale = getFlowColorScale(flowMapColors, flowMagnitudeExtent, false);

    const circlePositions = new Float32Array(flatMap(locations, getLocationCentroid));

    // TODO: diff mode
    const circleColor = isDiffColorsRGBA(flowMapColors)
      ? flowMapColors.positive.locationCircles.inner
      : flowMapColors.locationCircles.inner;

    const circleColors = new Uint8Array(flatMap(locations, (d) => circleColor));
    const inCircleRadii = new Float32Array(
      locations.map((loc) => {
        const id = getLocationId(loc);
        return locationIdsInViewport?.has(id) ? getInCircleSize(id) : 1.0;
      }),
    );
    const outCircleRadii = new Float32Array(
      locations.map((loc) => {
        const id = getLocationId(loc);
        return locationIdsInViewport?.has(id) ? getOutCircleSize(id) : 1.0;
      }),
    );

    const sourcePositions = new Float32Array(
      flatMap(flows, (d: F | AggregateFlow) => getCentroid(getFlowOriginId(d))),
    );
    const targetPositions = new Float32Array(
      flatMap(flows, (d: F | AggregateFlow) => getCentroid(getFlowDestId(d))),
    );
    const thicknesses = new Float32Array(
      flows.map((d: F | AggregateFlow) =>
        flowThicknessScale ? flowThicknessScale(getFlowMagnitude(d)) || 0 : 0,
      ),
      // flows.map(() => 0.1),
    );
    const endpointOffsets = new Float32Array(
      flatMap(flows, (d: F | AggregateFlow) => {
        const originId = getFlowOriginId(d);
        const destId = getFlowDestId(d);
        return [
          Math.max(getInCircleSize(originId), getOutCircleSize(originId)),
          Math.max(getInCircleSize(destId), getOutCircleSize(destId)),
        ];
      }),
    );
    const flowLineColors = new Uint8Array(
      flatMap(flows, (f: F | AggregateFlow) => flowColorScale(getFlowMagnitude(f))),
      // flatMap(flows, (f: F | AggregateFlow) => [0, 0, 0, 255]),
    );

    const staggeringValues = settingsState.animationEnabled
      ? new Float32Array(
          flows.map((f: F | AggregateFlow) =>
            // @ts-ignore
            new alea(`${getFlowOriginId(f)}-${getFlowDestId(f)}`)(),
          ),
        )
      : undefined;

    return {
      circleAttributes: {
        length: locations.length,
        attributes: {
          getPosition: { value: circlePositions, size: 2 },
          getColor: { value: circleColors, size: 4 },
          getInRadius: { value: inCircleRadii, size: 1 },
          getOutRadius: { value: outCircleRadii, size: 1 },
        },
      },
      lineAttributes: {
        length: flows.length,
        attributes: {
          getSourcePosition: { value: sourcePositions, size: 2 },
          getTargetPosition: { value: targetPositions, size: 2 },
          getThickness: { value: thicknesses, size: 1 },
          getColor: { value: flowLineColors, size: 4 },
          getEndpointOffsets: { value: endpointOffsets, size: 2 },
          ...(staggeringValues ? { getStaggering: { value: staggeringValues, size: 1 } } : {}),
        },
      },
    };
  }

  getLocationsInBbox(
    tree: KDBushTree,
    bbox: [number, number, number, number],
  ): Array<L> | undefined {
    if (!tree) return undefined;
    return this._getLocationsInBboxIndices(tree, bbox).map(
      (idx: number) => tree.points[idx],
    ) as Array<L>;
  }

  _getLocationsInBboxIndices(tree: KDBushTree, bbox: [number, number, number, number]) {
    if (!tree) return undefined;
    const [lon1, lat1, lon2, lat2] = bbox;
    const [x1, y1, x2, y2] = [lngX(lon1), latY(lat1), lngX(lon2), latY(lat2)];
    return tree.range(Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2));
  }

  isFlowInSelection(
    flow: F | AggregateFlow,
    selectedLocationsSet: Set<string> | undefined,
    locationFilterMode: LocationFilterMode,
  ) {
    const origin = this.accessors.getFlowOriginId(flow);
    const dest = this.accessors.getFlowDestId(flow);
    if (selectedLocationsSet) {
      switch (locationFilterMode) {
        case LocationFilterMode.ALL:
          return selectedLocationsSet.has(origin) || selectedLocationsSet.has(dest);
        case LocationFilterMode.BETWEEN:
          return selectedLocationsSet.has(origin) && selectedLocationsSet.has(dest);
        case LocationFilterMode.INCOMING:
          return selectedLocationsSet.has(dest);
        case LocationFilterMode.OUTGOING:
          return selectedLocationsSet.has(origin);
      }
    }
    return true;
  }

  // calcLocationTotals(
  //   locations: (L | ClusterNode)[],
  //   flows: F[],
  // ): LocationsTotals {
  //   return flows.reduce(
  //     (acc: LocationsTotals, curr) => {
  //       const originId = this.accessors.getFlowOriginId(curr);
  //       const destId = this.accessors.getFlowDestId(curr);
  //       const magnitude = this.accessors.getFlowMagnitude(curr);
  //       if (originId === destId) {
  //         acc.internal[originId] = (acc.internal[originId] || 0) + magnitude;
  //       } else {
  //         acc.outgoing[originId] = (acc.outgoing[originId] || 0) + magnitude;
  //         acc.incoming[destId] = (acc.incoming[destId] || 0) + magnitude;
  //       }
  //       return acc;
  //     },
  //     {incoming: {}, outgoing: {}, internal: {}},
  //   );
  // }
}

function calcLocationTotalsExtent(
  locationTotals: Map<string, LocationTotals> | undefined,
  locationIdsInViewport: Set<string> | undefined,
) {
  if (!locationTotals) return undefined;
  let rv: [number, number] | undefined = undefined;
  for (const [id, { incomingCount, outgoingCount, internalCount }] of locationTotals.entries()) {
    if (locationIdsInViewport == null || locationIdsInViewport.has(id)) {
      const lo = Math.min(
        incomingCount + internalCount,
        outgoingCount + internalCount,
        internalCount,
      );
      const hi = Math.max(
        incomingCount + internalCount,
        outgoingCount + internalCount,
        internalCount,
      );
      if (!rv) {
        rv = [lo, hi];
      } else {
        if (lo < rv[0]) rv[0] = lo;
        if (hi > rv[1]) rv[1] = hi;
      }
    }
  }
  return rv;
}

// longitude/latitude to spherical mercator in [0..1] range
function lngX(lng: number) {
  return lng / 360 + 0.5;
}

function latY(lat: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;
  return y < 0 ? 0 : y > 1 ? 1 : y;
}

function aggregateFlows<F>(flows: F[], flowAccessors: FlowAccessors<F>): AggregateFlow[] {
  // Sum up flows with same origin, dest
  const byOriginDest = nest<F, AggregateFlow>()
    .key(flowAccessors.getFlowOriginId)
    .key(flowAccessors.getFlowDestId)
    .rollup((ff: F[]) => {
      const origin = flowAccessors.getFlowOriginId(ff[0]);
      const dest = flowAccessors.getFlowDestId(ff[0]);
      // const color = ff[0].color;
      const rv: AggregateFlow = {
        aggregate: true,
        origin,
        dest,
        count: ff.reduce((m, f) => {
          const count = flowAccessors.getFlowMagnitude(f);
          if (count) {
            if (!isNaN(count) && isFinite(count)) return m + count;
          }
          return m;
        }, 0),
        // time: undefined,
      };
      // if (color) rv.color = color;
      return rv;
    })
    .entries(flows);
  const rv: AggregateFlow[] = [];
  for (const { values } of byOriginDest) {
    for (const { value } of values) {
      rv.push(value);
    }
  }
  return rv;
}

/**
 * This is used to augment hover picking info so that we can displace location tooltip
 * @param circleAttributes
 * @param index
 */
export function getOuterCircleRadiusByIndex(
  circleAttributes: FlowCirclesLayerAttributes,
  index: number,
): number {
  const { getInRadius, getOutRadius } = circleAttributes.attributes;
  return Math.max(getInRadius.value[index], getOutRadius.value[index]);
}

export function getLocationCentroidByIndex(
  circleAttributes: FlowCirclesLayerAttributes,
  index: number,
): [number, number] {
  const { getPosition } = circleAttributes.attributes;
  return [getPosition.value[index * 2], getPosition.value[index * 2 + 1]];
}

export function getFlowLineAttributesByIndex(
  lineAttributes: FlowLinesLayerAttributes,
  index: number,
): FlowLinesLayerAttributes {
  const {
    getColor,
    getEndpointOffsets,
    getSourcePosition,
    getTargetPosition,
    getThickness,
    getStaggering,
  } = lineAttributes.attributes;
  return {
    length: 1,
    attributes: {
      getColor: {
        value: getColor.value.subarray(index * 4, (index + 1) * 4),
        size: 4,
      },
      getEndpointOffsets: {
        value: getEndpointOffsets.value.subarray(index * 2, (index + 1) * 2),
        size: 2,
      },
      getSourcePosition: {
        value: getSourcePosition.value.subarray(index * 2, (index + 1) * 2),
        size: 2,
      },
      getTargetPosition: {
        value: getTargetPosition.value.subarray(index * 2, (index + 1) * 2),
        size: 2,
      },
      getThickness: {
        value: getThickness.value.subarray(index, index + 1),
        size: 1,
      },
      ...(getStaggering
        ? {
            getStaggering: {
              value: getStaggering.value.subarray(index, index + 1),
              size: 1,
            },
          }
        : undefined),
    },
  };
}
