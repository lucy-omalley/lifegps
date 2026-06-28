"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import {
  enableLocalStorageOnly,
  ensureAuthenticatedUser,
  getExistingAuthUser,
} from "@/lib/auth";
import {
  getTurnstileSiteKey,
  isCaptchaConfigured,
  TURNSTILE_SCRIPT_URL,
} from "@/lib/auth/captcha";

type AuthState = "checking" | "captcha" | "ready";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("checking");
  const [scriptReady, setScriptReady] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const finishWithCaptchaToken = useCallback(async (token: string) => {
    const result = await ensureAuthenticatedUser({ captchaToken: token });
    if (result.status === "captcha_required") {
      setState("captcha");
      return;
    }
    setState("ready");
  }, []);

  const runInitialAuth = useCallback(async () => {
    const existing = await getExistingAuthUser();
    if (existing) {
      setState("ready");
      return;
    }

    if (isCaptchaConfigured()) {
      setState("captcha");
      return;
    }

    const result = await ensureAuthenticatedUser();
    if (result.status === "captcha_required") {
      setState("captcha");
      return;
    }
    setState("ready");
  }, []);

  useEffect(() => {
    void runInitialAuth();
  }, [runInitialAuth]);

  useEffect(() => {
    if (state !== "captcha" || !scriptReady || !turnstileRef.current) return;

    const siteKey = getTurnstileSiteKey();
    if (!siteKey || !window.turnstile) return;

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: (token) => {
        void finishWithCaptchaToken(token);
      },
      "error-callback": () => {
        setState("captcha");
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [state, scriptReady, finishWithCaptchaToken]);

  if (state === "checking") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (state === "captcha") {
    return (
      <>
        {isCaptchaConfigured() && (
          <Script
            src={TURNSTILE_SCRIPT_URL}
            strategy="afterInteractive"
            onReady={() => setScriptReady(true)}
          />
        )}
        <div className="flex min-h-full flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border/50 bg-card p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold">Verify to save your progress</h2>
            <p className="text-sm text-muted-foreground">
              Complete the check below to sign in and sync your LifeGPS data to
              the cloud.
            </p>
            {isCaptchaConfigured() ? (
              <div ref={turnstileRef} className="flex justify-center" />
            ) : (
              <div className="space-y-3 text-left text-sm text-muted-foreground">
                <p>
                  Supabase CAPTCHA is enabled but{" "}
                  <code className="text-xs">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>{" "}
                  is not set in your app.
                </p>
                <p>Choose one:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    Add Turnstile keys to Supabase Auth and{" "}
                    <code className="text-xs">.env.local</code>
                  </li>
                  <li>
                    Disable CAPTCHA under Supabase → Authentication → Bot and
                    Abuse Protection
                  </li>
                </ul>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
                  onClick={() => {
                    enableLocalStorageOnly();
                    setState("ready");
                  }}
                >
                  Continue with local storage only
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
