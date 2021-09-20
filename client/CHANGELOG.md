# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## 0.3.0 [Unreleased]
### Added
* First version of table mode
* Block search spiders: added robots.txt
* Save filters on Redux store [LANDGRIF-242](https://vizzuality.atlassian.net/browse/LANDGRIF-242)
* Behavior for more filters popup: it should only filter when the user clicks on Apply [LANDGRIF-265](https://vizzuality.atlassian.net/browse/LANDGRIF-265)
* Legend component for choropleth layers [LANDGRIF-124](https://vizzuality.atlassian.net/browse/LANDGRIF-124)
* Dataset selector (aka layer selector) in the filters [LANDGRIF-264](https://vizzuality.atlassian.net/browse/LANDGRIF-264)
* Filters populated with data from the API [LANDGRIF-242](https://vizzuality.atlassian.net/browse/LANDGRIF-242)
* Area charts and widgets behavior for the chart mode [LANDGRIF-181](https://vizzuality.atlassian.net/browse/LANDGRIF-181)
* In "More filters" the counter icon show how many filters are selected [LANDGRIF-273](https://vizzuality.atlassian.net/browse/LANDGRIF-273)

### Changed
* Migrated requests from containers to react hooks

## 0.2.0 - August 2021
### Added
* Scenario dropdown for edition and remove [LANDGRIF-156](https://vizzuality.atlassian.net/browse/LANDGRIF-156)
* Filters and sortable to scenarios list [LANDGRIF-168](https://vizzuality.atlassian.net/browse/LANDGRIF-168)
* Updated analysis documentation and needs [LANDGRIF-195](https://vizzuality.atlassian.net/browse/LANDGRIF-195)

## 0.1.0 - July 2021
### Added
* Show visualization mode in the URL (map, table or chart) [LANDGRIF-119](https://vizzuality.atlassian.net/browse/LANDGRIF-119)
* Show selected scenario in the URL [LANDGRIF-159](https://vizzuality.atlassian.net/browse/LANDGRIF-159)
* Actual data as first element in the scenarios list [LANDGRIF-171](https://vizzuality.atlassian.net/browse/LANDGRIF-171)
* Added collapsed button and show it in the URL [LANDGRIF-128](https://vizzuality.atlassian.net/browse/LANDGRIF-128)
* Scenarios list connected with the API [LANDGRIF-182](https://vizzuality.atlassian.net/browse/LANDGRIF-182)
