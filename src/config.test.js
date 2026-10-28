import { readFileSync } from 'fs';
import path from 'path';

// read the shipped .env file directly, since a local .env.local can override the values config.js sees
const envFile = readFileSync(path.resolve(__dirname, '../.env'), 'utf8');

test('each dev setting in .env defaults to the setting with the same name', () => {
  const devDefaults = [...envFile.matchAll(/^(REACT_APP_\w+)_DEV=\$\{(REACT_APP_\w+)\}$/gm)];
  expect(devDefaults.length).toBeGreaterThan(0);
  devDefaults.forEach(([line, name, defaultName]) => {
    expect(defaultName, line).toBe(name);
  });
});
