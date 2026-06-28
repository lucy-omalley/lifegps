/** Cloudflare Turnstile site key — must match the secret configured in Supabase Auth. */
export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

export function isCaptchaConfigured(): boolean {
  return Boolean(getTurnstileSiteKey());
}

export function isCaptchaError(message?: string): boolean {
  if (!message) return false;
  return message.toLowerCase().includes("captcha");
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
