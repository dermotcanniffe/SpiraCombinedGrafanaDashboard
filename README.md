# Spira Combined Grafana Dashboard

A proof-of-concept Grafana dashboard that aggregates data from Spira's OData API, GitHub, and a Weather API into a single unified view of project lifecycle fitness. Demonstrates Grafana's multi-source data aggregation as an alternative to PowerBI.

## Dashboard Overview

The dashboard is organized into three sections:

1. **Project Health (Spira)** - Requirements status, test execution results, incident trends, and release progress from Spira OData
2. **Development Activity (GitHub)** - Commit history, pull requests, and open issues from a configured GitHub repository
3. **Supplementary Context** - Current weather data demonstrating arbitrary external data source integration

## Repository Structure

```
.
├── new-dashboard-2026-08-27-pql1i.json   # Main dashboard (Grafana v2 resource format)
├── library-panels/                        # Reusable panel definitions (classic format)
│   ├── requirements-status.json
│   ├── test-execution.json
│   ├── incident-trend.json
│   └── release-progress.json
├── schemas/                               # JSON schemas for validation
│   ├── dashboard-v2.schema.json
│   └── library-panel.schema.json
├── tests/                                 # Jest structural validation tests
│   ├── structural/
│   └── schema/
├── package.json
└── README.md
```

## Required Data Sources

The following data sources must be configured in your Grafana instance before importing this dashboard:

| Data Source Name | Plugin Type | Description |
|-----------------|-------------|-------------|
| `Spira-OData` | `yesoreyeram-infinity-datasource` | Connects to Spira's OData API for project management data |
| `GitHub` | `grafana-github-datasource` | Connects to GitHub REST/GraphQL API for repository activity |
| `Weather-API` | `yesoreyeram-infinity-datasource` | Connects to OpenWeatherMap API for weather data |

### Spira-OData Configuration

- **Plugin**: Infinity (yesoreyeram-infinity-datasource)
- **Base URL**: `https://{instance}.spiraservice.net/api/odata/{project_id}`
- **Authentication**: Username and API key passed as query parameters
  - `username` = your Spira username
  - `api-key` = your Spira RSS token / API key

### GitHub Configuration

- **Plugin**: GitHub (grafana-github-datasource)
- **Authentication**: Personal Access Token with `repo` scope
- **Repository**: Configured via dashboard variables (`github_owner` and `github_repo`)

### Weather-API Configuration

- **Plugin**: Infinity (yesoreyeram-infinity-datasource)
- **Base URL**: `https://api.openweathermap.org/data/2.5`
- **Authentication**: API key passed via the `weather_api_key` dashboard variable
- **Sign up**: Free tier at [openweathermap.org](https://openweathermap.org/api)

## Git Sync Setup

This repository is designed for use with Grafana Git Sync (GA in Grafana 13):

1. Navigate to **Administration > General > Provisioning** in your Grafana instance
2. Connect this repository using Git Sync
3. Set the sync path to the repository root (the dashboard JSON lives at the top level)
4. Ensure all three data sources listed above are pre-configured in your instance
5. The dashboard will appear as a provisioned resource once sync completes

The dashboard uses the `dashboard.grafana.app/v2` format which is native to Grafana 13.

## Dashboard Variables

The dashboard includes configurable template variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `github_owner` | `inflectra` | GitHub repository owner/organization |
| `github_repo` | `spira` | GitHub repository name |
| `weather_city` | `Dublin` | City for weather data |
| `weather_api_key` | *(hidden)* | OpenWeatherMap API key |

## Development

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run structural validation tests

```bash
npm test
```

### Run schema validation tests

```bash
npm run validate
```

## Notes

- All data sources are referenced by **name** (not UID) for cross-instance portability
- The dashboard renders gracefully when individual data sources are unavailable — affected panels show error/no-data states without crashing the overall view
- Library panel files in `library-panels/` serve as reusable reference definitions in classic Grafana format
- No infrastructure files (Dockerfile, docker-compose, Terraform) are included — this is purely dashboard-as-code
