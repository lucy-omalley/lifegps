"use client";

import { useEffect, useState } from "react";

/** Renders formatted dates only on the client to avoid locale/timezone hydration mismatches. */
export function ClientDate({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    setFormatted(
      new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    );
  }, [iso]);

  return (
    <span className={className}>
      {formatted ? `Generated ${formatted}` : "Generated recently"}
    </span>
  );
}
