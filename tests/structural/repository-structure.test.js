const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

describe('Repository directory structure', () => {
  test('dashboards/ directory exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'dashboards'))).toBe(true);
  });

  test('library-panels/ directory exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'library-panels'))).toBe(true);
  });

  test('no infrastructure files exist (Dockerfile, docker-compose, terraform)', () => {
    const infraFiles = [
      'Dockerfile',
      'docker-compose.yml',
      'docker-compose.yaml',
      'main.tf',
      'terraform.tf',
    ];
    for (const file of infraFiles) {
      expect(fs.existsSync(path.join(ROOT, file))).toBe(false);
    }
  });
});
