# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.3.0] - 2022-02-11
### Changed
- Improve parsing queryParameters

## [3.2.0] - 2021-11-11
### Added
- Added rawBody to rawData mapping
- Implemented new versions of API and API Response that don't hide errors any more

## [3.1.0] - 2021-05-21
### Added
- API Response now includes the client code to debug better on cloudwatch

## [3.0.0] - 2020-08-28
### Added
- GitHub Actions for build, coverage and publish

### Changed
- Updated `@janiscommerce/api` to `6.x.x`

## [2.1.1] - 2020-06-23
### Fixed
- Dependency bug fix

## [2.1.0] - 2020-06-23
### Changed
- Dependencies updated to provide support of `messageVariables` in error responses

## [2.0.0] - 2020-06-18
### Changed
- API upgraded to v5 (`api-session` validates locations) (**BREAKING CHANGE**)

## [1.5.0] - 2020-05-19
### Removed
- `package-lock.json` file

## [1.4.5] - 2020-04-16
### Changed
- Dependencies updated

## [1.4.4] - 2020-04-03
### Changed
- Dependencies updated

## [1.4.3] - 2020-01-21
### Changed
- Dependencies updated

## [1.4.2] - 2019-10-02
### Fixed
- Authorizer context is now JSON parsed

## [1.4.1] - 2019-10-02
### Fixed
- Docs serverless templates fixed

## [1.4.0] - 2019-10-02
### Added
- Lambda authorizer context handling (requires API v4.1.1+ to work properly)

## [1.3.2] - 2019-08-09
### Fixed
- Response template doc updated

## [1.3.1] - 2019-08-07
### Fixed
- README updated with new templates

## [1.3.0] - 2019-08-05
### Added
- Response headers and cookies support

## [1.2.3] - 2019-07-19
### Fixed
- Dependencies updated

## [1.2.2] - 2019-07-18
### Fixed
- Dependencies updated

## [1.2.1] - 2019-07-18
### Fixed
- Package and package lock synced

## [1.2.0] - 2019-07-15
### Changed
- Updated `api` package version

## [1.1.1] - 2019-07-11
### Fixed
- Enpoints starting with a slash are now being fixed

## [1.1.0] - 2019-07-11
### Added
- Endpoint variables are now replaced with it's values

### Fixed
- README usage fix

## [1.0.0] - 2019-07-11
### Added
- Package inited
- REST handler
- Tests
