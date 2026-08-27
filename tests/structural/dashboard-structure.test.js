const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DASHBOARD_FILE = path.join(ROOT, 'new-dashboard-2026-08-27-pql1i.json');

let dashboard;

beforeAll(() => {
  const raw = fs.readFileSync(DASHBOARD_FILE, 'utf8');
  dashboard = JSON.parse(raw);
});

describe('Dashboard data source references use names not UIDs', () => {
  test('all panel datasource references use name field', () => {
    const elements = dashboard.spec.elements;
    for (const [key, element] of Object.entries(elements)) {
      const queries = element.spec.data?.spec?.queries || [];
      for (const q of queries) {
        const ds = q.spec?.query?.datasource;
        if (ds) {
          expect(ds).toHaveProperty('name');
          expect(ds.name).toBeTruthy();
          // Should not have a uid that looks like a generated Grafana UID
          if (ds.uid) {
            // Allow name-based UIDs but not random hashes
            expect(ds.uid).not.toMatch(/^[a-z0-9]{15,}$/);
          }
        }
      }
    }
  });
});

describe('Section ordering is correct', () => {
  test('Spira panels have lower y than GitHub panels', () => {
    const layout = dashboard.spec.layout.spec.items;
    const getY = (name) => {
      const item = layout.find(i => i.spec.element.name === name);
      return item ? item.spec.y : null;
    };

    const spiraHeaderY = getY('spira-section-header');
    const githubHeaderY = getY('github-section-header');

    expect(spiraHeaderY).not.toBeNull();
    expect(githubHeaderY).not.toBeNull();
    expect(spiraHeaderY).toBeLessThan(githubHeaderY);
  });

  test('GitHub panels have lower y than Supplementary panels', () => {
    const layout = dashboard.spec.layout.spec.items;
    const getY = (name) => {
      const item = layout.find(i => i.spec.element.name === name);
      return item ? item.spec.y : null;
    };

    const githubHeaderY = getY('github-section-header');
    const suppHeaderY = getY('supplementary-section-header');

    expect(githubHeaderY).not.toBeNull();
    expect(suppHeaderY).not.toBeNull();
    expect(githubHeaderY).toBeLessThan(suppHeaderY);
  });
});

describe('No individual theme overrides', () => {
  test('no panel contains per-panel color scheme override that conflicts with dashboard theme', () => {
    const elements = dashboard.spec.elements;
    for (const [key, element] of Object.entries(elements)) {
      const vizSpec = element.spec.vizConfig?.spec;
      if (vizSpec?.fieldConfig?.defaults?.color) {
        // Panels can use palette-classic, continuous-*, or fixed colors
        // but should not override the dashboard-wide theme (dark/light)
        const colorMode = vizSpec.fieldConfig.defaults.color.mode;
        expect(colorMode).not.toBe('dark');
        expect(colorMode).not.toBe('light');
      }
    }
  });
});

describe('Single-page layout', () => {
  test('dashboard uses GridLayout (no tabs or nested folders)', () => {
    expect(dashboard.spec.layout.kind).toBe('GridLayout');
  });

  test('no element references tab or nested page structures', () => {
    const elements = dashboard.spec.elements;
    for (const [key, element] of Object.entries(elements)) {
      expect(element.kind).toBe('Panel');
      // Ensure no element is a "tab" or "page" kind
      expect(element.kind).not.toBe('Tab');
      expect(element.kind).not.toBe('Page');
    }
  });
});

describe('Required panels exist', () => {
  const elementKeys = () => Object.keys(dashboard.spec.elements);

  test('Requirements Status panel exists', () => {
    expect(elementKeys()).toContain('requirements-status');
  });

  test('Test Execution panel exists', () => {
    expect(elementKeys()).toContain('test-execution');
  });

  test('Incident Trend panel exists', () => {
    expect(elementKeys()).toContain('incident-trend');
  });

  test('Release Progress panel exists', () => {
    expect(elementKeys()).toContain('release-progress');
  });

  test('GitHub Commits panel exists', () => {
    expect(elementKeys()).toContain('github-commits');
  });

  test('GitHub Pull Requests panel exists', () => {
    expect(elementKeys()).toContain('github-pull-requests');
  });

  test('GitHub Issues panel exists', () => {
    expect(elementKeys()).toContain('github-issues');
  });

  test('Weather/Supplementary panel exists', () => {
    expect(elementKeys()).toContain('weather-current');
  });
});

describe('Library panels directory and JSON validity', () => {
  const libraryDir = path.join(ROOT, 'library-panels');

  test('library-panels directory contains JSON files', () => {
    const files = fs.readdirSync(libraryDir).filter(f => f.endsWith('.json'));
    expect(files.length).toBeGreaterThan(0);
  });

  test('each library panel file is valid JSON', () => {
    const files = fs.readdirSync(libraryDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(libraryDir, file), 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    }
  });
});

describe('No infrastructure files exist', () => {
  const infraFiles = [
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    'main.tf',
    'terraform.tf',
    'terraform.tfvars',
  ];

  test.each(infraFiles)('%s does not exist', (file) => {
    expect(fs.existsSync(path.join(ROOT, file))).toBe(false);
  });
});

describe('README documents all data sources', () => {
  let readme;

  beforeAll(() => {
    readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  });

  test('README references Spira-OData data source', () => {
    expect(readme).toContain('Spira-OData');
  });

  test('README references yesoreyeram-infinity-datasource plugin', () => {
    expect(readme).toContain('yesoreyeram-infinity-datasource');
  });

  test('README references GitHub data source', () => {
    expect(readme).toContain('GitHub');
  });

  test('README references grafana-github-datasource plugin', () => {
    expect(readme).toContain('grafana-github-datasource');
  });

  test('README references Weather-API data source', () => {
    expect(readme).toContain('Weather-API');
  });
});
