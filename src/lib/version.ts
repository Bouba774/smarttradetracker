// App versioning system - automatically read from package.json at build time
// Version follows semantic versioning: Major.Minor.Patch
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Smart Trade Tracker';
export const BUILD_DATE = new Date().toISOString().split('T')[0];

export const getVersionString = () => `${APP_NAME} V${APP_VERSION}`;
export const getFullVersionInfo = () => ({
  name: APP_NAME,
  version: APP_VERSION,
  buildDate: BUILD_DATE,
  displayVersion: `V${APP_VERSION}`,
});
