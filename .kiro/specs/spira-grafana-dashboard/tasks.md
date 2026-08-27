# Implementation Plan: Spira Grafana Dashboard

## Overview

Implement a proof-of-concept Grafana dashboard as code (JSON) that aggregates data from Spira's OData API, GitHub, and a weather API into a single unified view. The repository delivers dashboard and library panel JSON files importable via Grafana GitSync, along with Jest-based structural validation tests.

## Tasks

- [ ] 1. Set up project structure and testing framework
  - [x] 1.1 Create repository directory structure and initialize Node.js project
    - Create `dashboards/` and `library-panels/` directories
    - Initialize `package.json` with Jest as dev dependency
    - Create Jest configuration targeting JSON validation tests
    - Add npm scripts: `test` (structural validation), `validate` (schema check)
    - _Requirements: 5.1, 5.2, 5.6_

  - [ ] 1.2 Create JSON schema files for dashboard and library panel validation
    - Define a JSON schema for Grafana dashboard structure (schemaVersion 39, required top-level fields)
    - Define a JSON schema for library panel structure
    - Store schemas in a `schemas/` directory for test reference
    - _Requirements: 5.1, 5.3_

- [ ] 2. Implement Spira library panels
  - [ ] 2.1 Create requirements-status library panel JSON
    - Create `library-panels/requirements-status.json`
    - Define panel type as pie or bar chart
    - Configure Infinity datasource targeting `Spira-OData` by name
    - Set query to Spira OData `Requirements` entity set with `$select=RequirementId,RequirementStatusId&$filter=IsDeleted eq false`
    - Add field overrides to map RequirementStatusId values to labels (Requested, In Progress, Developed, Tested)
    - Set `noDataMessage` for zero-record handling
    - _Requirements: 6.1, 1.1, 1.3, 6.5_

  - [ ] 2.2 Create test-execution library panel JSON
    - Create `library-panels/test-execution.json`
    - Define panel type as pie or bar chart
    - Configure Infinity datasource targeting `Spira-OData` by name
    - Set query to Spira OData `TestRuns` entity set with `$select=TestRunId,ExecutionStatusId`
    - Add field overrides to map ExecutionStatusId values to labels (Passed, Failed, Blocked, Not Run)
    - Set `noDataMessage` for zero-record handling
    - _Requirements: 6.2, 1.3, 6.5_

  - [ ] 2.3 Create incident-trend library panel JSON
    - Create `library-panels/incident-trend.json`
    - Define panel type as time-series
    - Configure Infinity datasource targeting `Spira-OData` by name
    - Set query to Spira OData `Incidents` entity set with relevant date fields
    - Configure time range to 90 days showing open vs closed counts
    - Set `noDataMessage` for zero-record handling
    - _Requirements: 6.3, 1.3, 6.5_

  - [ ] 2.4 Create release-progress library panel JSON
    - Create `library-panels/release-progress.json`
    - Define panel type as gauge or bar chart
    - Configure Infinity datasource targeting `Spira-OData` by name
    - Set query to Spira OData `Releases` entity set filtered to Active status
    - Display percentage of requirements in completed status per release
    - Set `noDataMessage` for zero-record handling
    - _Requirements: 6.4, 1.3, 6.5_

- [ ] 3. Checkpoint - Verify library panels
  - Ensure all library panel JSON files are valid JSON and follow Grafana panel structure. Ask the user if questions arise.

- [ ] 4. Implement main dashboard JSON
  - [ ] 4.1 Create dashboard shell with metadata and templating
    - Create `dashboards/spira-combined.json`
    - Set dashboard title to "Spira Combined Lifecycle Dashboard"
    - Set `schemaVersion: 39`, tags `["spira", "lifecycle", "poc"]`
    - Set `timezone: "browser"`, time range `now-90d` to `now`, refresh `5m`
    - Add section heading row panels for "Project Health (Spira)", "Development Activity (GitHub)", "Supplementary Context"
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ] 4.2 Add Spira panels to the Project Health section
    - Reference library panels (requirements-status, test-execution, incident-trend, release-progress) or embed inline panels
    - Configure all Spira panels with `datasource: "Spira-OData"` (by name, not UID)
    - Set `gridPos` values so Spira panels appear at the top (lowest `y` values) below the section heading
    - Configure Infinity plugin query settings: type JSON, parser Backend, authentication via query params
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.2, 5.4, 6.1, 6.2, 6.3, 6.4_

  - [ ] 4.3 Add GitHub panels to the Development Activity section
    - Create commit activity panel (time-series, last 30 days)
    - Create pull requests panel (open/merged counts)
    - Create open issues panel (count or list)
    - Configure all GitHub panels with `datasource: "GitHub"` (by name, not UID)
    - Set `gridPos` values so GitHub panels are positioned below Spira section
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.2, 5.4_

  - [ ] 4.4 Add Weather panel to the Supplementary Context section
    - Create weather panel displaying temperature, condition description, and humidity
    - Configure Infinity datasource targeting `Weather-API` by name
    - Set query URL to OpenWeatherMap endpoint with city and units parameters
    - Set `gridPos` values so weather panel is positioned below GitHub section
    - Set `noDataMessage` for connection failure handling
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 4.2, 5.4_

- [ ] 5. Checkpoint - Verify dashboard structure
  - Ensure dashboard JSON is valid and all sections are correctly ordered. Ask the user if questions arise.

- [ ] 6. Create README documentation
  - [ ] 6.1 Write README.md with setup instructions
    - Document each required data source: name, plugin type, prerequisite configuration
    - List `Spira-OData` (yesoreyeram-infinity-datasource), `GitHub` (grafana-github-datasource), `Weather-API` (yesoreyeram-infinity-datasource)
    - Document authentication requirements for each data source
    - Document GitSync configuration steps
    - Describe the repository folder structure
    - _Requirements: 5.5, 5.3_

- [ ] 7. Implement structural validation tests
  - [ ] 7.1 Write Jest test: data source references use names not UIDs
    - Parse dashboard JSON and assert all `datasource` fields use name strings
    - Verify no hardcoded UIDs appear in datasource references
    - _Requirements: 5.4_

  - [ ] 7.2 Write Jest test: section ordering is correct
    - Assert Spira panels have lower `gridPos.y` than GitHub panels
    - Assert GitHub panels have lower `gridPos.y` than Supplementary panels
    - _Requirements: 4.2_

  - [ ] 7.3 Write Jest test: no individual theme overrides
    - Assert no panel contains per-panel color scheme overrides
    - _Requirements: 4.4_

  - [ ] 7.4 Write Jest test: single-page layout
    - Assert no tab or nested folder structures in the panels array
    - _Requirements: 4.1_

  - [ ] 7.5 Write Jest test: required panels exist
    - Assert panels for Requirements Status, Test Execution, Incident Trend, Release Progress are present
    - Assert panels for commits, PRs, issues are present
    - Assert at least one weather/supplementary panel is present
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 2.2, 3.1_

  - [ ] 7.6 Write Jest test: library panels directory and JSON validity
    - Assert `library-panels/` contains valid JSON files
    - Validate each file parses without error
    - _Requirements: 5.2_

  - [ ] 7.7 Write Jest test: no infrastructure files exist
    - Assert repository does not contain Dockerfile, docker-compose.yml, or terraform files
    - _Requirements: 5.6_

  - [ ] 7.8 Write Jest test: README documents all data sources
    - Assert README contains references to each required data source name and plugin type
    - _Requirements: 5.5_

  - [ ]* 7.9 Write JSON schema validation tests
    - Validate `dashboards/spira-combined.json` against dashboard schema
    - Validate each library panel JSON against library panel schema
    - _Requirements: 5.1, 5.3_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Run `npm test` and ensure all structural validation tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- No property-based tests are included — the design confirmed PBT is not appropriate for static JSON artifacts
- The testing strategy uses Jest structural assertions and JSON schema validation
- All data sources are referenced by name (not UID) for cross-instance portability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["4.1", "6.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9"] }
  ]
}
```
