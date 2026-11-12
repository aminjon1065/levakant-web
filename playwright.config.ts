import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT || 3100);
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`;
// Local runs may reuse an already installed Chromium instead of downloading one.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;
const launchOptions = {
  executablePath,
  // software WebGL so the 3D scenes render in headless runs
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
};

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'retain-on-failure', reducedMotion: 'reduce' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions }, grepInvert: /@phone|@tablet/ },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1112 }, launchOptions }, grep: /@all|@tablet/ },
    { name: 'phone', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, launchOptions }, grep: /@all|@phone/ },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: `pnpm start -p ${PORT}`, port: PORT, reuseExistingServer: true, timeout: 120_000 },
});
