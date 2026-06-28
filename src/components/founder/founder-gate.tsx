"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
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

const STORAGE_KEY = "lifegps_founder_email";

export function useFounderEmail() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(sessionStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  const saveEmail = (value: string) => {
    sessionStorage.setItem(STORAGE_KEY, value);
    setEmail(value);
  };

  return { email, saveEmail };
}

interface FounderGateProps {
  onAuthenticated: (email: string) => void;
}

export function FounderGate({ onAuthenticated }: FounderGateProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, input.trim());
    onAuthenticated(input.trim());
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20">
          <Shield className="h-6 w-6 text-teal-600" />
        </div>
        <CardTitle>Founder Access</CardTitle>
        <CardDescription>
          Enter your admin email to access the LifeGPS Founder Agent.
          {/* TODO: Replace with Supabase Auth role check before production */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="founder-email">Admin email</Label>
            <Input
              id="founder-email"
              type="email"
              placeholder="founder@yourcompany.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Access Founder Agent
          </Button>
          <p className="text-xs text-muted-foreground">
            Local dev: works without ADMIN_EMAIL set. Production: must match{" "}
            <code className="rounded bg-muted px-1">ADMIN_EMAIL</code> env var.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function getFounderHeaders(email: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-founder-email": email,
  };
}
