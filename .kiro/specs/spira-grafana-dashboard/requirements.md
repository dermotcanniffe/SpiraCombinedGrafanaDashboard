# Requirements Document

## Introduction

A proof-of-concept Grafana dashboard that demonstrates how Spira's OData API can be leveraged as a primary data source alongside other external data sources (GitHub, Confluence, weather) to present a combined, meaningful overview of project lifecycle fitness. The dashboard aims to show the power of multi-source data aggregation in Grafana as an alternative to PowerBI.

## Glossary

- **Dashboard**: The Grafana dashboard instance that displays combined visualizations from multiple data sources
- **Spira_OData_Source**: The OData API endpoint exposed by Inflectra Spira for querying project management data (requirements, test cases, incidents, releases)
- **GitHub_Source**: The GitHub REST/GraphQL API used to pull repository activity data (commits, pull requests, issues)
- **Confluence_Source**: The Atlassian Confluence REST API used to pull documentation and knowledge base metrics
- **Weather_Source**: A public weather API used to demonstrate arbitrary external data source integration
- **Panel**: An individual visualization widget within the Grafana dashboard
- **Data_Source_Plugin**: A Grafana plugin that enables connection to a specific external data provider
- **Repository**: This Git repository containing dashboard JSON definitions and library panel files for import via GitSync
- **GitSync**: Grafana's feature that synchronizes dashboard and library panel definitions from a Git repository into a running Grafana instance
- **Library_Panel**: A reusable Grafana panel definition stored separately and referenced by dashboards, enabling shared visualizations

## Requirements

### Requirement 1: Spira OData Data Source Configuration

**User Story:** As a project manager, I want the dashboard to connect to Spira via OData, so that I can visualize project lifecycle data from Spira in Grafana.

#### Acceptance Criteria

1. THE Dashboard SHALL connect to the Spira_OData_Source using the Infinity data source plugin for Grafana, configured with a base URL pointing to the Spira OData endpoint (e.g., `https://{instance}.spiraservice.net/api/odata/{project_id}`)
2. WHEN the Spira_OData_Source connection is configured, THE Dashboard SHALL authenticate using a username and API key passed as query parameters or headers as required by the Spira OData API
3. WHEN the Spira_OData_Source is queried, THE Dashboard SHALL retrieve data from the Requirements, Incidents, TestCases, and Releases OData entity sets
4. IF the Spira_OData_Source connection fails or returns a non-200 HTTP status, THEN THE Dashboard SHALL display the Grafana default "No data" or error state on affected panels without crashing the overall dashboard

### Requirement 2: GitHub Data Source Integration

**User Story:** As a development lead, I want to see GitHub repository activity alongside Spira data, so that I can correlate development activity with project management artifacts.

#### Acceptance Criteria

1. THE Dashboard SHALL connect to the GitHub_Source using the GitHub data source plugin for Grafana, authenticated via a personal access token
2. WHEN the GitHub_Source is configured, THE Dashboard SHALL retrieve commit history for the most recent 30 days, open and merged pull request counts, and open issue counts from a specified repository
3. WHEN GitHub data is displayed, THE Dashboard SHALL present it in the Development Activity section of the dashboard layout, positioned below the Project Health (Spira) section
4. IF the GitHub_Source connection fails or returns an authentication error, THEN THE Dashboard SHALL display the Grafana default error state on affected GitHub panels without impacting Spira or Supplementary Context panels

### Requirement 3: Additional Data Source Integration (Confluence or Weather)

**User Story:** As a stakeholder, I want at least one additional data source beyond Spira and GitHub, so that the proof-of-concept demonstrates Grafana's ability to pool data from diverse sources.

#### Acceptance Criteria

1. THE Dashboard SHALL integrate at least one additional data source beyond the Spira_OData_Source and GitHub_Source, configured via a Grafana Data_Source_Plugin
2. WHERE the Confluence_Source is selected, THE Dashboard SHALL retrieve and display the total page count and the most recent page update timestamp for a configured Confluence space
3. WHERE the Weather_Source is selected, THE Dashboard SHALL retrieve current temperature, weather condition description, and humidity for a single configured location and display them in a panel within the Supplementary Context section
4. WHEN additional source data is displayed, THE Dashboard SHALL present it in the Supplementary Context section of the dashboard layout as one or more dedicated panels
5. IF the additional data source connection fails, THEN THE Dashboard SHALL display a clear error indicator on the affected panels without impacting Spira_OData_Source or GitHub_Source panels

### Requirement 4: Combined Dashboard Layout

**User Story:** As a project manager, I want all data sources presented in a single unified dashboard view, so that I can get a holistic picture of project lifecycle fitness at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL display all data source panels in a single scrollable page layout without requiring navigation between tabs or separate pages
2. THE Dashboard SHALL organize panels into sections appearing in top-to-bottom order: Project Health (Spira), Development Activity (GitHub), and Supplementary Context (additional sources), with each section preceded by a visible section heading row
3. WHEN the Dashboard is loaded, THE Dashboard SHALL render all panels within 10 seconds given network connectivity to all configured data sources
4. THE Dashboard SHALL apply a single Grafana theme across all panels such that no panel uses an individually overridden color scheme
5. IF one or more data source connections are unavailable, THEN THE Dashboard SHALL still render the remaining sections and panels, displaying error indicators only on the affected panels

### Requirement 5: Dashboard-as-Code Repository for GitSync

**User Story:** As a developer, I want the dashboard and library panels stored as code in this repository, so that they can be imported into an existing Grafana instance via GitSync.

#### Acceptance Criteria

1. THE Repository SHALL store dashboard definitions as JSON files in a folder structure compatible with Grafana GitSync discovery conventions
2. THE Repository SHALL store reusable library panels as separate JSON files in a dedicated `library-panels` directory at the repository root
3. WHEN a Grafana instance is configured with GitSync pointing to this repository, THE Dashboard SHALL load and render all panels without errors, provided the required data sources are pre-configured in that instance
4. THE Dashboard JSON files SHALL reference data sources by name rather than by instance-specific UID, so that imports function across different Grafana instances
5. THE Repository SHALL include a README or documentation file listing each required data source by name, plugin type, and any prerequisite configuration that must exist in the target Grafana instance prior to import
6. THE Repository SHALL not include Grafana server configuration, Docker setup, or infrastructure deployment files

### Requirement 6: Spira Lifecycle Metrics Visualization

**User Story:** As a project manager, I want to see key Spira lifecycle metrics visualized, so that I can assess requirement coverage, testing progress, and defect trends.

#### Acceptance Criteria

1. WHEN Spira data is loaded, THE Dashboard SHALL display a requirements status breakdown panel showing counts grouped by RequirementStatusId (mapped to labels: Requested, In Progress, Developed, Tested)
2. WHEN Spira data is loaded, THE Dashboard SHALL display a test execution results panel showing counts of test runs grouped by execution status (Passed, Failed, Blocked, Not Run)
3. WHEN Spira data is loaded, THE Dashboard SHALL display an incident trend panel showing the count of open versus closed incidents over the most recent 90 days, plotted on a time-series axis
4. WHEN Spira data is loaded, THE Dashboard SHALL display a release progress panel showing percentage of requirements in a completed status relative to total requirements assigned, for each release with a status of Active
5. IF a Spira OData entity set returns zero records, THEN THE affected panel SHALL display a "No data" message rather than rendering an empty or broken chart
