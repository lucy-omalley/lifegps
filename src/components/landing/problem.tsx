import { CloudFog } from "lucide-react";

export function Problem() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <CloudFog className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          You know you want more from life, but the path feels unclear.
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Burnout. Career crossroads. Unfulfilled dreams. You&apos;re not alone —
          millions of professionals feel stuck between where they are and where
          they want to be. The gap isn&apos;t ambition. It&apos;s a lack of
          direction.
        </p>
      </div>
    </section>
  );
}
