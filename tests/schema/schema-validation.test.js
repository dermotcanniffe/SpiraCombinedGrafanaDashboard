const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.resolve(__dirname, '..', '..');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');
const DASHBOARD_FILE = path.join(ROOT, 'new-dashboard-2026-08-27-pql1i.json');
const LIBRARY_PANELS_DIR = path.join(ROOT, 'library-panels');

const ajv = new Ajv({ allErrors: true, strict: false });

describe('Dashboard schema validation', () => {
  let dashboardSchema;
  let dashboard;

  beforeAll(() => {
    dashboardSchema = JSON.parse(
      fs.readFileSync(path.join(SCHEMAS_DIR, 'dashboard-v2.schema.json'), 'utf8')
    );
    dashboard = JSON.parse(fs.readFileSync(DASHBOARD_FILE, 'utf8'));
  });

  test('dashboard JSON validates against v2 schema', () => {
    const validate = ajv.compile(dashboardSchema);
    const valid = validate(dashboard);
    if (!valid) {
      console.error('Dashboard validation errors:', JSON.stringify(validate.errors, null, 2));
    }
    expect(valid).toBe(true);
  });
});

describe('Library panel schema validation', () => {
  let libraryPanelSchema;
  let panelFiles;

  beforeAll(() => {
    libraryPanelSchema = JSON.parse(
      fs.readFileSync(path.join(SCHEMAS_DIR, 'library-panel.schema.json'), 'utf8')
    );
    panelFiles = fs.readdirSync(LIBRARY_PANELS_DIR).filter(f => f.endsWith('.json'));
  });

  test('library-panels directory has panel files', () => {
    expect(panelFiles.length).toBeGreaterThan(0);
  });

  test.each(['requirements-status.json', 'test-execution.json', 'incident-trend.json', 'release-progress.json'])(
    '%s validates against library panel schema',
    (filename) => {
      const panel = JSON.parse(
        fs.readFileSync(path.join(LIBRARY_PANELS_DIR, filename), 'utf8')
      );
      const validate = ajv.compile(libraryPanelSchema);
      const valid = validate(panel);
      if (!valid) {
        console.error(`${filename} validation errors:`, JSON.stringify(validate.errors, null, 2));
      }
      expect(valid).toBe(true);
    }
  );
});
