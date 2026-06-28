"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { sendMagicLink } from "@/lib/auth";
import {
  getTurnstileSiteKey,
  isCaptchaConfigured,
  TURNSTILE_SCRIPT_URL,
} from "@/lib/auth/captcha";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/journey";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "auth_callback_failed"
      ? "Sign-in link expired or was invalid. Please request a new one."
      : null
  );
  const [captchaToken, setCaptchaToken] = useState<string | null>(
    isCaptchaConfigured() ? null : ""
  );
  const [scriptReady, setScriptReady] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isCaptchaConfigured() || !scriptReady || !turnstileRef.current) return;

    const siteKey = getTurnstileSiteKey();
    if (!siteKey || !window.turnstile) return;

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: (token) => setCaptchaToken(token),
      "error-callback": () => setCaptchaToken(null),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (isCaptchaConfigured() && !captchaToken) {
      setError("Please complete the verification check.");
      return;
    }

    setLoading(true);
    const result = await sendMagicLink(email, {
      captchaToken: captchaToken || undefined,
      next,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSent(true);
  };

  if (!isSupabaseConfigured()) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Local mode</CardTitle>
          <CardDescription>
            Supabase is not configured. The app uses browser storage only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonLink
            href={next}
            className="w-full justify-center bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
          >
            Continue without sign-in
          </ButtonLink>
        </CardContent>
      </Card>
    );
  }

  if (sent) {
    return (
      <Card className="border-teal-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10">
            <Mail className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a magic link to <strong>{email}</strong>. Click the link to
            sign in and save your LifeGPS progress to the cloud.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setSent(false)}
          >
            Use a different email
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {isCaptchaConfigured() && (
        <Script
          src={TURNSTILE_SCRIPT_URL}
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
      )}
      <Card className="border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/10 to-indigo-500/10">
            <Sparkles className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle>Sign in to LifeGPS</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a magic link — no password
            needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {isCaptchaConfigured() && (
              <div ref={turnstileRef} className="flex justify-center" />
            )}

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || (isCaptchaConfigured() && !captchaToken)}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send magic link"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing in you agree to use LifeGPS for self-reflection and
            personal growth.{" "}
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
