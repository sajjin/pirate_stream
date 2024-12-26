import {
  APP_VERSION,
  BACKEND_URL,
  DISCORD_LINK,
  DONATION_LINK,
  FACEBOOK_LINK,
  GITHUB_LINK,
  INSTAGRAM_LINK,
} from "./constants";

interface Config {
  APP_VERSION: string;
  GITHUB_LINK: string;
  DONATION_LINK: string;
  DISCORD_LINK: string;
  FACEBOOK_LINK: string;
  INSTAGRAM_LINK: string;
  HLSCONVERTER_URL: string;
  DMCA_EMAIL: string;
  TMDB_READ_API_KEY: string;
  CORS_PROXY_URL: string;
  NORMAL_ROUTER: boolean;
  BACKEND_URL: string;
  DISALLOWED_IDS: string;
  TURNSTILE_KEY: string;
  CDN_REPLACEMENTS: string;
  HAS_ONBOARDING: string;
  ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: string;
  ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: string;
  ONBOARDING_PROXY_INSTALL_LINK: string;
  ALLOW_AUTOPLAY: boolean;
}

export interface RuntimeConfig {
  APP_VERSION: string;
  GITHUB_LINK: string;
  DONATION_LINK: string;
  DISCORD_LINK: string;
  FACEBOOK_LINK: string;
  INSTAGRAM_LINK: string;
  HLSCONVERTER_URL: string;
  DMCA_EMAIL: string | null;
  TMDB_READ_API_KEY: string | null;
  NORMAL_ROUTER: boolean;
  PROXY_URLS: string[];
  BACKEND_URL: string | null;
  DISALLOWED_IDS: string[];
  TURNSTILE_KEY: string | null;
  CDN_REPLACEMENTS: Array<string[]>;
  HAS_ONBOARDING: boolean;
  ALLOW_AUTOPLAY: boolean;
  ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: string | null;
  ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: string | null;
  ONBOARDING_PROXY_INSTALL_LINK: string | null;
}

const env: Record<keyof Config, undefined | string> = {
  TMDB_READ_API_KEY: process.env.TMDB_READ_API_KEY,
  APP_VERSION: undefined,
  GITHUB_LINK: undefined,
  DONATION_LINK: undefined,
  DISCORD_LINK: undefined,
  FACEBOOK_LINK: undefined,
  INSTAGRAM_LINK: undefined,
  HLSCONVERTER_URL: process.env.HLSCONVERTER_URL,
  ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: process.env.ONBOARDING_CHROME_EXTENSION_INSTALL_LINK,
  ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: process.env.ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK,
  ONBOARDING_PROXY_INSTALL_LINK: process.env.ONBOARDING_PROXY_INSTALL_LINK,
  DMCA_EMAIL: process.env.DMCA_EMAIL,
  CORS_PROXY_URL: process.env.CORS_PROXY_URL,
  NORMAL_ROUTER: process.env.NORMAL_ROUTER,
  BACKEND_URL: process.env.BACKEND_URL,
  DISALLOWED_IDS: process.env.DISALLOWED_IDS,
  TURNSTILE_KEY: process.env.TURNSTILE_KEY,
  CDN_REPLACEMENTS: process.env.CDN_REPLACEMENTS,
  HAS_ONBOARDING: process.env.HAS_ONBOARDING,
  ALLOW_AUTOPLAY: process.env.ALLOW_AUTOPLAY,
};

function coerceUndefined(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (value.length === 0) return undefined;
  return value;
}

// loads from environment variables first, then falls back to window config if needed
function getKeyValue(key: keyof Config): string | undefined {
  const windowValue = (window as any)?.__CONFIG__?.[key];
  return coerceUndefined(env[key]) ?? coerceUndefined(windowValue) ?? undefined;
}

function getKey(key: keyof Config): string | null;
function getKey(key: keyof Config, defaultString: string): string;
function getKey(key: keyof Config, defaultString?: string): string | null {
  return getKeyValue(key)?.toString() ?? defaultString ?? null;
}

export function conf(): RuntimeConfig {
  return {
    APP_VERSION,
    GITHUB_LINK,
    DONATION_LINK,
    DISCORD_LINK,
    FACEBOOK_LINK,
    INSTAGRAM_LINK,
    HLSCONVERTER_URL: getKey(
      "HLSCONVERTER_URL",
      "https://hlsdownload.vidbinge.com",
    ),
    DMCA_EMAIL: getKey("DMCA_EMAIL"),
    ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: getKey(
      "ONBOARDING_CHROME_EXTENSION_INSTALL_LINK",
      "https://chromewebstore.google.com/detail/movie-web-extension/hoffoikpiofojilgpofjhnkkamfnnhmm",
    ),
    ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: getKey(
      "ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK",
      "https://addons.mozilla.org/en-GB/firefox/addon/movie-web-extension",
    ),
    ONBOARDING_PROXY_INSTALL_LINK: getKey("ONBOARDING_PROXY_INSTALL_LINK"),
    BACKEND_URL: getKey("BACKEND_URL", BACKEND_URL),
    TMDB_READ_API_KEY: getKey("TMDB_READ_API_KEY"),
    PROXY_URLS: getKey("CORS_PROXY_URL", "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0),
    NORMAL_ROUTER: getKey("NORMAL_ROUTER", "false") === "true",
    HAS_ONBOARDING: getKey("HAS_ONBOARDING", "true") === "true",
    ALLOW_AUTOPLAY: getKey("ALLOW_AUTOPLAY", "false") === "true",
    TURNSTILE_KEY: getKey("TURNSTILE_KEY"),
    DISALLOWED_IDS: getKey("DISALLOWED_IDS", "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0),
    CDN_REPLACEMENTS: getKey("CDN_REPLACEMENTS", "")
      .split(",")
      .map((v) =>
        v
          .split(":")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      )
      .filter((v) => v.length === 2),
  };
}