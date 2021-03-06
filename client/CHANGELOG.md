# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Dashed line added to analysis table to difference between real and projected data [LANDGRIF-736](https://vizzuality.atlassian.net/browse/LANDGRIF-736)
- Map UI state in the URL params (center, zoom) [LANDGRIF-728](https://vizzuality.atlassian.net/browse/LANDGRIF-728)
- Baseline water stress contextual layer [LANDGRIF-743](https://vizzuality.atlassian.net/browse/LANDGRIF-743)
- Pagination functionality to the impact table [LANDGRIF-777](https://vizzuality.atlassian.net/browse/LANDGRIF-777)
- Added new theme and layout for Landgriffon [LANDGRIF-782](https://vizzuality.atlassian.net/browse/LANDGRIF-782)
- Show scenario comparison data in table view [LANDGRIF-745](https://vizzuality.atlassian.net/browse/LANDGRIF-745)
- Redesign of new intervention creation [LANDGRIF-783](https://vizzuality.atlassian.net/browse/LANDGRIF-783)
- Read contextual layers and their data from the API[LANDGRIF-792](https://vizzuality.atlassian.net/browse/LANDGRIF-792)

### Changed

- Changed select styles to match the design, specifically for the years. They now have a different behavior than the others to improve usability.
- Applied new design for the targets section in the admin page.
- Scenarios selection disabled temporarily in map visualization mode [LANDGRIF-744](https://vizzuality.atlassian.net/browse/LANDGRIF-744)
- Replaced excel file to download in the Data page.

### Fixed

- Location types params added to "/impact/table" endpoint [LANDGRIF-733](https://vizzuality.atlassian.net/browse/LANDGRIF-733)
- An issue in the table component when the user navigates to the admin page
- Prevent collapse button to break his position [LANDGRIF-729](https://vizzuality.atlassian.net/browse/LANDGRIF-729)
- Scenario description not updating properly [LANDGRIF-740](https://vizzuality.atlassian.net/browse/LANDGRIF-740)
- Limit options for start year in analysis to years with available data [LANDGRIF-737](https://vizzuality.atlassian.net/browse/LANDGRIF-737)
- Make loader more visible when chart data is fetching [LANDGRIF-759](https://vizzuality.atlassian.net/browse/LANDGRIF-759)
- Aggregated values in chart ('other/others' category) should always be '#E4E4E4' [LANDGRIF-771](https://vizzuality.atlassian.net/browse/LANDGRIF-771)
- Show aggregated values in chart just if there are more than 5 elements in total [LANDGRIF-773](https://vizzuality.atlassian.net/browse/LANDGRIF-773)
- Last scenario hidden by gradient [LANDGRIF-739](https://vizzuality.atlassian.net/browse/LANDGRIF-739)
- Extra bad requests in analysis [LANDGRIF-716](https://vizzuality.atlassian.net/browse/LANDGRIF-716)
- UI fixes in the intervention creation form [LANDGRIF-742](https://vizzuality.atlassian.net/browse/LANDGRIF-742)
- Styles for the sort dropdown in the scenarios list [LANDGRIF-738](https://vizzuality.atlassian.net/browse/LANDGRIF-738)
- Sort country list alphabetically and added search functionality to the input in the intervention form [LANDGRIF-776](https://vizzuality.atlassian.net/browse/LANDGRIF-776)
- User was not able to choice an option in the selectors for intervention creation [LANDGRIF-785](https://vizzuality.atlassian.net/browse/LANDGRIF-785)
- Crash when the session expired [LANDGRIF-786](https://vizzuality.atlassian.net/browse/LANDGRIF-786)
- Latitude validation in the intervention form
- Coefficients were not to be null in the intervention form

### Removed
- Overview link in the sidebar menu.

## 2022.06.27

### Added

- [Storybook](https://storybook.js.org/) for documentation of UI components
- Added `Select` component to Storybook
- [Twin.macro](https://github.com/ben-rogerson/twin.macro) babel plugin for Tailwind and Styled-components integration
- Forcing desktop version in mobile devices [LANDGRIF-676](https://vizzuality.atlassian.net/browse/LANDGRIF-676)
- In tables, added border on the left when parent is expanded [LANDGRIF-650](https://vizzuality.atlassian.net/browse/LANDGRIF-650)
- Better error response for failed logins [LANDGRIF-685](https://vizzuality.atlassian.net/browse/LANDGRIF-685)
- Added UI state in the URL params [LANDGRIF-638](https://vizzuality.atlassian.net/browse/LANDGRIF-638)

### Changed

- Upgrade Tailwind to version 3.0.24
- Upgrade to Yarn version 3.2.1
- Upgrade to Node LTS 16.15.0
- Increased allowed file size for upload from 1.5MB to 2.0MB
- Tooltip redesigned in charts view, legend included inside chart card [LANDGRIF-702](https://vizzuality.atlassian.net/browse/LANDGRIF-702)
- Interactivity added to chart legend to highlight areas in the graph [LANDGRIF-688](https://vizzuality.atlassian.net/browse/LANDGRIF-688)
- Active pills showing selected filters on table and chart view [LANDGRIF-616](https://vizzuality.atlassian.net/browse/LANDGRIF-616)
- Select and TreeSelect components redo according to design [LANDGRIF-686](https://vizzuality.atlassian.net/browse/LANDGRIF-686)
- Removed multiply blend mode from the map
- Added basemap selector, allowing to toggle between satellite and terrain [LANDGRIF-662](https://vizzuality.atlassian.net/browse/LANDGRIF-662)

### Fixed

- `nyc` was not working running `yarn test`
- Collapsed button sometimes appears in the middle [LANDGRIF-678](https://vizzuality.atlassian.net/browse/LANDGRIF-678)
- Interventions pannel should close when navigating to "Analysis" throught breadcrumbs [LANDGRIF-657](https://vizzuality.atlassian.net/browse/LANDGRIF-657)
- Arrow icon in the tables also toggle collapse the rows
- Fixed issues related to duplicated keys in the table rendering [LANDGRIF-650](https://vizzuality.atlassian.net/browse/LANDGRIF-650)
- Location types params standarized
- Location types params added to "/h3/map/impact" endpoint
- Legend selects now automatically close when choosing a value
- Standarized values for group by in analysis section [LANDGRIF-710](https://vizzuality.atlassian.net/browse/LANDGRIF-710)
- Tooltip not showing last date in chart [LANDGRIF-709](https://vizzuality.atlassian.net/browse/LANDGRIF-709)
- Number of rows in analysis table view updated accordinly with cells expansion [LANDGRIF-693](https://vizzuality.atlassian.net/browse/LANDGRIF-693)

## 0.3.0 - 2021-09-01

### Added

- First version of table mode
- Block search spiders: added robots.txt
- Save filters on Redux store [LANDGRIF-242](https://vizzuality.atlassian.net/browse/LANDGRIF-242)
- Behavior for more filters popup: it should only filter when the user clicks on Apply [LANDGRIF-265](https://vizzuality.atlassian.net/browse/LANDGRIF-265)
- Legend component for choropleth layers [LANDGRIF-124](https://vizzuality.atlassian.net/browse/LANDGRIF-124)
- Dataset selector (aka layer selector) in the filters [LANDGRIF-264](https://vizzuality.atlassian.net/browse/LANDGRIF-264)
- Filters populated with data from the API [LANDGRIF-242](https://vizzuality.atlassian.net/browse/LANDGRIF-242)
- Area charts and widgets behavior for the chart mode [LANDGRIF-181](https://vizzuality.atlassian.net/browse/LANDGRIF-181)
- In "More filters" the counter icon show how many filters are selected [LANDGRIF-273](https://vizzuality.atlassian.net/browse/LANDGRIF-273)
- Added spinner when the map is loading and rendering an H3 layer
- Home redirects to the analysis page

### Changed

- Migrated requests from containers to react hooks
- By default analysis have the scenarios/interventions panel collapsed
- Table and chart have are able to show a minimun of two years [LANDGRIF-699](https://vizzuality.atlassian.net/browse/LANDGRIF-699)

## 0.2.0 - 2021-08-01

### Added

- Scenario dropdown for edition and remove [LANDGRIF-156](https://vizzuality.atlassian.net/browse/LANDGRIF-156)
- Filters and sortable to scenarios list [LANDGRIF-168](https://vizzuality.atlassian.net/browse/LANDGRIF-168)
- Updated analysis documentation and needs [LANDGRIF-195](https://vizzuality.atlassian.net/browse/LANDGRIF-195)

## 0.1.0 - 2021-07-01

### Added

- Show visualization mode in the URL (map, table or chart) [LANDGRIF-119](https://vizzuality.atlassian.net/browse/LANDGRIF-119)
- Show selected scenario in the URL [LANDGRIF-159](https://vizzuality.atlassian.net/browse/LANDGRIF-159)
- Actual data as first element in the scenarios list [LANDGRIF-171](https://vizzuality.atlassian.net/browse/LANDGRIF-171)
- Added collapsed button and show it in the URL [LANDGRIF-128](https://vizzuality.atlassian.net/browse/LANDGRIF-128)
- Scenarios list connected with the API [LANDGRIF-182](https://vizzuality.atlassian.net/browse/LANDGRIF-182)
