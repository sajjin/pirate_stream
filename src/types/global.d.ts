export {};

declare global {
  interface Window {
    cookieSyncInterval?: NodeJS.Timer;
  }
}