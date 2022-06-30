# Changelog

All notable changes related to LandGriffon API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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

### Fixed

Fixed
Creating Scenario Intervention can cover only 1 material, business units and admin regions filters are not obligatory

