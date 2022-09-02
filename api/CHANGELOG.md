# Changelog

All notable changes related to LandGriffon API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]


##  2022-09-102
### Fixes
Fixes a issue where the Canceled Sourcing Locations would have a default 'unknown' location type, 
as the query for filtering the original ones at the beginning of the intervention creation didn't have a 
select for this field, therefore the instance prop was null,
and the DB persist it of the default enumerable value, 'unknown'



##  2022-08-18
### Fixes
Added a guard in GeoRegion Service to try find either a previously created Point or Radius
geometry in case some coordinates are sent for a intervention, and said coordinates
had been used previously (on a intervention or import process) to create a GeoRegion
Avoiding to create a new one
Also after creating or getting a previously generated georegion, we try to validate
that the provided country matches the coordinate/address information. If not, we delete 
the created georegion but after checking that said georegion is not already included in sourcing locations


##  2022-08-01
### Added
Added [LANDGRIF-813](https://vizzuality.atlassian.net/browse/LANDGRIF-813)
Adds endpoint to retrieve location types supported by the platform


##  2022-07-15
### Added
Added [LANDGRIF-778](https://vizzuality.atlassian.net/browse/LANDGRIF-7782)
Adds a CachedData Entity for use on Indicator Record calculations to improve performance.

##  2022-06-12
### Added
Added [LANDGRIF-722](https://vizzuality.atlassian.net/browse/LANDGRIF-722)
Added support for Contextual Layer data with 2 endpoints to serve contextual layers and their H3 Data

##  2022-06-12
### Added
Added [LANDGRIF-697](https://vizzuality.atlassian.net/browse/LANDGRIF-697)
Added class with custom chunk save method for large inserts to avoid blocking
event loop

##  2022-06-10
### Added
Fixed [LANDGRIF-656](https://vizzuality.atlassian.net/browse/LANDGRIF-656)
Refactors code in order to allow indicator calculations to be treated more easily and in a modular way


##  2022-06-08
### Fixed
Fixed [LANDGRIF-713](https://vizzuality.atlassian.net/browse/LANDGRIF-713)
Filter available years for a impact layer by the received Material Id's children



##  2022-06-01
### Added
[LANDGRIF-683](https://vizzuality.atlassian.net/browse/LANDGRIF-683)
Add new Entity: ContextualLayers to keep track of magic h3 tables representing 
contextual layers. Related N to 1 to H3Data (H3 Master table)

##  2022-06-10
### Added
[LANDGRIF-705](https://vizzuality.atlassian.net/browse/LANDGRIF-705)
Add endpoint for location types with smart filters. Add location types options to
other smart filter endpoints.

## 2022-06-29
### Fixed

Fixed 
Impact table - fix filters when retrieving 'group by' entities for table skeleton

## 2022-06-30

### Updated (change of requirements)

Updated
Creating Scenario Intervention can cover only 1 material, business units and admin regions filters are not obligatory

## 2022-07-08

### Fixed

Fixed
Impact years endpoint - returns years for which sourcing record volumes are not 0


## 2022-07-11

### Fixed

Fixed
Update entity methods that build trees - filters descendants search moved to calling functions

## 2022-07-12

### Fixed

Fixed
Scenario Interventions - when creating new intervention of type new supplier location, replacing SLs with identical entities relations 
are grouped into one with tonnage accumulated

## 2022-07-13

### Fixed

Fixed
Scenario Interventions - fix conditional validations of inputs

## 2022-07-18

### Temporary fix

Fixed
Indicator record calculations - if production and harvest area values are less than 1,
related impact values are set to 0

## 2022-07-19

### Added

Added
Contextual Layers - Added different types of aggregation for Contextual Layers' H3 info depending on metadata



## 2022-07-19

### Fixed

Fixed
Scenario Interventions - comparison vs actual data, if year earlier than intervention start year is selected,
returninh 0 values for that year instead of error

Fixed
Scenario Interventions - status of intervetion can be updated, startYear is returned as part of get response


## 2022-07-19

### Fixed
Fixed
Entity trees - when there is no data in the Database, entity entity tree endpoint will return empty array
instead of 404 error



