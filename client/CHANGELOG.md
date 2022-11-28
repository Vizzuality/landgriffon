# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [v0.3.3]

### Added

- New legend type called Comparative legend that allows to use different alignment of the items when a comparison is enabled.

### Fixed

- Update rows expanded state on analysis table [LANDGRIF-967](https://vizzuality.atlassian.net/browse/LANDGRIF-967)
- Horizontal scroll on the legend [LANDGRIF-1082](https://vizzuality.atlassian.net/browse/LANDGRIF-1082)
- Format of numbers of the contextual layers in the legend [LANDGRIF-1090](https://vizzuality.atlassian.net/browse/LANDGRIF-1090)
- Edition of intervention was not working [LANDGRIF-1073](https://vizzuality.atlassian.net/browse/LANDGRIF-1073)
- Legend colors for comparison layer [LANDGRIF-979](https://vizzuality.atlassian.net/browse/LANDGRIF-979)
- Tests were failing due to a change in the api where data was reset
- Scenario list when the user opens the comparison dropdown [LANDGRIF-1066](https://vizzuality.atlassian.net/browse/LANDGRIF-1066)
- Fixed reset of "group by" filter in analysis page when a scenario is selected. [LANDGRIF-1059](https://vizzuality.atlassian.net/browse/LANDGRIF-1059)

## [v0.3.0]

### Added

- Information about the layers in the tooltips of contextual layers [LANDGRIF-997](https://vizzuality.atlassian.net/browse/LANDGRIF-997)
- Numbers of growth rates in scenarios page

- Information about the layers in the tooltips of contextual layers [LANDGRIF-997](https://vizzuality.atlassian.net/browse/LANDGRIF-997)
- Numbers of growth rates in scenarios page

### Changed

- Updated placeholders of year range selectors. [LANDGRIF-1057](https://vizzuality.atlassian.net/browse/LANDGRIF-1057)
- In tables the columns are not sortable by default, it should be specified in each column configuration [LANDGRIF-965](https://vizzuality.atlassian.net/browse/LANDGRIF-965)
- Updated styles for tree-selectors according the design
- Select leaf nodes of business units on intervention creation (instead of parent nodes). [LANDGRIF-917](https://vizzuality.atlassian.net/browse/LANDGRIF-917)
- Applied 40-character limitation to scenario title in scenario creation page. [LANDGRIF-1016](https://vizzuality.atlassian.net/browse/LANDGRIF-1016)
- In tables the columns are not sortable by default, it should be specified in each column configuration [LANDGRIF-965](https://vizzuality.atlassian.net/browse/LANDGRIF-965)
- Updated styles for tree-selectors according the design

### Fixed

- Changed key value for items in Impact chart tooltip. [LANDGRIF-1056](https://vizzuality.atlassian.net/browse/LANDGRIF-1056)
- Analysis sidebar: removed "no results" message triggered when there weren't scenarios available to list. [LANDGRIF-1029](https://vizzuality.atlassian.net/browse/LANDGRIF-1029)
- Not include scenarios with 0 interventions in the scenario dropdowns for comparison [LANDGRIF-999](https://vizzuality.atlassian.net/browse/LANDGRIF-999)
- Legend alignment in charts
- Click on the legend also change the opacity of projected areas
- Relative and absolute switcher was not working on the chart view [LANDGRIF-993](https://vizzuality.atlassian.net/browse/LANDGRIF-993)

## [v0.2.3]

### Fixed

- Switching between comparison modes not working [LANDGRIF-1033](https://vizzuality.atlassian.net/browse/LLANDGRIF-1033)

## [v0.2.2]

### Fixed

- Filters resetting when switching scenario [LANDGRIF-1021](https://vizzuality.atlassian.net/browse/LLANDGRIF-1021)

## [v0.2.1]

### Fixed

- Analysis table is not updating selecting an scenario [LANDGRIF-1019](https://vizzuality.atlassian.net/browse/LANDGRIF-1019)

## [v0.2.0]

### Added

- Comparison mode toggle for impact table H3 data [LANDGRIF-941](https://vizzuality.atlassian.net/browse/LANDGRIF-941)
- Re-added material layer to the map as a contextual layer [LANDGRIF-827](https://vizzuality.atlassian.net/browse/LANDGRIF-827)
- Add map preview to legend settings modal [LANDGRIF-827](https://vizzuality.atlassian.net/browse/LANDGRIF-827)
- In chart view, when a comparison is enabled the chart changes to line chart [LANDGRIF-807](https://vizzuality.atlassian.net/browse/LANDGRIF-807)
- Scenario creation link from analysis [LANDGRIF-805](https://vizzuality.atlassian.net/browse/LANDGRIF-805)
- Scenario comparison in the chart view [LANDGRIF-945](https://vizzuality.atlassian.net/browse/LANDGRIF-945)
- Added comparison e2e tests
- Added mode control e2e tests
- Added icon animation when a file on upload or progress in the actual data page
- Added interaction in the charts clicking on the legend [LANDGRIF-772](https://vizzuality.atlassian.net/browse/LANDGRIF-772)

### Changed
- Removed minus sign (`-`) from absolute difference in comparison charts. [LANDGRIF-1046](https://vizzuality.atlassian.net/browse/LANDGRIF-1046)
- Bigger table page size [LANDGRIF-922](https://vizzuality.atlassian.net/browse/LANDGRIF-922)
- `ACTUAL_DATA` was removed and a null scenario id is used in it's place
- Send `scenarioId` param alongside analysis filters [LANDGRIF-891](https://vizzuality.atlassian.net/browse/LANDGRIF-891)
- Same input for city, address and coordinates for intervention form [LANDGRIF-821](https://vizzuality.atlassian.net/browse/LANDGRIF-821)
- Redesign the Legend [LANDGRIF_727](https://vizzuality.atlassian.net/browse/LANDGRIF-727)
- Applied redesign of Actual data [LANDGRIF-810](https://vizzuality.atlassian.net/browse/LANDGRIF-810)
- Redesign of charts for Impact data
- Updated scenarios list according new design
- Changed the background of the authentication pages
- Updated styles for the menu in the new "Data" (before Admin) section
- Refactored actual data page to avoid strange renders and extra calls to the API

### Fixed

- Fix changing scenario keeping filters not valid for selection [LANDGRIF-958](https://vizzuality.atlassian.net/browse/LANDGRIF-958)
- Errors in intervention creation form not showing up [LANDGRIF-958](https://vizzuality.atlassian.net/browse/LANDGRIF-958)
- Navigating to another page with some query params now correctly override the state [LANDGRIF-911](https://vizzuality.atlassian.net/browse/LANDGRIF-911)
- Zoom controls not working [LANDGRIF-928](https://vizzuality.atlassian.net/browse/LANDGRIF-928)
- Smart filters not being persisted between pages
- Showing errors in the sign-up form
- Loading more consistent for the auth pages
- Wrong mode selector in the analysis page
- Reset indicators selector when changing the mode in analysis page [LANDGRIF-901](https://vizzuality.atlassian.net/browse/LANDGRIF-901)
- Indicator name concatenates boolean variable in table view [LANDGRIF-902](https://vizzuality.atlassian.net/browse/LANDGRIF-902)
- Compare not showing in table view [LANDGRIF-903](https://vizzuality.atlassian.net/browse/LANDGRIF-903)
- Added loading in the data section before load the table
- An issue where scenario description was not updated correctly
- An issue where canceling the intervention creation was redirecting to the wrong page [LANDGRIF-926](https://vizzuality.atlassian.net/browse/LANDGRIF-926)
- Fixed UI issues in the scenario card list
- Fixed an issue where compare was not working on scenario vs scenario
- Fixed an issue where the chart was not showing correctly the projected data
- Fixed an issue where more filters were not including the compare scenario ID [LANDGRIF-976](https://vizzuality.atlassian.net/browse/LANDGRIF-976)
- Fixed an issue where unit was not showing correctly in the tooltip map
- Comparison colors for the impact layer when is enabled [LANDGRIF-979](https://vizzuality.atlassian.net/browse/LANDGRIF-979)
- Fixed an issue where smart filers in more filters were not passing all params required [LANDGRIF-978](https://vizzuality.atlassian.net/browse/LANDGRIF-978)
- Recovering download template file in the upload modal [LANDGRIF-964](https://vizzuality.atlassian.net/browse/LANDGRIF-964)
- Solved an issue where years was not filtering the actual data table [LANDGRIF-969](https://vizzuality.atlassian.net/browse/LANDGRIF-969)
- Recovering sorting by column in the actual data table [LANDGRIF-965](https://vizzuality.atlassian.net/browse/LANDGRIF-965)
- Tooltip in the chart doesn't break the page [LANDGRIF-995](https://vizzuality.atlassian.net/browse/LANDGRIF-995)

## [2022.08.03]

### Added

- Dashed line added to analysis table to difference between real and projected data [LANDGRIF-736](https://vizzuality.atlassian.net/browse/LANDGRIF-736)
- Map UI state in the URL params (center, zoom) [LANDGRIF-728](https://vizzuality.atlassian.net/browse/LANDGRIF-728)
- Baseline water stress contextual layer [LANDGRIF-743](https://vizzuality.atlassian.net/browse/LANDGRIF-743)
- Pagination functionality to the impact table [LANDGRIF-777](https://vizzuality.atlassian.net/browse/LANDGRIF-777)
- Added new theme and layout for Landgriffon [LANDGRIF-782](https://vizzuality.atlassian.net/browse/LANDGRIF-782)
- Show scenario comparison data in table view [LANDGRIF-745](https://vizzuality.atlassian.net/browse/LANDGRIF-745)
- Redesign of new intervention creation [LANDGRIF-783](https://vizzuality.atlassian.net/browse/LANDGRIF-783)
- Read contextual layers and their data from the API[LANDGRIF-792](https://vizzuality.atlassian.net/browse/LANDGRIF-792)
- Page titles with templates
- Pagination to users data table [LANDGRIF-924](https://vizzuality.atlassian.net/browse/LANDGRIF-924)

### Changed

- Changed select styles to match the design, specifically for the years. They now have a different behavior than the others to improve usability.
- Applied new design for the targets section in the admin page.
- Scenarios selection disabled temporarily in map visualization mode [LANDGRIF-744](https://vizzuality.atlassian.net/browse/LANDGRIF-744)
- Replaced excel file to download in the Data page.
- Updated params for scenario comparison endpoint

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

- Use SWC instead of Babel
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
- Upgrade to Next.js 12 [LANDGRIF-815](https://vizzuality.atlassian.net/browse/LANDGRIF-815)

### Fixed

- Fixed select with errors having two borders in some ocassions
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
